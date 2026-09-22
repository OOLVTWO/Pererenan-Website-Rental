'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TX_LIGHT_SELECT, VEHICLE_LIGHT_COLUMNS } from '@/lib/queryColumns';
import { startVisiblePolling } from '@/lib/visiblePolling';
import { getWhatsAppShareUrl, getWaReminderTemplate } from '@/lib/countryCodes';
import FleetStatusPanel, { FLEET_FILTERS } from '@/components/tracking/FleetStatusPanel';
import PageTabs from '@/components/ui/PageTabs';
import Icon from '@/components/ui/Icon';

const VALID_TRACKING_TABS = ['all', 'overdue', 'critical', 'upcoming'];

// Reads ?view= & ?tab= so the sidebar "Tracking Sewa" dropdown links land on
// the right view/filter. Split out because useSearchParams() requires a
// Suspense boundary.
//   /tracking?tab=overdue               → Sewa Aktif, filter Overdue
//   /tracking?view=armada&tab=available → Status Armada, filter Tersedia
function TabFromQuery({ onView, onTab, onFleetTab }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const view = searchParams.get('view') === 'armada' ? 'armada' : 'sewa';
    const tab = searchParams.get('tab');
    onView(view);
    if (view === 'armada') {
      onFleetTab(tab && FLEET_FILTERS.includes(tab) ? tab : 'all');
    } else if (tab && VALID_TRACKING_TABS.includes(tab)) {
      onTab(tab);
    }
  }, [searchParams, onView, onTab, onFleetTab]);
  return null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
}

function formatDateTime(dateStr, createdTime) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (createdTime) {
    const c = new Date(createdTime);
    if (!isNaN(c.getTime())) {
      d.setHours(c.getHours(), c.getMinutes());
    }
  }
  const datePart = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} (${timePart})`;
}

function getExactTargetDate(tx) {
  if (!tx) return new Date();
  const endDate = new Date(tx.end_date || tx.start_date);

  if (tx.created_at) {
    const created = new Date(tx.created_at);
    if (!isNaN(created.getTime())) {
      endDate.setHours(created.getHours(), created.getMinutes(), created.getSeconds(), created.getMilliseconds());
      return endDate;
    }
  }

  // Default ke 23:59:59 jika created_at tidak tersedia
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

function getExactStartDate(tx) {
  if (!tx) return new Date();
  if (tx.created_at) {
    const created = new Date(tx.created_at);
    if (!isNaN(created.getTime())) return created;
  }
  const startDate = new Date(tx.start_date);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

function getDaysLeft(target) {
  const now = new Date();
  const targetEnd = typeof target === 'object' && target !== null ? getExactTargetDate(target) : (() => {
    const d = new Date(target);
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  const diffMs = targetEnd - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getCountdown(tx) {
  const now = new Date();
  const targetEnd = typeof tx === 'object' && tx !== null ? getExactTargetDate(tx) : (() => {
    const d = new Date(tx);
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  const diff = targetEnd - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, diff };
}

function getBizSettings() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('boss_rent_biz_settings');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function generateReminderText(tx, vehicle, type) {
  const biz = getBizSettings();
  const shopName = biz.name || 'Boss Rent Pererenan';
  const shopPhone = biz.phone || '+62 812-3456-7890';
  const shopLocation = biz.location || 'Jl. Pantai Pererenan, Canggu, Badung, Bali';
  const daysLeft = getDaysLeft(tx);
  const overdueAbs = Math.abs(daysLeft);

  const formatEnDate = (dStr) => dStr ? new Date(dStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const statusText = type === 'overdue'
    ? `⛔ OVERDUE ${overdueAbs} day(s)`
    : type === 'today'
    ? '🔔 Ending TODAY'
    : type === 'tomorrow'
    ? '⏳ 1 day left (ends tomorrow)'
    : `⏳ ${daysLeft} days remaining`;

  const template = getWaReminderTemplate();

  return template
    .replaceAll('{RENTER_NAME}', tx.renter_name || 'Customer')
    .replaceAll('{RENTER_PHONE}', tx.renter_phone || '-')
    .replaceAll('{VEHICLE_NAME}', vehicle?.name || 'Motorbike')
    .replaceAll('{PLATE_NUMBER}', vehicle?.plate_number || '-')
    .replaceAll('{START_DATE}', formatEnDate(tx.start_date))
    .replaceAll('{END_DATE}', formatEnDate(tx.end_date))
    .replaceAll('{TIME_LEFT_STATUS}', statusText)
    .replaceAll('{SHOP_NAME}', shopName)
    .replaceAll('{SHOP_LOCATION}', shopLocation)
    .replaceAll('{SHOP_PHONE}', shopPhone);
}

function classifyTx(tx) {
  const targetEnd = getExactTargetDate(tx);
  const now = new Date();
  if (now > targetEnd) return 'overdue';

  const days = getDaysLeft(tx);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return 'upcoming';
  return 'future';
}

// ─── Countdown Display ─────────────────────────────────────────────────────
function CountdownTimer({ tx }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const update = () => setCountdown(getCountdown(tx));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tx]);

  const targetEnd = getExactTargetDate(tx);
  const now = new Date();
  const isOverdue = now > targetEnd;

  if (isOverdue) {
    const overdueMs = now - targetEnd;
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueDays = Math.floor(overdueHours / 24);
    const overdueText = overdueDays > 0 ? `${overdueDays} HARI ${overdueHours % 24} JAM` : `${overdueHours} JAM`;

    return (
      <div className="countdown-display overdue">
        <div className="countdown-overdue-badge">
          <Icon fa="fa-solid fa-triangle-exclamation" />
          <span>OVERDUE {overdueText}</span>
        </div>
      </div>
    );
  }

  if (!countdown) {
    return (
      <div className="countdown-display overdue">
        <div className="countdown-overdue-badge">
          <Icon fa="fa-solid fa-triangle-exclamation" />
          <span>BERAKHIR SEKARANG</span>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-display">
      <div className="countdown-units">
        <div className="countdown-unit">
          <span className="countdown-value">{String(countdown.days).padStart(2, '0')}</span>
          <span className="countdown-label">Hari</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <span className="countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
          <span className="countdown-label">Jam</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <span className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">Mnt</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <span className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">Dtk</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tracking Card ──────────────────────────────────────────────────────────
function TrackingCard({ tx, vehicle, onComplete }) {
  const [copied, setCopied] = useState(false);
  const [confirmSelesai, setConfirmSelesai] = useState(false);
  const [completing, setCompleting] = useState(false);
  const type = classifyTx(tx);
  const daysLeft = getDaysLeft(tx);

  // "now" yang ticking via state — Date.now() tidak boleh dipanggil langsung saat render (purity).
  // Progress bar tetap hidup: refresh tiap 30 detik.
  const [nowTs, setNowTs] = useState(null);
  useEffect(() => {
    const update = () => setNowTs(Date.now());
    Promise.resolve().then(update);
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  const categoryMeta = {
    overdue: { label: 'Overdue', color: '#1E3A8A', bg: 'rgba(30,58,138,0.1)', border: 'rgba(30,58,138,0.3)', icon: 'fa-solid fa-circle-exclamation', pulse: true },
    today: { label: 'Hari Ini', color: '#1E40AF', bg: 'rgba(30,64,175,0.1)', border: 'rgba(30,64,175,0.3)', icon: 'fa-solid fa-bell', pulse: true },
    tomorrow: { label: 'Besok', color: '#1E40AF', bg: 'rgba(30,64,175,0.08)', border: 'rgba(30,64,175,0.25)', icon: 'fa-solid fa-clock', pulse: false },
    upcoming: { label: `${daysLeft} Hari Lagi`, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: 'fa-solid fa-calendar-days', pulse: false },
    future: { label: `${daysLeft} Hari Lagi`, color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.2)', icon: 'fa-solid fa-calendar-check', pulse: false },
  };
  const meta = categoryMeta[type];

  const reminderText = generateReminderText(tx, vehicle, type);
  const waUrl = getWhatsAppShareUrl(tx.renter_phone, reminderText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reminderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // Progress bar for time elapsed using exact creation timestamp
  const startD = getExactStartDate(tx);
  const endD = getExactTargetDate(tx);
  const totalMs = endD - startD;
  const elapsedMs = (nowTs ?? startD.getTime()) - startD;
  const progress = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;
  const isOverProgress = progress >= 100;

  return (
    <div className="tracking-card" style={{ borderColor: meta.border, background: `var(--bg-card)` }}>
      {/* Top Badge */}
      <div className="tracking-card-top">
        <div className="tracking-status-badge" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
          <Icon fa={`${meta.icon} ${meta.pulse ? 'fa-beat' : ''}`} />
          <span>{meta.label}</span>
        </div>
        <div className="tracking-vehicle-info">
          <Icon fa="fa-solid fa-motorcycle" style={{ color: meta.color }} />
          <span>{vehicle?.name || 'Motor'}</span>
          <span className="tracking-plate">{vehicle?.plate_number || '-'}</span>
        </div>
      </div>

      {/* Renter Info */}
      <div className="tracking-renter">
        <div className="tracking-renter-avatar" style={{ background: meta.color }}>
          <Icon fa="fa-solid fa-user" />
        </div>
        <div className="tracking-renter-info">
          <div className="tracking-renter-name">{tx.renter_name}</div>
          <div className="tracking-renter-phone">
            <Icon fa="fa-solid fa-phone" style={{ fontSize: '10px', color: '#1D4ED8' }} />
            {tx.renter_phone}
          </div>
        </div>
        <div className="tracking-dates">
          <div className="tracking-date-row" title="Waktu Mulai Sewa (Jam Transaksi)">
            <Icon fa="fa-solid fa-calendar-plus" style={{ color: '#5B6474', fontSize: '11px' }} />
            <span>{formatDateTime(tx.start_date, tx.created_at)}</span>
          </div>
          <div className="tracking-date-arrow">
            <Icon fa="fa-solid fa-arrow-down" style={{ color: '#5B6474', fontSize: '10px' }} />
          </div>
          <div className="tracking-date-row" style={{ color: meta.color, fontWeight: 600 }} title="Waktu Selesai Sewa (Persis Jam yang sama)">
            <Icon fa="fa-solid fa-calendar-xmark" style={{ fontSize: '11px' }} />
            <span>{formatDateTime(tx.end_date, tx.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tracking-progress-wrap">
        <div className="tracking-progress-labels">
          <span><Icon fa="fa-solid fa-hourglass-start" style={{ fontSize: '10px', marginRight: '4px' }} />Mulai</span>
          <span style={{ color: isOverProgress ? '#1E3A8A' : meta.color }}>
            {isOverProgress ? 'Sudah Berakhir' : `${Math.round(progress)}% berjalan`}
          </span>
          <span><Icon fa="fa-solid fa-flag-checkered" style={{ fontSize: '10px', marginRight: '4px' }} />Selesai</span>
        </div>
        <div className="tracking-progress-bar">
          <div
            className="tracking-progress-fill"
            style={{
              width: `${progress}%`,
              background: isOverProgress
                ? '#1E3A8A'
                : meta.color
            }}
          ></div>
        </div>
      </div>

      {/* Countdown */}
      <CountdownTimer tx={tx} />

      {/* Action Buttons */}
      <div className="tracking-actions">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tracking-btn-wa"
        >
          <Icon fa="fa-brands fa-whatsapp" />
          <span>Kirim Reminder WA</span>
        </a>
        <button className="tracking-btn-copy" onClick={handleCopy} title="Salin teks pesan">
          <Icon fa={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'} />
          <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
        </button>
      </div>

      {/* Selesai Sewa Button */}
      {!confirmSelesai ? (
        <button
          onClick={() => setConfirmSelesai(true)}
          style={{
            width: '100%', marginTop: '10px', padding: '10px 16px',
            borderRadius: '10px', border: '1.5px solid rgba(29,78,216,0.5)',
            background: 'rgba(29,78,216,0.08)', color: '#1D4ED8',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Icon fa="fa-solid fa-flag-checkered" />
          Selesai Sewa (Manual)
        </button>
      ) : (
        <div style={{
          marginTop: '10px', padding: '12px', borderRadius: '10px',
          border: '1.5px solid rgba(29,78,216,0.5)', background: 'rgba(29,78,216,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
            <Icon fa="fa-solid fa-triangle-exclamation" style={{ marginRight: '5px', color: '#1E40AF' }} />
            Yakin selesaikan sewa ini? Motor akan langsung jadi <strong>Tersedia</strong>.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmSelesai(false)}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px',
                border: '1px solid var(--bg-border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer'
              }}
            >Batal</button>
            <button
              disabled={completing}
              onClick={async () => {
                setCompleting(true);
                await onComplete(tx.id, tx.vehicle_id);
                setCompleting(false);
                setConfirmSelesai(false);
              }}
              style={{
                flex: 2, padding: '8px', borderRadius: '8px',
                border: 'none', background: '#1D4ED8',
                color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              {completing
                ? <><Icon fa="fa-solid fa-spinner fa-spin" /> Memproses...</>
                : <><Icon fa="fa-solid fa-flag-checkered" /> Ya, Selesaikan!</>}
            </button>
          </div>
        </div>
      )}

      {/* Preview message on hover (expandable) */}
      <details className="tracking-msg-preview">
        <summary>
          <Icon fa="fa-solid fa-eye" style={{ marginRight: '6px' }} />
          Lihat Preview Pesan WA
        </summary>
        <pre className="tracking-msg-text">{reminderText}</pre>
      </details>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const [transactions, setTransactions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('sewa'); // 'sewa' | 'armada'
  const [fleetFilter, setFleetFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [search, setSearch] = useState('');
  const refreshRef = useRef(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: txData }, { data: vData }] = await Promise.all([
      supabase
        .from('transactions')
        .select(TX_LIGHT_SELECT)
        .eq('status', 'active')
        .order('end_date', { ascending: true }),
      supabase.from('vehicles').select(VEHICLE_LIGHT_COLUMNS).order('name'),
    ]);
    const validTxData = (txData || []).filter(tx => tx.vehicles && tx.vehicles.id);
    setTransactions(validTxData);
    setVehicles(vData || []);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  const handleCompleteTracking = useCallback(async (txId, vehicleId) => {
    try {
      // Coba via API route dulu
      const txRes = await fetch(`/api/transactions/${txId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!txRes.ok) {
        // Fallback: update langsung via Supabase jika API gagal
        console.warn('API PUT gagal, fallback ke direct Supabase update');
        const supabase = createClient();
        const { error: txError } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', txId);
        if (txError) throw txError;
        // Update vehicle status langsung
        if (vehicleId) {
          const { error: vError } = await supabase
            .from('vehicles')
            .update({ status: 'available' })
            .eq('id', vehicleId);
          if (vError) console.warn('Vehicle fallback update error:', vError);
        }
      }
      // Jika API berhasil, vehicle status sudah di-update oleh route [id]

      // Reload tracking data
      await loadData();
    } catch (err) {
      console.error('Error completing tracking rental:', err);
      alert('Gagal menyelesaikan sewa. Coba lagi.');
    }
  }, [loadData]);

  useEffect(() => {
    // Defer ke microtask: hindari setState sinkron di dalam effect
    Promise.resolve().then(loadData);
    // Polling hanya saat tab terlihat (hemat kuota egress Supabase)
    refreshRef.current = startVisiblePolling(loadData, 60000);
    return () => refreshRef.current?.();
  }, [loadData]);

  // Build vehicle lookup
  const vehicleMap = Object.fromEntries((vehicles || []).map(v => [v.id, v]));

  // Classify & filter
  const enriched = (transactions || []).map(tx => {
    const vehicle = tx.vehicles || vehicleMap[tx.vehicle_id];
    const type = classifyTx(tx);
    const daysLeft = getDaysLeft(tx.end_date);
    return { tx, vehicle, type, daysLeft };
  });

  const filtered = enriched.filter(({ tx, vehicle, type }) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (tx.renter_name || '').toLowerCase().includes(q)
      || (tx.renter_phone || '').toLowerCase().includes(q)
      || (vehicle?.name || '').toLowerCase().includes(q)
      || (vehicle?.plate_number || '').toLowerCase().includes(q);

    const matchFilter = filter === 'all'
      || (filter === 'overdue' && type === 'overdue')
      || (filter === 'critical' && (type === 'today' || type === 'tomorrow'))
      || (filter === 'upcoming' && (type === 'upcoming' || type === 'future'));

    return matchSearch && matchFilter;
  });

  // Stats
  const overdueCnt = enriched.filter(e => e.type === 'overdue').length;
  const criticalCnt = enriched.filter(e => e.type === 'today' || e.type === 'tomorrow').length;
  const upcomingCnt = enriched.filter(e => e.type === 'upcoming').length;

  const FILTERS = [
    { key: 'all', label: 'Semua', icon: 'fa-solid fa-list', count: enriched.length },
    { key: 'overdue', label: 'Overdue', icon: 'fa-solid fa-circle-exclamation', count: overdueCnt, color: '#1E3A8A' },
    { key: 'critical', label: 'Kritis', icon: 'fa-solid fa-bell', count: criticalCnt, color: '#1E40AF' },
    { key: 'upcoming', label: 'Akan Datang', icon: 'fa-solid fa-calendar-days', count: upcomingCnt, color: '#3B82F6' },
  ];

  return (
    <div className="page-content">
      <Suspense fallback={null}>
        <TabFromQuery onView={setView} onTab={setFilter} onFleetTab={setFleetFilter} />
      </Suspense>

      {/* ── Page Header ── */}
      <div className="tracking-page-header">
        <div className="tracking-header-left">
          <div className="tracking-header-icon">
            <Icon fa="fa-solid fa-clock-rotate-left" />
          </div>
          <div>
            <h2>Tracking Sewa Motor</h2>
            <p>Sewa aktif, pengingat WhatsApp, dan status seluruh armada</p>
          </div>
        </div>
        <div className="tracking-header-right">
          <div className="tracking-refresh-info">
            <Icon fa="fa-solid fa-rotate" style={{ fontSize: '11px', color: '#1D4ED8' }} />
            <span>Auto-refresh tiap 60 detik</span>
            <span className="tracking-refresh-time">
              {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button className="btn-refresh" onClick={loadData}>
            <Icon fa="fa-solid fa-arrows-rotate" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Pilihan tampilan: Sewa aktif | Status armada (dulu halaman Ketersediaan) ── */}
      <PageTabs
        ariaLabel="Tampilan tracking"
        param="view"
        resetParams={['tab']}
        value={view}
        onChange={setView}
        tabs={[
          { key: 'sewa', label: 'Sewa aktif', count: enriched.length },
          { key: 'armada', label: 'Status armada', count: vehicles.length },
        ]}
      />

      {view === 'armada' ? (
        <FleetStatusPanel
          vehicles={vehicles}
          activeTransactions={transactions}
          loading={loading}
          filter={fleetFilter}
          onFilterChange={setFleetFilter}
        />
      ) : (
      <>
      {/* ── Summary Stats ── */}
      <div className="tracking-stats-row">
        <div className="tracking-stat overdue-stat">
          <div className="tracking-stat-icon"><Icon fa="fa-solid fa-circle-exclamation fa-beat" /></div>
          <div>
            <div className="tracking-stat-val">{overdueCnt}</div>
            <div className="tracking-stat-label">Overdue</div>
          </div>
        </div>
        <div className="tracking-stat critical-stat">
          <div className="tracking-stat-icon"><Icon fa="fa-solid fa-bell fa-shake" /></div>
          <div>
            <div className="tracking-stat-val">{criticalCnt}</div>
            <div className="tracking-stat-label">Kritis (Hari ini/Besok)</div>
          </div>
        </div>
        <div className="tracking-stat upcoming-stat">
          <div className="tracking-stat-icon"><Icon fa="fa-solid fa-calendar-days" /></div>
          <div>
            <div className="tracking-stat-val">{upcomingCnt}</div>
            <div className="tracking-stat-label">Akan Datang (2-7 Hari)</div>
          </div>
        </div>
        <div className="tracking-stat total-stat">
          <div className="tracking-stat-icon"><Icon fa="fa-solid fa-motorcycle" /></div>
          <div>
            <div className="tracking-stat-val">{enriched.length}</div>
            <div className="tracking-stat-label">Total Aktif</div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="tracking-controls">
        <PageTabs
          ariaLabel="Filter sewa aktif"
          value={filter}
          onChange={setFilter}
          tabs={FILTERS.map(f => ({ key: f.key, label: f.label, count: f.count }))}
        />
        <div className="tracking-search-wrap">
          <Icon fa="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Cari nama, HP, atau motor..."
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

      {/* ── Content ── */}
      {loading ? (
        <div className="tracking-loading">
          <Icon fa="fa-solid fa-spinner fa-spin-pulse" style={{ fontSize: '32px', color: 'var(--brand-primary)' }} />
          <p>Memuat data sewa aktif...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tracking-empty">
          <Icon fa="fa-solid fa-motorcycle" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>Tidak ada data</h3>
          <p>{enriched.length === 0 ? 'Tidak ada transaksi sewa aktif saat ini.' : 'Tidak ada transaksi yang sesuai filter.'}</p>
          {search && <button className="btn-refresh" onClick={() => setSearch('')} style={{ marginTop: '12px' }}>
            <Icon fa="fa-solid fa-xmark" /> Reset Pencarian
          </button>}
        </div>
      ) : (
        <>
          <div className="tracking-results-info">
            <Icon fa="fa-solid fa-list-check" style={{ color: 'var(--brand-primary)' }} />
            Menampilkan <strong>{filtered.length}</strong> dari <strong>{enriched.length}</strong> transaksi aktif
          </div>
          <div className="tracking-grid">
            {filtered.map(({ tx, vehicle }) => (
              <TrackingCard key={tx.id} tx={tx} vehicle={vehicle} onComplete={handleCompleteTracking} />
            ))}
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}
