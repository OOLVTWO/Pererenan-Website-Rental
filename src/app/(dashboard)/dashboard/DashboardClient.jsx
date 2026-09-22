'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { formatRupiah } from '@/lib/finance';
import { formatTanggal } from '@/lib/period';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const FIRST_YEAR = 2026;

function shortRupiah(n) {
  const v = Number(n || 0);
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (v >= 1e3) return `${Math.round(v / 1e3).toLocaleString('id-ID')} rb`;
  return v.toLocaleString('id-ID');
}

function statusPill(tx) {
  if (tx.status === 'active' && tx.payment_status === 'unpaid') return { label: 'Belum bayar', cls: 'strong' };
  if (tx.status === 'active') return { label: 'Aktif', cls: 'soft' };
  if (tx.status === 'completed') return { label: 'Selesai', cls: 'muted' };
  return { label: 'Batal', cls: 'muted' };
}

/**
 * Dashboard (klien): hanya menampilkan angka yang SUDAH dihitung di database
 * (migration 006). Ganti periode = satu panggilan ke /api/dashboard.
 */
export default function DashboardClient({ initialSummary, overview, initialMonthly, initialPeriod, error }) {
  const now = new Date();
  const [summary, setSummary] = useState(initialSummary);
  const [monthly, setMonthly] = useState(initialMonthly || []);
  const [period, setPeriod] = useState(initialPeriod);
  const [mode, setMode] = useState('month');
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(initialPeriod?.year || now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(error);

  const load = useCallback(async (nextMode, nextMonth, nextYear) => {
    const start = nextMode === 'year' ? `${nextYear}-01-01` : `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    const end = nextMode === 'year' ? `${nextYear}-12-31` : `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${lastDay}`;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?start=${start}&end=${end}&year=${nextYear}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat ringkasan.');
      setSummary(json.summary);
      setMonthly(json.monthly || []);
      setPeriod({ start, end, year: nextYear });
      setAlert(null);
    } catch (err) {
      setAlert(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeMode = (m) => { setMode(m); load(m, month, year); };
  const changeMonth = (m) => { setMonth(m); load(mode, m, year); };
  const changeYear = (y) => { setYear(y); load(mode, month, y); };

  const s = summary || {};
  const o = overview || {};
  const netProfit = Number(s.rentalRevenue || 0) + Number(s.otherIncome || 0)
    - Number(s.totalExpenses || 0) - Number(s.investorPayout || 0);
  const periodLabel = mode === 'year' ? `Tahun ${year}` : `${MONTH_NAMES[month]} ${year}`;

  const attention = [
    Number(o.overdueCount) > 0 && { href: '/tracking?tab=overdue', icon: 'fa-solid fa-circle-exclamation', title: `${o.overdueCount} sewa lewat jatuh tempo`, sub: 'Hubungi penyewa sekarang' },
    Number(o.dueSoonCount) > 0 && { href: '/tracking?tab=critical', icon: 'fa-regular fa-clock', title: `${o.dueSoonCount} sewa berakhir hari ini/besok`, sub: 'Kirim pengingat WhatsApp' },
    Number(o.unpaidCount) > 0 && { href: '/transactions', icon: 'fa-solid fa-money-bill-wave', title: `${o.unpaidCount} sewa belum dibayar`, sub: `Total ${formatRupiah(o.unpaidTotal)}` },
  ].filter(Boolean);

  const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;
  const chart = MONTH_SHORT
    .map((label, i) => ({ label, idx: i, total: Number((monthly || []).find(m => Number(m.bulan) === i + 1)?.total || 0) }))
    .filter(m => m.idx <= maxMonth);
  const firstData = chart.findIndex(m => m.total > 0);
  const chartMonths = firstData >= 0 ? chart.slice(firstData) : chart.slice(-3);
  const chartMax = Math.max(1, ...chartMonths.map(m => m.total));

  const totalFleet = Number(o.totalVehicles) || 1;
  const yearOptions = [];
  for (let y = now.getFullYear(); y >= FIRST_YEAR; y -= 1) yearOptions.push(y);

  return (
    <div className="dash2">
      <div className="dash2-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Ringkasan</h1>
          <p className="dash2-muted">
            {periodLabel}
            {loading && <> · <Icon fa="fa-solid fa-spinner" spin /> memuat…</>}
          </p>
        </div>
        <div className="dash2-period">
          <div className="dash2-seg" role="group" aria-label="Jenis periode">
            <button type="button" className={mode === 'month' ? 'active' : ''} onClick={() => changeMode('month')}>Bulan</button>
            <button type="button" className={mode === 'year' ? 'active' : ''} onClick={() => changeMode('year')}>Tahun</button>
          </div>
          {mode === 'month' && (
            <select className="form-control dash2-select" aria-label="Pilih bulan" value={month} onChange={e => changeMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
            </select>
          )}
          <select className="form-control dash2-select" aria-label="Pilih tahun" value={year} onChange={e => changeYear(Number(e.target.value))}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <Link href="/transactions?new=1" className="btn btn-primary dash2-cta">
          <Icon fa="fa-solid fa-plus" /> Transaksi baru
        </Link>
      </div>

      {alert && <div className="alert">{alert}</div>}

      <div className="dash2-grid">
        <section className="dash2-col">
          <div className="dash2-section-head">
            <h2>Keuangan</h2>
            <Link href="/reports">Laporan <Icon fa="fa-solid fa-chevron-right" size={12} /></Link>
          </div>
          <div className="list-card">
            <div className="dash2-hero">
              <span className="dash2-muted">Pendapatan sewa · {Number(s.paidCount || 0)} transaksi lunas</span>
              <span className="dash2-big">{formatRupiah(s.rentalRevenue)}</span>
              <span className="dash2-muted">Hari ini: <strong>{formatRupiah(s.todayRevenue)}</strong></span>
            </div>
            <div className="dash2-row"><span>Pemasukan lain</span><strong>{formatRupiah(s.otherIncome)}</strong></div>
            <div className="dash2-row"><span>Pengeluaran</span><strong>− {formatRupiah(s.totalExpenses)}</strong></div>
            {Number(s.investorPayout) > 0 && (
              <div className="dash2-row"><span>Bagi hasil investor</span><strong>− {formatRupiah(s.investorPayout)}</strong></div>
            )}
            <div className="dash2-row total"><span>Laba bersih owner</span><strong>{formatRupiah(netProfit)}</strong></div>
          </div>
        </section>

        <section className="dash2-col">
          <div className="dash2-section-head"><h2>Perlu perhatian</h2></div>
          <div className="list-card">
            {attention.length === 0 ? (
              <div className="list-row">
                <span className="list-row-icon"><Icon fa="fa-solid fa-check" /></span>
                <span className="list-row-text">
                  <span className="list-row-title">Semua aman</span>
                  <span className="list-row-sub">Tidak ada yang perlu ditindaklanjuti</span>
                </span>
              </div>
            ) : attention.map(a => (
              <Link key={a.title} href={a.href} className="list-row">
                <span className="list-row-icon"><Icon fa={a.icon} /></span>
                <span className="list-row-text">
                  <span className="list-row-title">{a.title}</span>
                  <span className="list-row-sub">{a.sub}</span>
                </span>
                <Icon fa="fa-solid fa-chevron-right" className="list-row-chev" size={13} />
              </Link>
            ))}
          </div>

          <div className="dash2-section-head">
            <h2>Armada</h2>
            <Link href="/tracking?view=armada">Status armada <Icon fa="fa-solid fa-chevron-right" size={12} /></Link>
          </div>
          <div className="list-card dash2-pad">
            <div className="dash2-tiles">
              <div><strong>{Number(o.rentedCount || 0)}</strong><span>Disewa</span></div>
              <div><strong>{Number(o.availableCount || 0)}</strong><span>Tersedia</span></div>
            </div>
            <div className="dash2-bar" aria-hidden="true">
              <span className="b1" style={{ width: `${(Number(o.rentedCount || 0) / totalFleet) * 100}%` }}></span>
              <span className="b2" style={{ width: `${(Number(o.availableCount || 0) / totalFleet) * 100}%` }}></span>
            </div>
            <span className="dash2-muted">
              {Math.round((Number(o.rentedCount || 0) / totalFleet) * 100)}% dari {Number(o.totalVehicles || 0)} motor sedang disewa
            </span>
          </div>
        </section>

        <section className="dash2-col">
          <div className="dash2-section-head"><h2>Pendapatan sewa per bulan · {year}</h2></div>
          <div className="list-card dash2-pad">
            {chartMonths.every(m => m.total === 0) ? (
              <span className="dash2-muted">Belum ada pendapatan di tahun ini.</span>
            ) : (
              <div className="dash2-chart" role="img" aria-label={`Pendapatan sewa per bulan tahun ${year}`}>
                {chartMonths.map(m => (
                  <div key={m.label} className="dash2-chart-col">
                    <span className="dash2-chart-val">{m.total > 0 ? shortRupiah(m.total) : '–'}</span>
                    <span
                      className={`dash2-chart-bar${mode === 'month' && m.idx === month ? ' on' : ''}`}
                      style={{ height: `${Math.max(4, (m.total / chartMax) * 120)}px` }}
                    ></span>
                    <span className="dash2-chart-label">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash2-section-head">
            <h2>Transaksi terbaru</h2>
            <Link href="/transactions">Semua <Icon fa="fa-solid fa-chevron-right" size={12} /></Link>
          </div>
          <div className="list-card">
            {(o.recent || []).length === 0 ? (
              <div className="list-row"><span className="list-row-sub">Belum ada transaksi.</span></div>
            ) : (o.recent || []).map(tx => {
              const st = statusPill(tx);
              return (
                <Link key={tx.id} href="/transactions" className="list-row">
                  <span className="list-row-text">
                    <span className="list-row-title">{tx.renter_name}</span>
                    <span className="list-row-sub">{tx.vehicle_name || 'Motor'} · {tx.duration_days || 1} hari</span>
                  </span>
                  <span className="dash2-tx-right">
                    <span className="list-row-value">{formatRupiah(tx.total_price)}</span>
                    <span className={`dash2-pill ${st.cls}`}>{st.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <p className="dash2-muted" style={{ marginTop: 4 }}>
        Periode: {formatTanggal(period?.start)} – {formatTanggal(period?.end)} · laba bersih sudah dikurangi bagi hasil investor.
      </p>
    </div>
  );
}
