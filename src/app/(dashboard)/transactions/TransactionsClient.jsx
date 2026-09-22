'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { uploadHandoverPhoto, resolvePhotoSrc, resolvePhotoDataUrl, removeHandoverPhoto } from '@/lib/handoverPhoto';
import { TX_LIGHT_COLUMNS, TX_LIGHT_SELECT, VEHICLE_LIGHT_COLUMNS } from '@/lib/queryColumns';
import { getPaymentMethods, getPaymentMethodMeta } from '@/lib/paymentMethods';
import { COUNTRY_CODES, getWhatsAppShareUrl, generateInvoiceText, generateInvoiceNumber, getFlagImageUrl } from '@/lib/countryCodes';
import { createClient } from '@/lib/supabase/client';
import { fetchCustomers, upsertCustomer } from '@/lib/customers';
import { getLocalDateStr } from '@/lib/finance';
import Icon from '@/components/ui/Icon';
import { formatRupiah } from '@/lib/finance';
import dynamic from 'next/dynamic';

// Modal invoice dimuat hanya saat dibuka (mengurangi ukuran halaman Transaksi)
const WhatsAppInvoiceModal = dynamic(() => import('@/components/transactions/WhatsAppInvoiceModal'), { ssr: false });
const TransactionModal = dynamic(() => import('@/components/transactions/TransactionModal'), { ssr: false });
import { formatTanggal as formatTanggalId } from '@/lib/period';
import RupiahInput from '@/components/ui/RupiahInput';


function CompleteModal({ isOpen, onClose, onConfirm, tx }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !tx) return null;

  const deposit = Number(tx.deposit) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(tx.id, { vehicle_id: tx.vehicle_id });
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              <Icon fa="fa-solid fa-flag-checkered" style={{ marginRight: '6px', color: '#1D4ED8' }} />
              Selesaikan Transaksi & Pengembalian Deposit
            </div>
            <div className="modal-subtitle">Customer: <strong>{tx.renter_name}</strong> | Motor: <strong>{tx.vehicles?.name} ({tx.vehicles?.plate_number})</strong></div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Motor akan kembali berstatus <strong>Tersedia</strong> setelah sewa ini diselesaikan.
          </p>

          <div className="alert alert-info" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Deposit Jaminan Awal:</span>
              <strong>{formatRupiah(deposit)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', fontSize: '15px', fontWeight: 800, color: '#1D4ED8' }}>
              <span>Deposit Yang Dikembalikan Ke Customer:</span>
              <span>{formatRupiah(deposit)}</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? (
                <><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }} /> Menyimpan...</>
              ) : (
                <><Icon fa="fa-solid fa-check" style={{ marginRight: '4px' }} /> Selesaikan Transaksi</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MODAL KONFIRMASI TANDAI LUNAS =====
function ConfirmLunasModal({ isOpen, onClose, onConfirm, tx }) {
  if (!isOpen || !tx) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--bg-border)', paddingBottom: '16px' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 800 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(29,78,216,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon fa="fa-solid fa-money-bill-wave" style={{ color: '#1D4ED8', fontSize: '16px' }} />
            </div>
            Konfirmasi Pembayaran Lunas
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 0 4px' }}>
          {/* Info penyewa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--bg-border)', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon fa="fa-solid fa-user" style={{ color: 'var(--brand-primary)', fontSize: '16px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{tx.renter_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <Icon fa="fa-solid fa-motorcycle" style={{ marginRight: '5px', fontSize: '11px' }} />
                {tx.vehicles?.name || '-'} · {tx.vehicles?.plate_number || '-'}
              </div>
            </div>
          </div>

          {/* Pesan konfirmasi */}
          <div style={{ padding: '12px 14px', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.25)', borderRadius: '8px', marginBottom: '8px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
              Tandai transaksi ini sebagai <strong style={{ color: '#1D4ED8' }}>LUNAS</strong>? Pembayaran akan langsung masuk ke laporan pendapatan.
            </p>
          </div>

          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon fa="fa-solid fa-circle-info" style={{ fontSize: '11px' }} />
            Tindakan ini tidak dapat dibatalkan secara otomatis.
          </p>
        </div>

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button
            className="btn btn-success"
            onClick={() => { onConfirm(tx); onClose(); }}
            style={{ background: '#1D4ED8', borderColor: '#1D4ED8', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Icon fa="fa-solid fa-circle-check" /> Ya, Tandai Lunas
          </button>
        </div>
      </div>
    </div>
  );
}


// ===== TOAST NOTIFIKASI SUKSES LUNAS =====
function LunasSuccessToast({ isOpen, onClose, renterName }) {
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 20px',
      background: '#064e3b',
      border: '1px solid rgba(29,78,216,0.45)',
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(29,78,216,0.15)',
      minWidth: '300px', maxWidth: '380px',
      animation: 'toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: 'rgba(29,78,216,0.2)', border: '2px solid rgba(29,78,216,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon fa="fa-solid fa-circle-check" style={{ color: '#3B82F6', fontSize: '20px' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '14px', color: '#EEF3FF', letterSpacing: '-0.2px' }}>
          Pembayaran Dikonfirmasi! 🎉
        </div>
        <div style={{ fontSize: '12px', color: '#BFD1FF', marginTop: '2px' }}>
          Transaksi <strong style={{ color: '#EEF3FF' }}>{renterName}</strong> sudah lunas & masuk ke laporan pendapatan.
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#BFD1FF', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1, flexShrink: 0 }}
      >
        <Icon fa="fa-solid fa-xmark" />
      </button>
    </div>
  );
}



// ===== TOAST NOTIFIKASI SUKSES SIMPAN TRANSAKSI =====
function SaveSuccessToast({ isOpen, onClose, isEdit, renterName }) {
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 20px',
      background: '#1e1b4b',
      border: '1px solid rgba(29,78,216,0.45)',
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(29,78,216,0.15)',
      minWidth: '300px', maxWidth: '380px',
      animation: 'toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: 'rgba(29,78,216,0.2)', border: '2px solid rgba(29,78,216,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon fa="fa-solid fa-floppy-disk" style={{ color: '#BFD1FF', fontSize: '18px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '14px', color: '#eef2ff', letterSpacing: '-0.2px' }}>
          {isEdit ? 'Transaksi Diperbarui! ✏️' : 'Transaksi Tersimpan! 🎉'}
        </div>
        <div style={{ fontSize: '12px', color: '#BFD1FF', marginTop: '2px' }}>
          Data <strong style={{ color: '#eef2ff' }}>{renterName}</strong> berhasil {isEdit ? 'diperbarui' : 'ditambahkan'} ke sistem.
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#BFD1FF', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1, flexShrink: 0 }}
      >
        <Icon fa="fa-solid fa-xmark" />
      </button>
    </div>
  );
}

// ===== TOAST NOTIFIKASI ERROR =====
function ErrorToast({ isOpen, onClose, message }) {
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 20px',
      background: '#450a0a',
      border: '1px solid rgba(30,58,138,0.45)',
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(30,58,138,0.15)',
      minWidth: '300px', maxWidth: '400px',
      animation: 'toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: 'rgba(30,58,138,0.2)', border: '2px solid rgba(30,58,138,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon fa="fa-solid fa-circle-exclamation" style={{ color: '#C7D6FF', fontSize: '20px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '14px', color: '#E8EEFB', letterSpacing: '-0.2px' }}>
          Gagal Menyimpan ⚠️
        </div>
        <div style={{ fontSize: '12px', color: '#C7D6FF', marginTop: '2px' }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#C7D6FF', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1, flexShrink: 0 }}
      >
        <Icon fa="fa-solid fa-xmark" />
      </button>
    </div>
  );
}



function SuccessModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(29,78,216, 0.2)', color: '#1D4ED8', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon fa="fa-solid fa-circle-check" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Transaksi Selesai!</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{message}</p>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Selesai / Tutup
        </button>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Icon fa="fa-solid fa-trash-can" style={{ marginRight: '6px' }} /> Hapus Transaksi?</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Transaksi akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Hapus Permanen</button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN TRANSACTIONS PAGE =====
const statusBadge = (status, paymentStatus) => {
  // If active but unpaid, show special badge
  if (status === 'active' && paymentStatus === 'unpaid') {
    return (
      <span className="tx-status-pill" style={{ background: 'rgba(30,64,175,0.15)', color: '#1E40AF', borderColor: 'rgba(30,64,175,0.4)' }}>
        <Icon fa="fa-solid fa-clock" style={{ fontSize: '11px' }} /> Belum Bayar
      </span>
    );
  }
  const map = {
    active: (
      <span className="tx-status-pill active">
        <Icon fa="fa-solid fa-bolt" style={{ fontSize: '11px' }} /> Sewa Aktif
      </span>
    ),
    completed: (
      <span className="tx-status-pill completed">
        <Icon fa="fa-solid fa-circle-check" style={{ fontSize: '11px' }} /> Selesai
      </span>
    ),
    cancelled: (
      <span className="tx-status-pill cancelled">
        <Icon fa="fa-solid fa-circle-xmark" style={{ fontSize: '11px' }} /> Dibatalkan
      </span>
    ),
  };
  return map[status] || <span className="tx-status-pill">{status}</span>;
};

export default function TransactionsPage({ initialTransactions = [], initialVehicles = [], initialPhotoIds = [], pageSize = 50 }) {
  // Data awal sudah dikirim dari server (lihat page.jsx) — halaman langsung
  // tampil berisi data, tanpa menunggu fetch dari browser dulu.
  const [transactions, setTransactions] = useState(initialTransactions);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [loading, setLoading] = useState(initialTransactions.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(initialTransactions.length >= pageSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [completeModal, setCompleteModal] = useState({ open: false, tx: null });
  const [waModal, setWaModal] = useState({ open: false, tx: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, txId: null });
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });
  const [lunasModal, setLunasModal] = useState({ open: false, tx: null });
  const [lunasToast, setLunasToast] = useState({ open: false, renterName: '' });
  const [saveToast, setSaveToast] = useState({ open: false, isEdit: false, renterName: '' });
  const [errorToast, setErrorToast] = useState({ open: false, message: '' });
  // id transaksi yang punya foto serah terima (list tidak lagi membawa isi foto)
  const [photoIds, setPhotoIds] = useState(() => new Set(initialPhotoIds));
  const [openingId, setOpeningId] = useState(null);
  const [photoViewer, setPhotoViewer] = useState({ open: false, loading: false, src: null, name: '' });

  // Pintasan dari Dashboard: /transactions?new=1 langsung membuka form transaksi baru.
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('new') === '1') {
          setEditData(null);
          setShowModal(true);
          url.searchParams.delete('new');
          window.history.replaceState(window.history.state, '', url.toString());
        }
      } catch { /* ignore */ }
    });
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    let txList = null;
    let vList = null;

    // Jalur utama: API route. Jika gagal (401/500/network) → fallback LANGSUNG
    // ke Supabase (sama seperti halaman Ketersediaan/Tracking) supaya data
    // transaksi & motor TIDAK pernah tampak "hilang".
    try {
      // List transaksi & motor TANPA foto (lihat lib/queryColumns.js);
      // foto diambil per transaksi saat Edit / Invoice / Lihat foto dibuka.
      const [txRes, vRes, photoRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/vehicles?view=light'),
        fetch('/api/transactions?view=photo_ids'),
      ]);
      const txData = txRes.ok ? await txRes.json() : null;
      const vData = vRes.ok ? await vRes.json() : null;
      const photoData = photoRes.ok ? await photoRes.json() : null;
      if (Array.isArray(txData)) txList = txData;
      if (Array.isArray(vData)) vList = vData;
      if (Array.isArray(photoData?.handover)) setPhotoIds(new Set(photoData.handover));
      if (txList === null || vList === null) {
        console.warn('API /api/transactions|/api/vehicles gagal — fallback ke Supabase langsung.');
      }
    } catch (err) {
      console.error('Fetch via API error:', err);
    }

    if (txList === null || vList === null) {
      try {
        const supabase = createClient();
        if (txList === null) {
          let txQ = await supabase
            .from('transactions')
            .select(TX_LIGHT_SELECT)
            .order('created_at', { ascending: false });
          if (txQ.error) {
            // Relasi/kolom bermasalah → ambil polos lalu gabung manual
            const txPlain = await supabase.from('transactions').select(TX_LIGHT_COLUMNS).order('created_at', { ascending: false });
            const vehAll = await supabase.from('vehicles').select(VEHICLE_LIGHT_COLUMNS);
            const vehMap = (vehAll.data || []).reduce((m, v) => { m[v.id] = v; return m; }, {});
            txList = (txPlain.data || []).map(t => ({ ...t, vehicles: vehMap[t.vehicle_id] || null }));
          } else {
            txList = txQ.data || [];
          }
        }
        if (vList === null) {
          const vQ = await supabase.from('vehicles').select(VEHICLE_LIGHT_COLUMNS).order('created_at', { ascending: false });
          vList = vQ.error ? [] : (vQ.data || []);
        }
      } catch (err) {
        console.error('Fetch via Supabase error:', err);
        if (txList === null) txList = [];
        if (vList === null) vList = [];
      }
    }

    setTransactions(txList);
    setVehicles(vList);
    setLoading(false);
  }, []);

  // Hanya fetch dari browser kalau data server kosong (atau setelah ada perubahan
  // data — fetchAll dipanggil manual oleh handler simpan/hapus).
  const didInitialFetch = useRef(initialTransactions.length > 0);
  useEffect(() => {
    if (didInitialFetch.current) return;
    didInitialFetch.current = true;
    Promise.resolve().then(fetchAll);
  }, [fetchAll]);

const handleSubmit = async (formData) => {
    const isEdit = !!editData;
    const url = isEdit ? `/api/transactions/${editData.id}` : '/api/transactions';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      // Auto-upsert ke Customer Master Database
      try {
        await upsertCustomer(createClient(), {
          name: formData.renter_name,
          phone: formData.renter_phone,
          id_number: formData.renter_id_number,
          address: formData.renter_address,
        });
      } catch { /* ignore */ }

      setShowModal(false);
      setEditData(null);
      fetchAll();
      setSaveToast({ open: true, isEdit, renterName: formData.renter_name });
      return true;
    }
    const err = await res.json().catch(() => ({}));
    setErrorToast({ open: true, message: err.error || 'Terjadi kesalahan, coba lagi.' });
    return false;
  };

  // Ambil SATU transaksi lengkap (termasuk foto) — hanya saat dibutuhkan.
  const fetchFullTransaction = async (txId) => {
    const res = await fetch(`/api/transactions/${txId}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Gagal memuat detail transaksi.');
    return json;
  };

  // Edit WAJIB memakai data lengkap: form edit ikut menyimpan kolom foto.
  const openEdit = async (tx) => {
    setOpeningId(tx.id);
    try {
      const full = await fetchFullTransaction(tx.id);
      setEditData(full);
      setShowModal(true);
    } catch (err) {
      setErrorToast({ open: true, message: err.message });
    } finally {
      setOpeningId(null);
    }
  };

  const openWa = async (tx) => {
    if (!photoIds.has(tx.id)) {
      setWaModal({ open: true, tx });
      return;
    }
    setOpeningId(tx.id);
    try {
      const full = await fetchFullTransaction(tx.id);
      // Invoice visual dirender ke gambar → pakai data URL supaya canvas tidak "tainted".
      let photo = null;
      try { photo = await resolvePhotoDataUrl(createClient(), full.handover_image_url); } catch { photo = null; }
      setWaModal({ open: true, tx: { ...full, customer_image_url: null, handover_image_url: photo } });
    } catch (err) {
      setErrorToast({ open: true, message: err.message });
    } finally {
      setOpeningId(null);
    }
  };

  const openPhoto = async (tx) => {
    setPhotoViewer({ open: true, loading: true, src: null, name: tx.renter_name });
    try {
      const full = await fetchFullTransaction(tx.id);
      const src = await resolvePhotoSrc(createClient(), full.handover_image_url);
      setPhotoViewer({ open: true, loading: false, src, name: tx.renter_name });
    } catch (err) {
      setPhotoViewer({ open: false, loading: false, src: null, name: '' });
      setErrorToast({ open: true, message: err.message });
    }
  };

  const handleComplete = async (txId, completeData) => {
    const { vehicle_id } = completeData;

    // 1. Update Transaction status to 'completed'
    const txRes = await fetch(`/api/transactions/${txId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });

    // 2. Motor kembali tersedia
    if (vehicle_id) {
      await fetch(`/api/vehicles/${vehicle_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' }),
      });
    }

    if (txRes.ok) {
      const tx = transactions.find(t => t.id === txId);
      const deposit = Number(tx?.deposit) || 0;
      const refund = deposit;
      setSuccessModal({
        open: true,
        message: refund > 0
          ? `Transaksi telah diselesaikan. Deposit ${formatRupiah(refund)} dikembalikan ke customer.`
          : 'Transaksi telah diselesaikan. Motor kembali tersedia.'
      });
      fetchAll();
    } else {
      alert('Gagal menyelesaikan transaksi.');
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAll();
    } else {
      alert('Gagal menghapus transaksi.');
    }
  };

  const handleTandaiLunas = async (tx) => {
  await fetch(`/api/transactions/${tx.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_status: 'paid' }),
  });
  setLunasToast({ open: true, renterName: tx.renter_name });
  fetchAll();
};

  // Pencarian & filter status dijalankan di server; daftar dimuat per halaman.
  const loadPage = useCallback(async (offset, replace) => {
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
    if (searchQuery.trim().length >= 2) params.set('q', searchQuery.trim());
    if (statusFilter === 'belum_bayar') params.set('status', 'active');
    else if (statusFilter !== 'all') params.set('status', statusFilter);

    setLoadingMore(true);
    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setTransactions(prev => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length >= pageSize);
    } catch (err) {
      console.error('Gagal memuat transaksi:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [pageSize, searchQuery, statusFilter]);

  // Ketik pencarian / ganti filter → ambil ulang halaman pertama dari server
  const firstFilterRun = useRef(true);
  useEffect(() => {
    if (firstFilterRun.current) { firstFilterRun.current = false; return; }
    const t = setTimeout(() => { loadPage(0, true); }, 350);
    return () => clearTimeout(t);
  }, [loadPage]);

  const filtered = statusFilter === 'belum_bayar'
    ? transactions.filter(tx => tx.status === 'active' && tx.payment_status === 'unpaid')
    : transactions;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2><Icon fa="fa-solid fa-file-invoice-dollar" style={{ marginRight: '8px' }} /> Kelola Transaksi Sewa</h2>
          <p>Catat transaksi penyewaan motor, kirim invoice WhatsApp, dan kelola deposit jaminan</p>
        </div>
      </div>

      <div className="page-actions">
        <div className="filter-bar">
          <div className="search-bar">
            <span className="search-bar-icon"><Icon fa="fa-solid fa-magnifying-glass" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari penyewa, no HP, atau nama/plat motor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="form-control filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="active">Sewa Aktif</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <button
          id="btn-add-transaction"
          className="btn btn-primary"
          onClick={() => { setEditData(null); setShowModal(true); }}
        >
          <Icon fa="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Transaksi Baru
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="mobile-list">
          {filtered.map(tx => {
            const st = tx.status === 'active' && tx.payment_status === 'unpaid'
              ? { label: 'Belum bayar', cls: 'strong' }
              : tx.status === 'active' ? { label: 'Aktif', cls: 'soft' }
              : tx.status === 'completed' ? { label: 'Selesai', cls: 'muted' }
              : { label: 'Batal', cls: 'muted' };
            return (
              <div key={tx.id} className="mlist-row">
                <div className="mlist-main">
                  <div className="mlist-title">{tx.renter_name}</div>
                  <div className="mlist-sub">
                    {tx.vehicles?.name || 'Motor'} · {tx.duration_days || 1} hari · {formatTanggalId(tx.start_date)}
                  </div>
                </div>
                <div className="mlist-right">
                  <span className="mlist-value">{formatRupiah(tx.total_price)}</span>
                  <span className={`dash2-pill ${st.cls}`}>{st.label}</span>
                </div>
                <div className="mlist-actions">
                  {tx.status === 'active' ? (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setCompleteModal({ open: true, tx })}>
                      <Icon fa="fa-solid fa-check" /> Selesai
                    </button>
                  ) : (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openWa(tx)} disabled={openingId === tx.id}>
                      <Icon fa="fa-brands fa-whatsapp" /> Invoice
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary btn-sm mlist-more"
                    aria-label="Aksi lain" aria-expanded={rowMenu === tx.id}
                    onClick={() => setRowMenu(rowMenu === tx.id ? null : tx.id)}>
                    <Icon fa="fa-solid fa-sliders" />
                  </button>
                </div>

                {rowMenu === tx.id && (
                  <div className="mlist-menu">
                    {tx.status === 'active' && (
                      <button type="button" onClick={() => { setRowMenu(null); openWa(tx); }}>
                        <Icon fa="fa-brands fa-whatsapp" /> Kirim invoice WhatsApp
                      </button>
                    )}
                    {tx.status === 'active' && tx.payment_status === 'unpaid' && (
                      <button type="button" onClick={() => { setRowMenu(null); setLunasModal({ open: true, tx }); }}>
                        <Icon fa="fa-solid fa-money-bill-wave" /> Tandai lunas
                      </button>
                    )}
                    <button type="button" onClick={() => { setRowMenu(null); openEdit(tx); }}>
                      <Icon fa="fa-solid fa-pen-to-square" /> Edit transaksi
                    </button>
                    <button type="button" className="danger" onClick={() => { setRowMenu(null); setDeleteModal({ open: true, txId: tx.id }); }}>
                      <Icon fa="fa-solid fa-trash" /> Hapus transaksi
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="table-wrapper desktop-only">
          {loading ? (
            <div className="table-empty"><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }} /> Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon"><Icon fa="fa-solid fa-file-invoice" /></div>
              <p>Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <table className="table table--stack-mobile">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Motor</th>
                  <th>Periode sewa</th>
                  <th>Total sewa</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, idx) => (
                  <tr key={tx.id}>
                    <td data-label="#" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td data-label="Customer">
                      <div className="tx-customer-cell">
                        <div style={{ display: 'flex', position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-border)' }}>
                            <Icon fa="fa-solid fa-user" style={{ fontSize: '16px', color: 'var(--brand-primary)' }} />
                          </div>
                          {photoIds.has(tx.id) && (
                            <button type="button" onClick={() => openPhoto(tx)} title="Lihat foto serah terima"
                              style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', color: '#fff', position: 'absolute', bottom: '-2px', right: '-6px', border: '2px solid #0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', padding: 0 }}>
                              <Icon fa="fa-solid fa-camera" />
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{tx.renter_name}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}><Icon fa="fa-solid fa-phone" style={{ marginRight: '4px', fontSize: '10px' }} />{tx.renter_phone}</span>
                            {tx.payment_method && (
                              <span className="tx-info-pill" style={{ color: getPaymentMethodMeta(tx.payment_method).color, borderColor: `${getPaymentMethodMeta(tx.payment_method).color}40`, background: `${getPaymentMethodMeta(tx.payment_method).color}15` }}>
                                <Icon fa={getPaymentMethodMeta(tx.payment_method).icon} style={{ fontSize: '10px' }} />
                                {getPaymentMethodMeta(tx.payment_method).label}
                              </span>
                            )}
                          </div>
                          {tx.renter_address && (
                            <div style={{ fontSize: '11px', color: 'var(--brand-primary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }} title={tx.renter_address}>
                              <Icon fa="fa-solid fa-location-dot" style={{ marginRight: '4px' }} />
                              {tx.renter_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-label="Motor">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                          {tx.vehicles?.name || '-'}
                        </strong>
                        <div>
                          <span className="tx-info-pill" style={{ color: 'var(--brand-primary-light)', borderColor: 'rgba(37, 99, 235, 0.35)', background: 'rgba(37, 99, 235, 0.12)', padding: '4px 10px' }}>
                            <Icon fa="fa-solid fa-motorcycle" style={{ fontSize: '11px', marginRight: '6px' }} />
                            {tx.vehicles?.plate_number || '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Periode sewa">
                      <div className="tx-date-cell">
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                          <Icon fa="fa-solid fa-calendar-plus" style={{ marginRight: '6px', fontSize: '11px', color: '#1D4ED8' }} />
                          {new Date(tx.start_date).toLocaleDateString('id-ID')}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                          <Icon fa="fa-solid fa-calendar-check" style={{ marginRight: '6px', fontSize: '11px', color: '#3B82F6' }} />
                          {new Date(tx.end_date).toLocaleDateString('id-ID')}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Durasi: {tx.duration_days} Hari
                        </div>
                      </div>
                    </td>
                    <td data-label="Total sewa">
                      <div className="tx-price-cell">
                        <strong style={{ fontSize: '14px', color: '#1D4ED8' }}>{formatRupiah(tx.total_price)}</strong>
                        {tx.discount > 0 && (
                          <div>
                            <span className="tx-info-pill" style={{ color: '#1E40AF', borderColor: 'rgba(30,64,175, 0.3)', background: 'rgba(30,64,175, 0.1)' }}>
                              Diskon: -{formatRupiah(tx.discount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-label="Deposit">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px' }}>
                        <div>Dep: <strong>{formatRupiah(tx.deposit)}</strong></div>
                      </div>
                    </td>
                    <td data-label="Status" style={{ verticalAlign: 'middle' }}>
                      {statusBadge(tx.status, tx.payment_status)}
                      {tx.status === 'active' && tx.payment_status !== 'unpaid' && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#1D4ED8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Icon fa="fa-solid fa-circle-check" style={{ fontSize: '9px' }} /> Lunas
                          </span>
                        </div>
                      )}
                    </td>
                    <td data-label="Aksi" style={{ verticalAlign: 'middle' }}>
                      <div className="tx-actions-cell">
                        {/* WhatsApp Invoice Button */}
                        <button
                          className="btn btn-success btn-sm"
                          title="Kirim Invoice WhatsApp"
                          style={{ background: '#1D4ED8', borderColor: '#1D4ED8', color: '#fff', padding: '7px 10px' }}
                          onClick={() => openWa(tx)}
                          disabled={openingId === tx.id}
                        >
                          <Icon fa="fa-brands fa-whatsapp" />
                        </button>

                        {/* Tandai Lunas button for unpaid active transactions */}
                        {tx.status === 'active' && tx.payment_status === 'unpaid' && (
                        <button
                        className="btn btn-sm"
                        title="Tandai Lunas — Masukkan ke Pendapatan"
                        style={{ padding: '7px 10px', background: 'rgba(29,78,216,0.15)', border: '1px solid #1D4ED8', color: '#1D4ED8', fontWeight: 700 }}
                        onClick={() => setLunasModal({ open: true, tx })}
                      >
                        <Icon fa="fa-solid fa-money-bill-wave" />
                      </button>
                    )}

                        {tx.status === 'active' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Tandai Selesai & Penyesuaian Deposit"
                            style={{ padding: '7px 10px' }}
                            onClick={() => setCompleteModal({ open: true, tx })}
                          >
                            <Icon fa="fa-solid fa-check" />
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit Transaksi"
                          style={{ padding: '7px 10px' }}
                          onClick={() => openEdit(tx)}
                          disabled={openingId === tx.id}
                        >
                          <Icon fa={openingId === tx.id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-pen-to-square'} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Hapus Transaksi"
                          style={{ padding: '7px 10px' }}
                          onClick={() => setDeleteModal({ open: true, txId: tx.id })}
                        >
                          <Icon fa="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => loadPage(transactions.length, false)} disabled={loadingMore}>
              {loadingMore
                ? <><Icon fa="fa-solid fa-spinner" spin /> Memuat…</>
                : <>Muat lebih banyak</>}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null); }}
        onSubmit={handleSubmit}
        vehicles={vehicles}
        editData={editData}
      />

      <WhatsAppInvoiceModal
        isOpen={waModal.open}
        onClose={() => setWaModal({ open: false, tx: null })}
        tx={waModal.tx}
        vehicle={waModal.tx?.vehicles}
      />

      {photoViewer.open && (
        <div className="modal-overlay" onClick={() => setPhotoViewer({ open: false, loading: false, src: null, name: '' })}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><Icon fa="fa-solid fa-camera" style={{ marginRight: '6px' }} /> Foto Serah Terima — {photoViewer.name}</div>
              <button className="modal-close" type="button" onClick={() => setPhotoViewer({ open: false, loading: false, src: null, name: '' })}>✕</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              {photoViewer.loading ? (
                <Icon fa="fa-solid fa-spinner fa-spin" style={{ fontSize: '22px', color: 'var(--text-muted)' }} />
              ) : photoViewer.src ? (
                <img src={photoViewer.src} alt="Foto serah terima" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px' }} />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Foto tidak ditemukan.</span>
              )}
            </div>
          </div>
        </div>
      )}

      <CompleteModal
        isOpen={completeModal.open}
        onClose={() => setCompleteModal({ open: false, tx: null })}
        onConfirm={handleComplete}
        tx={completeModal.tx}
      />

      <SuccessModal
        isOpen={successModal.open}
        onClose={() => setSuccessModal({ open: false, message: '' })}
        message={successModal.message}
      />

      <ConfirmLunasModal
      isOpen={lunasModal.open}
      onClose={() => setLunasModal({ open: false, tx: null })}
      onConfirm={handleTandaiLunas}
      tx={lunasModal.tx}
    />
    
    <LunasSuccessToast
      isOpen={lunasToast.open}
      onClose={() => setLunasToast({ open: false, renterName: '' })}
      renterName={lunasToast.renterName}
    />

      <SaveSuccessToast
  isOpen={saveToast.open}
  onClose={() => setSaveToast({ open: false, isEdit: false, renterName: '' })}
  isEdit={saveToast.isEdit}
  renterName={saveToast.renterName}
/>

<ErrorToast
  isOpen={errorToast.open}
  onClose={() => setErrorToast({ open: false, message: '' })}
  message={errorToast.message}
/>

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, txId: null })}
        onConfirm={() => handleDelete(deleteModal.txId)}
      />
    </div>
  );
}
