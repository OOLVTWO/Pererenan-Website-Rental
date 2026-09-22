'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, getLocalDateStr } from '@/lib/finance';
import { SERVICE_ITEM_OPTIONS } from '@/lib/serviceLog';
import Icon from '@/components/ui/Icon';

/**
 * Servis Motor — PENCATATAN saja (bukan deteksi jadwal servis).
 * Admin mencatat manual: motor, tanggal, pekerjaan, bengkel, biaya, catatan.
 * Biaya bisa otomatis tercatat sebagai pengeluaran di Keuangan (ditanggung owner).
 */

const FIRST_YEAR = 2026;

function formatDateId(value) {
  if (!value) return '-';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '-';
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function vehicleLabel(v) {
  if (!v) return 'Motor dihapus';
  return v.plate_number ? `${v.name} (${v.plate_number})` : v.name;
}

// ─────────────────────────────────────────────────────────────
// Form tambah / edit catatan servis
// ─────────────────────────────────────────────────────────────
function ServiceLogModal({ vehicles, editData, defaultVehicleId, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(() => ({
    vehicle_id: editData?.vehicle_id || defaultVehicleId || '',
    service_date: editData?.service_date || getLocalDateStr(),
    items: editData?.items || [],
    workshop: editData?.workshop || '',
    cost: editData?.cost ? String(Math.round(editData.cost)) : '',
    notes: editData?.notes || '',
    record_expense: editData ? !!editData.expense_id || !editData.cost : true,
  }));
  const [customItem, setCustomItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleItem = (item) => {
    setForm(f => ({
      ...f,
      items: f.items.includes(item) ? f.items.filter(i => i !== item) : [...f.items, item],
    }));
  };

  const addCustomItem = () => {
    const item = customItem.trim();
    if (!item) return;
    setForm(f => (f.items.includes(item) ? f : { ...f, items: [...f.items, item] }));
    setCustomItem('');
  };

  const extraItems = form.items.filter(i => !SERVICE_ITEM_OPTIONS.includes(i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vehicle_id) return setError('Pilih motor terlebih dahulu.');
    if (form.items.length === 0 && !form.notes.trim()) return setError('Pilih minimal satu pekerjaan servis atau isi catatan.');

    setSaving(true);
    try {
      const res = await fetch(editData ? `/api/service-logs/${editData.id}` : '/api/service-logs', {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cost: Number(form.cost) || 0 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan catatan servis.');
      onSaved(editData ? 'Catatan servis diperbarui.' : 'Catatan servis tersimpan.');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{editData ? 'Edit catatan servis' : 'Catat servis'}</div>
            <div className="modal-subtitle">Isi apa saja yang dikerjakan pada motor</div>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Tutup">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && <div className="alert">{error}</div>}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="svc-vehicle">Motor <span className="required">*</span></label>
            <select id="svc-vehicle" className="form-control" value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)} required>
              <option value="">— Pilih motor —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="svc-date">Tanggal servis <span className="required">*</span></label>
            <input id="svc-date" type="date" className="form-control" value={form.service_date}
              max={getLocalDateStr()} onChange={e => set('service_date', e.target.value)} required />
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="form-label" style={{ marginBottom: '8px' }}>Apa saja yang diservis?</legend>
            <div className="page-tabs" style={{ flexWrap: 'wrap', marginBottom: '8px' }}>
              {[...SERVICE_ITEM_OPTIONS, ...extraItems].map(item => {
                const active = form.items.includes(item);
                return (
                  <button key={item} type="button" onClick={() => toggleItem(item)}
                    className={`page-tab${active ? ' active' : ''}`} aria-pressed={active}>
                    {active && <Icon fa="fa-solid fa-check" aria-hidden="true" />}{item}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-control" placeholder="Pekerjaan lain (mis. ganti kabel gas)" aria-label="Pekerjaan lain"
                value={customItem} onChange={e => setCustomItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(); } }} />
              <button type="button" className="btn btn-secondary" onClick={addCustomItem}>Tambah</button>
            </div>
          </fieldset>

          <div className="form-row cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="svc-workshop">Bengkel / mekanik</label>
              <input id="svc-workshop" className="form-control" placeholder="mis. Bengkel Pak Made" value={form.workshop}
                onChange={e => set('workshop', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="svc-cost">Biaya (Rp)</label>
              <input id="svc-cost" type="number" inputMode="numeric" min="0" className="form-control" placeholder="0"
                value={form.cost} onChange={e => set('cost', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="svc-notes">Catatan</label>
            <textarea id="svc-notes" className="form-control" rows={2} placeholder="Part yang diganti, temuan, dll."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.record_expense} onChange={e => set('record_expense', e.target.checked)} style={{ width: '20px', height: '20px' }} />
            Catat biaya ini sebagai pengeluaran di Keuangan
          </label>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            {editData ? (
              <button type="button" className="btn btn-danger" onClick={() => onDelete(editData)} disabled={saving}>
                <Icon fa="fa-solid fa-trash" aria-hidden="true" /> Hapus
              </button>
            ) : <span />}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Icon fa="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Menyimpan…</> : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Halaman utama
// ─────────────────────────────────────────────────────────────
function ServicePageInner() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const currentYear = new Date().getFullYear();

  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [alert, setAlert] = useState(null);

  const [year, setYear] = useState(String(currentYear));
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle') || '');

  const [modal, setModal] = useState(null); // { editData }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showAlert = (message) => {
    setAlert(message);
    setTimeout(() => setAlert(null), 3500);
  };

  const loadVehicles = useCallback(async () => {
    const { data } = await supabase.from('vehicles').select('id, name, plate_number').order('name');
    setVehicles(data || []);
  }, [supabase]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year !== 'all') {
      params.set('start_date', `${year}-01-01`);
      params.set('end_date', `${year}-12-31`);
    }
    if (vehicleFilter) params.set('vehicle_id', vehicleFilter);
    try {
      const res = await fetch(`/api/service-logs?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (res.status === 503 && json.needsMigration) {
        setNeedsMigration(true);
        setLogs([]);
      } else if (!res.ok) {
        throw new Error(json.error || 'Gagal memuat riwayat servis.');
      } else {
        setNeedsMigration(false);
        setLogs(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      showAlert(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, vehicleFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadVehicles(); }, [loadVehicles]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const totalCost = logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
  const yearOptions = [];
  for (let y = currentYear; y >= FIRST_YEAR; y -= 1) yearOptions.push(String(y));

  const handleSaved = (message) => {
    setModal(null);
    showAlert(message);
    loadLogs();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/service-logs/${confirmDelete.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus catatan servis.');
      setConfirmDelete(null);
      setModal(null);
      showAlert('Catatan servis dihapus.');
      loadLogs();
    } catch (err) {
      showAlert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Servis Motor</h1>
          <p className="dash2-muted">Catatan servis setiap motor</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ editData: null })} disabled={needsMigration}>
          <Icon fa="fa-solid fa-plus" aria-hidden="true" /> Catat servis
        </button>
      </div>

      {alert && <div className="alert">{alert}</div>}
      {needsMigration && (
        <div className="alert">Tabel servis belum dibuat di database. Jalankan <code>supabase/migrations/002_service_logs.sql</code> di Supabase → SQL Editor.</div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select className="form-control" aria-label="Filter motor" value={vehicleFilter}
          onChange={e => setVehicleFilter(e.target.value)} style={{ flex: '1 1 200px', width: 'auto' }}>
          <option value="">Semua motor</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>)}
        </select>
        <select className="form-control" aria-label="Filter tahun" value={year}
          onChange={e => setYear(e.target.value)} style={{ flex: '0 1 140px', width: 'auto' }}>
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          <option value="all">Semua tahun</option>
        </select>
      </div>

      <div className="list-card">
        <div className="dash2-row"><span>Jumlah catatan</span><strong>{loading ? '…' : logs.length}</strong></div>
        <div className="dash2-row"><span>Total biaya servis</span><strong>{loading ? '…' : formatRupiah(totalCost)}</strong></div>
      </div>

      <div className="list-card">
        {loading ? (
          <div className="list-row"><span className="list-row-sub"><Icon fa="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Memuat catatan…</span></div>
        ) : logs.length === 0 ? (
          <div className="list-row">
            <span className="list-row-text">
              <span className="list-row-title">Belum ada catatan servis</span>
              <span className="list-row-sub">Tekan “Catat servis” setiap kali motor diservis.</span>
            </span>
          </div>
        ) : logs.map(l => (
          <button key={l.id} type="button" className="list-row" onClick={() => setModal({ editData: l })}
            style={{ width: '100%', background: 'none', border: 0, borderTop: '1px solid var(--bg-border)', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
            <span className="list-row-icon"><Icon fa="fa-solid fa-screwdriver-wrench" aria-hidden="true" /></span>
            <span className="list-row-text">
              <span className="list-row-title">{vehicleLabel(l.vehicles)}</span>
              <span className="list-row-sub">
                {formatDateId(l.service_date)}
                {(l.items || []).length > 0 && ` · ${l.items.join(', ')}`}
                {l.workshop && ` · ${l.workshop}`}
              </span>
              {l.notes && <span className="list-row-sub" style={{ whiteSpace: 'pre-line' }}>{l.notes}</span>}
            </span>
            <span className="list-row-value">{Number(l.cost) > 0 ? formatRupiah(l.cost) : '-'}</span>
          </button>
        ))}
      </div>

      {modal && (
        <ServiceLogModal
          vehicles={vehicles}
          editData={modal.editData}
          defaultVehicleId={vehicleFilter}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDelete={(l) => setConfirmDelete(l)}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Hapus catatan servis?</div>
              <button className="modal-close" type="button" onClick={() => setConfirmDelete(null)} disabled={deleting} aria-label="Tutup">✕</button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              {vehicleLabel(confirmDelete.vehicles)} — {formatDateId(confirmDelete.service_date)}.
              {confirmDelete.expense_id && <> Pengeluaran {formatRupiah(confirmDelete.cost)} yang terhubung di Keuangan juga akan dihapus.</>}
            </p>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>Batal</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Icon fa="fa-solid fa-spinner fa-spin" aria-hidden="true" /> : <Icon fa="fa-solid fa-trash" aria-hidden="true" />} Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicePage() {
  return (
    <Suspense fallback={null}>
      <ServicePageInner />
    </Suspense>
  );
}
