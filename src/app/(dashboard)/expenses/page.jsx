'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { exportFinancesToExcel } from '@/lib/excel';
import { getLocalDateStr } from '@/lib/finance';
import { createClient } from '@/lib/supabase/client';
import PageTabs from '@/components/ui/PageTabs';
import Icon from '@/components/ui/Icon';

const VALID_TYPE_TABS = ['all', 'income', 'expense'];

// Reads ?tab= so the sidebar "Keuangan" dropdown links land on the right
// filter. Split out because useSearchParams() requires a Suspense boundary.
function TabFromQuery({ onTab, onCategoryReset }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && VALID_TYPE_TABS.includes(tab)) {
      onTab(tab);
      onCategoryReset();
    }
  }, [searchParams, onTab, onCategoryReset]);
  return null;
}

function formatRupiah(amount) {
  const cleanAmount = Math.round(Number(amount || 0));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanAmount);
}

// Selectable when creating a NEW income entry. Deliberately excludes
// rental_income: motor rental revenue is already tracked automatically
// from the Transaksi (booking) system, so offering it here would let
// someone double-log it and inflate the Dashboard's total revenue.
// This is for income *outside* that flow — tips-equivalent income like
// add-on fees, delivery charges, or a forfeited deposit.
const INCOME_CATEGORIES = {
  deposit_forfeit: { label: 'Klaim Deposit / Denda Damage', icon: 'fa-solid fa-shield-halved', color: '#1E40AF' },
  addon_services: { label: 'Layanan Tambahan (Helm / Jas Hujan)', icon: 'fa-solid fa-headset', color: '#3B82F6' },
  delivery_fee: { label: 'Biaya Antar-Jemput Motor', icon: 'fa-solid fa-truck-ramp-box', color: '#1D4ED8' },
  other_income: { label: 'Pemasukan Lain-lain (mis. Tip)', icon: 'fa-solid fa-sack-dollar', color: '#1D4ED8' },
};

// Full set including rental_income — kept only so any pre-existing
// historical entry with that category (from before this change) still
// displays with a proper label and can be filtered/found, not for
// selecting on new entries. See INCOME_CATEGORIES above for that.
const ALL_INCOME_CATEGORIES_FOR_DISPLAY = {
  rental_income: { label: 'Pendapatan Sewa Motor (Legacy)', icon: 'fa-solid fa-file-invoice-dollar', color: '#1D4ED8' },
  ...INCOME_CATEGORIES,
};

const EXPENSE_CATEGORIES = {
  service: { label: 'Servis & Perawatan', icon: 'fa-solid fa-wrench', color: '#1E3A8A' },
  sparepart: { label: 'Suku Cadang / Sparepart', icon: 'fa-solid fa-gear', color: '#1E40AF' },
  fuel: { label: 'Bahan Bakar', icon: 'fa-solid fa-gas-pump', color: '#1E40AF' },
  salary: { label: 'Gaji Karyawan', icon: 'fa-solid fa-user-tie', color: '#1D4ED8' },
  other: { label: 'Pengeluaran Lain-lain', icon: 'fa-solid fa-receipt', color: '#64748B' },
};

const checkIsIncome = (item) => {
  if (!item) return false;
  if (item.type === 'income') return true;
  if (typeof item.category === 'string' && (item.category.startsWith('income_') || item.category.includes('income'))) return true;
  return false;
};

const getCleanCategoryKey = (cat) => {
  if (!cat) return 'other';
  return cat.replace(/^income_/, '');
};

const getCategoryMeta = (cat, isIncome = false) => {
  const cleanKey = getCleanCategoryKey(cat);
  if (isIncome) {
    return ALL_INCOME_CATEGORIES_FOR_DISPLAY[cleanKey] || { label: 'Pemasukan Lain-lain', icon: 'fa-solid fa-sack-dollar', color: '#1D4ED8' };
  }
  return EXPENSE_CATEGORIES[cleanKey] || { label: 'Pengeluaran Lain-lain', icon: 'fa-solid fa-receipt', color: '#1E3A8A' };
};

const SQL_MIGRATION = `-- Jalankan SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eedrziblypwrufdzctvd/sql/new

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'expense';
UPDATE expenses SET type = 'expense' WHERE type IS NULL;
`;

// ===== FINANCIAL MODAL (PEMASUKAN & PENGELUARAN) =====
function FinanceModal({ isOpen, onClose, onSubmit, editData, defaultType = 'expense' }) {
  const [form, setForm] = useState({
    type: 'expense',
    title: '',
    // Default 'Lain-lain': sebelumnya default 'Servis' membuat gojek/makan/gaji
    // tercatat sebagai biaya servis.
    categoryKey: 'other',
    amount: '',
    expense_date: getLocalDateStr(),
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Defer ke microtask: hindari setState sinkron di dalam effect
    Promise.resolve().then(() => {
      if (editData) {
        const isInc = checkIsIncome(editData);
        setForm({
          type: isInc ? 'income' : 'expense',
          title: editData.title || '',
          categoryKey: getCleanCategoryKey(editData.category),
          amount: editData.amount || '',
          expense_date: editData.expense_date || getLocalDateStr(),
          notes: editData.notes || '',
        });
      } else {
        setForm({
          type: defaultType,
          title: '',
          categoryKey: defaultType === 'income' ? 'other_income' : 'other',
          amount: '',
          expense_date: getLocalDateStr(),
          notes: '',
        });
      }
    });
  }, [editData, isOpen, defaultType]);

  const handleTypeSwitch = (newType) => {
    setForm(prev => ({
      ...prev,
      type: newType,
      categoryKey: newType === 'income' ? 'other_income' : 'other'
    }));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isInc = form.type === 'income';
    const finalCategory = isInc ? `income_${form.categoryKey}` : form.categoryKey;

    await onSubmit({
      type: form.type,
      title: form.title,
      category: finalCategory,
      amount: Math.round(Number(String(form.amount || 0).replace(/[,.]/g, ''))) || 0,
      expense_date: form.expense_date,
      notes: form.notes
    });

    setLoading(false);
  };

  if (!isOpen) return null;

  const isIncome = form.type === 'income';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ color: isIncome ? '#1D4ED8' : '#1E3A8A' }}>
              {editData ? (
                <><Icon fa="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }} /> Edit Transaksi Keuangan</>
              ) : isIncome ? (
                <><Icon fa="fa-solid fa-circle-arrow-down" style={{ marginRight: '6px' }} /> Tambah Pemasukan Baru</>
              ) : (
                <><Icon fa="fa-solid fa-circle-arrow-up" style={{ marginRight: '6px' }} /> Tambah Pengeluaran Baru</>
              )}
            </div>
            <div className="modal-subtitle">Isi data transaksi arus kas usaha Boss Rent</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TYPE TOGGLE SWITCH */}
          <div className="form-group mb-4">
            <label className="form-label">
              <Icon fa="fa-solid fa-right-left" style={{ marginRight: '6px' }} /> Jenis Transaksi Keuangan <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => handleTypeSwitch('income')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: `2px solid ${isIncome ? '#1D4ED8' : 'var(--bg-border)'}`,
                  background: isIncome ? 'rgba(29,78,216, 0.15)' : 'var(--bg-elevated)',
                  color: isIncome ? '#1D4ED8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Icon fa="fa-solid fa-circle-arrow-down" style={{ fontSize: '15px' }} />
                Pemasukan (+)
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => handleTypeSwitch('expense')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: `2px solid ${!isIncome ? '#1E3A8A' : 'var(--bg-border)'}`,
                  background: !isIncome ? 'rgba(30,58,138, 0.15)' : 'var(--bg-elevated)',
                  color: !isIncome ? '#1E3A8A' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Icon fa="fa-solid fa-circle-arrow-up" style={{ fontSize: '15px' }} />
                Pengeluaran (-)
              </button>
            </div>
          </div>

          {isIncome && !editData && (
            <div className="alert alert-info" style={{ marginBottom: '16px', fontSize: '12.5px', lineHeight: 1.6 }}>
              <Icon fa="fa-solid fa-circle-info" style={{ marginTop: '1px' }} />
              <span>
                Pendapatan sewa motor sudah otomatis tercatat lewat menu <strong>Transaksi</strong>. Gunakan
                form ini hanya untuk pemasukan di luar itu — misalnya tip, biaya antar-jemput, atau klaim
                deposit — supaya total pendapatan di Dashboard tidak terhitung dobel.
              </span>
            </div>
          )}

          {!isIncome && !editData && (
            <div className="alert alert-info" style={{ marginBottom: '16px', fontSize: '12.5px', lineHeight: 1.6 }}>
              <Icon fa="fa-solid fa-circle-info" style={{ marginTop: '1px' }} />
              <span>
                Gunakan form ini untuk biaya operasional usaha — servis motor, suku cadang, bahan bakar,
                atau gaji karyawan. Untuk pengeluaran terkait motor tertentu, catat di sini agar bisa
                muncul di riwayat perawatan motor tersebut.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="fin-title">
              <Icon fa="fa-solid fa-file-signature" style={{ marginRight: '6px' }} /> Keterangan Transaksi <span className="required">*</span>
            </label>
            <input
              id="fin-title"
              name="title"
              type="text"
              className="form-control"
              placeholder={isIncome ? 'e.g. Sewa Helm Tambahan & Jas Hujan Turis' : 'e.g. Ganti Oli Honda Beat & Busi'}
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="fin-cat">
                <Icon fa="fa-solid fa-list" style={{ marginRight: '6px' }} /> Kategori <span className="required">*</span>
              </label>
              <select id="fin-cat" name="categoryKey" className="form-control" value={form.categoryKey} onChange={handleChange} required>
                {isIncome ? (
                  Object.entries(INCOME_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))
                ) : (
                  Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fin-amount">
                <Icon fa="fa-solid fa-coins" style={{ marginRight: '6px' }} /> Jumlah Nominal (Rp) <span className="required">*</span>
              </label>
              <input id="fin-amount" name="amount" type="number" className="form-control" placeholder="150000" min="0" value={form.amount} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fin-date">
              <Icon fa="fa-solid fa-calendar-days" style={{ marginRight: '6px' }} /> Tanggal Transaksi <span className="required">*</span>
            </label>
            <input id="fin-date" name="expense_date" type="date" className="form-control" value={form.expense_date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fin-notes">
              <Icon fa="fa-regular fa-note-sticky" style={{ marginRight: '6px' }} /> Catatan Tambahan
            </label>
            <textarea id="fin-notes" name="notes" className="form-control" rows={3} placeholder="Catatan opsional..." value={form.notes} onChange={handleChange} style={{ resize: 'vertical' }} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                background: isIncome ? '#1D4ED8' : '#1E3A8A',
                color: '#fff',
                fontWeight: 700,
                border: 'none'
              }}
            >
              {loading ? (
                <><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }} /> Menyimpan...</>
              ) : editData ? (
                <><Icon fa="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }} /> Simpan Perubahan</>
              ) : isIncome ? (
                <><Icon fa="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Simpan Pemasukan</>
              ) : (
                <><Icon fa="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Simpan Pengeluaran</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== SQL MIGRATION BANNER =====
function MigrationBanner({ onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onCopy) onCopy();
  };

  return (
    <div style={{
      background: 'rgba(30,58,138, 0.08)',
      border: '1px solid rgba(30,58,138, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ fontSize: '28px', color: '#1E3A8A', flexShrink: 0 }}>
          <Icon fa="fa-solid fa-circle-exclamation" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E3A8A', marginBottom: '6px' }}>
            Database Belum Di-Migrate — Kolom type pada tabel expenses Belum Ada
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
            Fitur Pemasukan & Pengeluaran membutuhkan pembaruan skema database Supabase. Klik tombol di bawah untuk menyalin SQL, lalu jalankan di Supabase SQL Editor.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleCopy} style={{ gap: '8px' }}>
              <Icon fa={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
              {copied ? 'SQL Tersalin! Tempel ke Supabase' : 'Salin SQL Migration'}
            </button>
            <a
              href="https://supabase.com/dashboard/project/eedrziblypwrufdzctvd/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon fa="fa-solid fa-arrow-up-right-from-square" />
              Buka Supabase SQL Editor
            </a>
          </div>
          <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', maxHeight: '120px', overflow: 'auto' }}>
            <pre style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{SQL_MIGRATION}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CONFIRM DELETE MODAL =====
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, record }) {
  if (!isOpen || !record) return null;

  const isIncome = checkIsIncome(record);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Icon fa="fa-solid fa-trash-can" style={{ marginRight: '6px', color: '#1E3A8A' }} /> Hapus Record {isIncome ? 'Pemasukan' : 'Pengeluaran'}?
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
            Apakah kamu yakin ingin menghapus pencatatan {isIncome ? 'pemasukan' : 'pengeluaran'} berikut?
          </p>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{record.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Tanggal: {new Date(record.expense_date).toLocaleDateString('id-ID')}</span>
              <strong style={{ color: isIncome ? '#1D4ED8' : '#1E3A8A' }}>
                {isIncome ? '+' : '-'}{formatRupiah(record.amount)}
              </strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(record.id); onClose(); }}>
            <Icon fa="fa-solid fa-trash-can" style={{ marginRight: '6px' }} /> Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN FINANCIAL MANAGEMENT PAGE =====
export default function FinancesPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [defaultModalType, setDefaultModalType] = useState('expense');
  const [editData, setEditData] = useState(null);
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      // Keuangan hanya membaca tabel expenses. (Klaim denda otomatis dari
      // transaksi dihapus — fitur denda tidak pernah dipakai; penalty dicatat
      // manual sebagai pemasukan.)
      const expRes = await fetch('/api/expenses').then(r => r.json()).catch(() => null);
      let manualRecords = Array.isArray(expRes) ? expRes : [];

      // Fallback: jika API gagal (non-array), ambil langsung dari Supabase
      if (!Array.isArray(expRes)) {
        try {
          const supabase = createClient();
          const { data: expData } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });
          manualRecords = expData || [];
        } catch (fbErr) {
          console.warn('Supabase fallback (expenses) gagal:', fbErr);
        }
      }

      const combined = [...manualRecords].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
      setRecords(combined);
      setNeedsMigration(false);
    } catch (err) {
      console.error('Fetch finance records error:', err);
      setRecords([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { Promise.resolve().then(fetchRecords); }, [fetchRecords]);

  // Filtering records
  const filtered = Array.isArray(records) ? records.filter(item => {
    const isInc = checkIsIncome(item);
    const itemType = isInc ? 'income' : 'expense';
    const matchType = typeFilter === 'all' || itemType === typeFilter;
    const cleanCat = getCleanCategoryKey(item.category);
    const matchCat = categoryFilter === 'all' || cleanCat === categoryFilter || item.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q);
    return matchType && matchCat && matchSearch;
  }) : [];

  // Financial Summary Totals (Correct Income vs Expense calculation)
  const totalIncome = records
    .filter(r => checkIsIncome(r))
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const totalExpense = records
    .filter(r => !checkIsIncome(r))
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const handleSubmit = async (formData) => {
    const url = editData ? `/api/expenses/${editData.id}` : '/api/expenses';
    const method = editData ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const resData = await res.json();
    if (res.ok) {
      const typeLabel = formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      showAlert(editData ? `Record ${typeLabel} berhasil diperbarui.` : `Record ${typeLabel} baru berhasil ditambahkan.`);
      setShowModal(false);
      setEditData(null);
      fetchRecords();
    } else {
      if (resData.needsMigration) {
        setNeedsMigration(true);
        setShowModal(false);
        showAlert('Tabel database belum di-migrate. Jalankan SQL migration terlebih dahulu!', 'danger');
      } else {
        showAlert(resData.error || 'Terjadi kesalahan.', 'danger');
      }
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showAlert('Record transaksi berhasil dihapus.');
      fetchRecords();
    } else {
      showAlert('Gagal menghapus record.', 'danger');
    }
  };

  const handleExportExcel = () => {
    if (!records.length) return;
    const exportMode = typeFilter; // 'all' | 'income' | 'expense'
    const defaultFilename = exportMode === 'income'
      ? 'laporan-pemasukan-boss-rent'
      : exportMode === 'expense'
        ? 'laporan-pengeluaran-boss-rent'
        : 'laporan-keuangan-lengkap-boss-rent';
    exportFinancesToExcel(records, exportMode, defaultFilename).catch(err => console.error("Export gagal:", err));
  };

  return (
    <div className="fade-in">
      <Suspense fallback={null}>
        <TabFromQuery onTab={setTypeFilter} onCategoryReset={() => setCategoryFilter('all')} />
      </Suspense>

      <div className="page-header">
        <div>
          <h2><Icon fa="fa-solid fa-wallet" style={{ marginRight: '8px' }} /> Kelola Keuangan Usaha</h2>
          <p>Catat dan pantau seluruh arus kas pemasukan, pengeluaran operasional, serta saldo bersih Boss Rent</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      {needsMigration && <MigrationBanner />}

      {/* Summary KPI Cards */}
      <div className="grid-3 mb-6">
        {/* Total Pemasukan Card */}
        <div className="stat-card" style={{ borderLeft: '4px solid #1D4ED8' }}>
          <div className="stat-icon" style={{ background: 'rgba(29,78,216, 0.15)', color: '#1D4ED8' }}>
            <Icon fa="fa-solid fa-circle-arrow-down" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Pemasukan</div>
            <div className="stat-value" style={{ color: '#1D4ED8' }}>+{formatRupiah(totalIncome)}</div>
            <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
              {records.filter(r => checkIsIncome(r)).length} transaksi masuk
            </div>
          </div>
        </div>

        {/* Total Pengeluaran Card */}
        <div className="stat-card" style={{ borderLeft: '4px solid #1E3A8A' }}>
          <div className="stat-icon" style={{ background: 'rgba(30,58,138, 0.15)', color: '#1E3A8A' }}>
            <Icon fa="fa-solid fa-circle-arrow-up" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Pengeluaran</div>
            <div className="stat-value" style={{ color: '#1E3A8A' }}>-{formatRupiah(totalExpense)}</div>
            <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
              {records.filter(r => !checkIsIncome(r)).length} transaksi keluar
            </div>
          </div>
        </div>

        {/* Saldo Net Profit Card */}
        <div className="stat-card" style={{ borderLeft: `4px solid ${netBalance >= 0 ? '#3B82F6' : '#1E3A8A'}` }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <Icon fa="fa-solid fa-scale-balanced" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Saldo / Laba Bersih</div>
            <div className="stat-value" style={{ color: netBalance >= 0 ? '#3B82F6' : '#1E3A8A' }}>
              {netBalance >= 0 ? '+' : ''}{formatRupiah(netBalance)}
            </div>
            <div className="stat-change" style={{ color: netBalance >= 0 ? '#1D4ED8' : '#1E3A8A', fontWeight: 600 }}>
              {netBalance >= 0 ? 'Surplus / Arus Kas Positif' : 'Defisit / Arus Kas Negatif'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Actions */}
      <div className="bento-card bento-table-card mb-6" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <PageTabs
            ariaLabel="Filter arus kas"
            value={typeFilter}
            onChange={(t) => { setTypeFilter(t); setCategoryFilter('all'); }}
            tabs={[
              { key: 'all', label: 'Semua', count: records.length },
              { key: 'income', label: 'Pemasukan' },
              { key: 'expense', label: 'Pengeluaran' },
            ]}
          />

          {/* DUAL ACTION BUTTONS & EXPORT (2-COLUMN GRID ON MOBILE) */}
          <div className="fin-actions-wrap">
            <button
              className="btn btn-secondary btn-sm fin-export-btn"
              onClick={handleExportExcel}
              title="Export Laporan Keuangan ke Excel (.xlsx)"
              style={{ padding: '9px 14px', borderRadius: '12px', fontWeight: 600 }}
            >
              <Icon fa="fa-solid fa-file-excel" style={{ marginRight: '6px', color: '#1D4ED8' }} />
              Export Excel
            </button>
            <button
              className="fin-btn-income"
              onClick={() => { setEditData(null); setDefaultModalType('income'); setShowModal(true); }}
            >
              <Icon fa="fa-solid fa-plus" /> Tambah Pemasukan
            </button>
            <button
              className="fin-btn-expense"
              onClick={() => { setEditData(null); setDefaultModalType('expense'); setShowModal(true); }}
            >
              <Icon fa="fa-solid fa-plus" /> Tambah Pengeluaran
            </button>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER */}
        <div className="filter-bar mt-4" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '220px' }}>
            <span className="search-bar-icon"><Icon fa="fa-solid fa-magnifying-glass" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari transaksi keuangan, keterangan, catatan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="form-control filter-select"
            style={{ width: '200px' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            <optgroup label="Pemasukan">
              {Object.entries(ALL_INCOME_CATEGORIES_FOR_DISPLAY).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pengeluaran">
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* FINANCIAL TABLE */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="table-empty"><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }} /> Memuat data keuangan...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon"><Icon fa="fa-solid fa-wallet" /></div>
              <p>{needsMigration ? 'Jalankan SQL migration untuk mengaktifkan fitur ini.' : 'Belum ada pencatatan transaksi keuangan'}</p>
            </div>
          ) : (
            <table className="table table--stack-mobile">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jenis Arus Kas</th>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Kategori</th>
                  <th>Nominal</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const isInc = checkIsIncome(item);
                  const meta = getCategoryMeta(item.category, isInc);

                  return (
                    <tr key={item.id}>
                      <td data-label="#" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td data-label="Jenis Arus Kas">
                        <span className={`tx-status-pill ${isInc ? 'completed' : 'cancelled'}`}>
                          <Icon fa={`fa-solid ${isInc ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`} style={{ fontSize: '11px' }} />
                          {isInc ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
                        </span>
                      </td>
                      <td data-label="Tanggal" style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>{new Date(item.expense_date).toLocaleDateString('id-ID')}</td>
                      <td data-label="Keterangan">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{item.title}</strong>
                          {item.isAutoTransaction && (
                            <div>
                              <span className="badge badge-success" style={{ background: 'rgba(29,78,216, 0.12)', color: '#1D4ED8', borderColor: 'rgba(29,78,216, 0.35)', fontSize: '10.5px', padding: '2px 8px' }}>
                                <Icon fa="fa-solid fa-bolt" style={{ marginRight: '4px' }} /> Otomatis dari Transaksi Sewa
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td data-label="Kategori">
                        <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Icon fa={meta.icon} style={{ color: meta.color }} />
                          {meta.label}
                        </span>
                      </td>
                      <td data-label="Nominal">
                        <strong style={{ fontSize: '14px', color: isInc ? '#1D4ED8' : '#1E3A8A' }}>
                          {isInc ? '+' : '-'}{formatRupiah(item.amount)}
                        </strong>
                      </td>
                      <td data-label="Catatan" style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.notes || ''}>{item.notes || '-'}</td>
                      <td data-label="Aksi">
                        <div className="flex gap-2">
                          {item.isAutoTransaction ? (
                            <span className="badge badge-muted" title="Otomatis terhubung dengan fitur transaksi sewa" style={{ fontSize: '11px', padding: '6px 10px' }}>
                              <Icon fa="fa-solid fa-lock" style={{ marginRight: '4px' }} /> Auto System
                            </span>
                          ) : (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Edit Transaksi"
                                onClick={() => { setEditData(item); setShowModal(true); }}
                              >
                                <Icon fa="fa-solid fa-pen-to-square" />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Hapus Transaksi"
                                onClick={() => setDeleteModal({ open: true, data: item })}
                              >
                                <Icon fa="fa-solid fa-trash-can" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FinanceModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        defaultType={defaultModalType}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, data: null })}
        onConfirm={handleDelete}
        record={deleteModal.data}
      />
    </div>
  );
}
