'use client';

/**
 * Panel "Status Armada" di halaman Tracking Sewa.
 * Pengganti halaman /availability (Ketersediaan) yang dulu memuat data yang
 * sama persis dan polling sendiri. Sekarang memakai data yang sudah dimuat
 * halaman Tracking (motor + sewa aktif) — cukup satu polling.
 */
import { useState } from 'react';
import PageTabs from '@/components/ui/PageTabs';
import Icon from '@/components/ui/Icon';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysLeft(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - today) / (1000 * 60 * 60 * 24));
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
}

const BRAND_ICONS = {
  honda: { icon: 'fa-solid fa-motorcycle', color: '#1E3A8A', label: 'Honda' },
  yamaha: { icon: 'fa-solid fa-motorcycle', color: '#3B82F6', label: 'Yamaha' },
  suzuki: { icon: 'fa-solid fa-motorcycle', color: '#1E40AF', label: 'Suzuki' },
  kawasaki: { icon: 'fa-solid fa-motorcycle', color: '#1D4ED8', label: 'Kawasaki' },
  vespa: { icon: 'fa-solid fa-person-biking', color: '#1D4ED8', label: 'Vespa' },
  other: { icon: 'fa-solid fa-circle-question', color: '#5B6474', label: 'Lainnya' },
};

// ─── Vehicle Availability Card ──────────────────────────────────────────────
function VehicleCard({ vehicle, activeTransaction }) {
  const brandMeta = BRAND_ICONS[vehicle.category] || BRAND_ICONS.other;

  const isRented = vehicle.status === 'rented' || !!activeTransaction;
  const isAvailable = !isRented;

  const daysLeft = activeTransaction ? getDaysLeft(activeTransaction.end_date) : null;

  const statusMeta = isAvailable
    ? { label: 'Tersedia', color: '#1D4ED8', bg: 'rgba(29,78,216,0.12)', border: 'rgba(29,78,216,0.3)', icon: 'fa-solid fa-circle-check', cls: 'avail-available' }
    : daysLeft < 0
    ? { label: 'Overdue', color: '#1E3A8A', bg: 'rgba(30,58,138,0.12)', border: 'rgba(30,58,138,0.35)', icon: 'fa-solid fa-circle-exclamation', cls: 'avail-overdue' }
    : daysLeft === 0
    ? { label: 'Selesai Hari Ini', color: '#1E40AF', bg: 'rgba(30,64,175,0.12)', border: 'rgba(30,64,175,0.3)', icon: 'fa-solid fa-bell', cls: 'avail-today' }
    : { label: 'Sedang Disewa', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', icon: 'fa-solid fa-key', cls: 'avail-rented' };

  return (
    <div className={`avail-card ${statusMeta.cls}`} style={{ borderColor: statusMeta.border }}>
      {/* Top accent bar */}
      <div className="avail-card-accent" style={{ background: statusMeta.color }}></div>

      {/* Status Badge */}
      <div className="avail-status-badge" style={{ color: statusMeta.color, background: statusMeta.bg, borderColor: statusMeta.border }}>
        <Icon fa={`${statusMeta.icon}${isRented && daysLeft === 0 ? ' fa-shake' : isRented && daysLeft < 0 ? ' fa-beat' : ''}`} />
        {statusMeta.label}
      </div>

      {/* Vehicle Icon & Name */}
      <div className="avail-vehicle-main">
        <div className="avail-vehicle-icon" style={{ color: brandMeta.color, background: `${brandMeta.color}18` }}>
          <Icon fa={brandMeta.icon} />
        </div>
        <div className="avail-vehicle-identity">
          <div className="avail-vehicle-name">{vehicle.name}</div>
          <div className="avail-vehicle-plate">
            <Icon fa="fa-solid fa-id-card" style={{ fontSize: '10px', marginRight: '4px', color: '#5B6474' }} />
            {vehicle.plate_number}
          </div>
          <div className="avail-vehicle-brand" style={{ color: brandMeta.color }}>
            <Icon fa={`${brandMeta.icon}`} style={{ fontSize: '10px', marginRight: '4px' }} />
            {brandMeta.label} · {vehicle.year}
          </div>
        </div>
      </div>

      {/* Rate */}
      <div className="avail-rate">
        <Icon fa="fa-solid fa-tag" style={{ color: 'var(--brand-accent)', fontSize: '11px' }} />
        <span>{formatRupiah(vehicle.rate_per_day)} / hari</span>
      </div>

      {/* If rented — show renter info */}
      {isRented && activeTransaction && (
        <div className="avail-renter-info">
          <div className="avail-renter-divider">
            <Icon fa="fa-solid fa-user-tie" style={{ color: statusMeta.color, marginRight: '6px' }} />
            Info Penyewa
          </div>
          <div className="avail-renter-row">
            <Icon fa="fa-solid fa-user" style={{ color: '#5B6474', fontSize: '11px', width: '14px' }} />
            <span className="avail-renter-name">{activeTransaction.renter_name}</span>
          </div>
          <div className="avail-renter-row">
            <Icon fa="fa-solid fa-phone" style={{ color: '#1D4ED8', fontSize: '11px', width: '14px' }} />
            <span>{activeTransaction.renter_phone}</span>
          </div>
          <div className="avail-renter-row">
            <Icon fa="fa-solid fa-calendar-plus" style={{ color: '#3B82F6', fontSize: '11px', width: '14px' }} />
            <span>Mulai: {formatDate(activeTransaction.start_date)}</span>
          </div>
          <div className="avail-renter-row" style={{ color: statusMeta.color, fontWeight: 600 }}>
            <Icon fa="fa-solid fa-calendar-xmark" style={{ fontSize: '11px', width: '14px' }} />
            <span>Selesai: {formatDate(activeTransaction.end_date)}</span>
          </div>

          {/* Days left indicator */}
          {daysLeft !== null && (
            <div className="avail-days-left" style={{ color: statusMeta.color, background: statusMeta.bg, borderColor: statusMeta.border }}>
              <Icon fa={`fa-solid ${daysLeft < 0 ? 'fa-circle-exclamation fa-beat' : daysLeft === 0 ? 'fa-bell fa-shake' : 'fa-hourglass-half'}`} />
              {daysLeft < 0
                ? `Overdue ${Math.abs(daysLeft)} hari`
                : daysLeft === 0
                ? 'Selesai hari ini!'
                : `Sisa ${daysLeft} hari`}
            </div>
          )}
        </div>
      )}

      {/* If available — show availability indicator */}
      {isAvailable && (
        <div className="avail-ready-badge">
          <Icon fa="fa-solid fa-circle-check fa-beat-fade" style={{ color: '#1D4ED8' }} />
          <span>Siap disewa sekarang</span>
        </div>
      )}


      {/* Warna motor */}
      <div className="avail-km-row">
        <Icon fa="fa-solid fa-paint-roller" style={{ color: '#5B6474', fontSize: '11px' }} />
        <span>{vehicle.color || '-'}</span>
      </div>
    </div>
  );
}

// ─── Main Availability Page ─────────────────────────────────────────────────

export const FLEET_FILTERS = ['all', 'available', 'rented', 'overdue'];

export function enrichFleet(vehicles, activeTransactions) {
  const activeTxMap = {};
  (activeTransactions || []).forEach(tx => { activeTxMap[tx.vehicle_id] = tx; });
  return (vehicles || [])
    .map(v => {
      const activeTx = activeTxMap[v.id] || null;
      const isRented = v.status === 'rented' || !!activeTx;
      const effectiveStatus = isRented ? 'rented' : 'available';
      return { vehicle: v, activeTx, effectiveStatus };
    })
    .sort((a, b) => String(a.vehicle.name || '').localeCompare(String(b.vehicle.name || '')));
}

export default function FleetStatusPanel({ vehicles, activeTransactions, loading, filter, onFilterChange }) {
  const [search, setSearch] = useState('');
  const enrichedVehicles = enrichFleet(vehicles, activeTransactions);

  const availableCount = enrichedVehicles.filter(e => e.effectiveStatus === 'available').length;
  const rentedCount = enrichedVehicles.filter(e => e.effectiveStatus === 'rented').length;
  const overdueCount = enrichedVehicles.filter(e => e.activeTx && getDaysLeft(e.activeTx.end_date) < 0).length;

  const filtered = enrichedVehicles.filter(({ vehicle, effectiveStatus, activeTx }) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || (vehicle.name || '').toLowerCase().includes(q)
      || (vehicle.plate_number || '').toLowerCase().includes(q)
      || (activeTx?.renter_name || '').toLowerCase().includes(q);

    const matchFilter = filter === 'all'
      || (filter === 'available' && effectiveStatus === 'available')
      || (filter === 'rented' && effectiveStatus === 'rented')
      || (filter === 'overdue' && activeTx && getDaysLeft(activeTx.end_date) < 0);

    return matchSearch && matchFilter;
  });

  const FILTERS = [
    { key: 'all', label: 'Semua', icon: 'fa-solid fa-grip', count: enrichedVehicles.length },
    { key: 'available', label: 'Tersedia', icon: 'fa-solid fa-circle-check', count: availableCount, color: '#1D4ED8' },
    { key: 'rented', label: 'Disewa', icon: 'fa-solid fa-key', count: rentedCount, color: '#3B82F6' },
    { key: 'overdue', label: 'Overdue', icon: 'fa-solid fa-circle-exclamation', count: overdueCount, color: '#1E3A8A' },
  ];

  return (
    <>
      {/* ── Summary Bar ── */}
      <div className="avail-summary-bar">
        <div className="avail-summary-item available-item">
          <div className="avail-summary-icon"><Icon fa="fa-solid fa-circle-check" /></div>
          <div className="avail-summary-count">{availableCount}</div>
          <div className="avail-summary-label">Tersedia</div>
        </div>
        <div className="avail-summary-divider"></div>
        <div className="avail-summary-item rented-item">
          <div className="avail-summary-icon"><Icon fa="fa-solid fa-key" /></div>
          <div className="avail-summary-count">{rentedCount}</div>
          <div className="avail-summary-label">Disewa</div>
        </div>
        <div className="avail-summary-divider"></div>
        <div className="avail-summary-item overdue-item-sm">
          <div className="avail-summary-icon"><Icon fa="fa-solid fa-circle-exclamation fa-beat" /></div>
          <div className="avail-summary-count">{overdueCount}</div>
          <div className="avail-summary-label">Overdue</div>
        </div>

        <div className="avail-util-wrap">
          <div className="avail-util-label">
            <Icon fa="fa-solid fa-chart-pie" style={{ marginRight: '5px', color: 'var(--brand-accent)' }} />
            Utilisasi Armada
          </div>
          <div className="avail-util-bar">
            <div
              className="avail-util-fill"
              style={{ width: `${enrichedVehicles.length ? (rentedCount / enrichedVehicles.length) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="avail-util-pct">
            {enrichedVehicles.length ? Math.round((rentedCount / enrichedVehicles.length) * 100) : 0}% disewa
          </div>
        </div>
      </div>

      {/* ── Filter & Search ── */}
      <div className="tracking-controls" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <PageTabs
          ariaLabel="Filter status armada"
          value={filter}
          onChange={onFilterChange}
          tabs={FILTERS.map(f => ({ key: f.key, label: f.label, count: f.count }))}
        />
        <div className="tracking-search-wrap">
          <Icon fa="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Cari nama motor, plat, atau penyewa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="tracking-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="tracking-search-clear">
              <Icon fa="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="tracking-loading">
          <Icon fa="fa-solid fa-spinner fa-spin-pulse" style={{ fontSize: '32px', color: 'var(--brand-primary)' }} />
          <p>Memuat data armada motor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tracking-empty">
          <Icon fa="fa-solid fa-magnifying-glass" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>Tidak ada motor ditemukan</h3>
          <p>Coba ubah filter atau kata pencarian.</p>
        </div>
      ) : (
        <>
          <div className="tracking-results-info">
            <Icon fa="fa-solid fa-motorcycle" style={{ color: 'var(--brand-primary)' }} />
            Menampilkan <strong>{filtered.length}</strong> dari <strong>{enrichedVehicles.length}</strong> motor
          </div>
          <div className="avail-grid">
            {filtered.map(({ vehicle, activeTx }) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} activeTransaction={activeTx} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
