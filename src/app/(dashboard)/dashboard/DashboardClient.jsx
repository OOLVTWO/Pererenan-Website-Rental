'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { calcFinancialSummary, formatRupiah, getLocalMonthStr, getLocalDateStr, toLocalDateStr, isPaidTransaction, isIncomeEntry } from '@/lib/finance';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - today) / 86400000);
}

function shortRupiah(n) {
  const v = Number(n || 0);
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (v >= 1e3) return `${Math.round(v / 1e3).toLocaleString('id-ID')} rb`;
  return v.toLocaleString('id-ID');
}

function txStatus(tx) {
  if (tx.status === 'active' && tx.payment_status === 'unpaid') return { label: 'Belum bayar', cls: 'strong' };
  if (tx.status === 'active') return { label: 'Aktif', cls: 'soft' };
  if (tx.status === 'completed') return { label: 'Selesai', cls: 'muted' };
  return { label: 'Dibatalkan', cls: 'muted' };
}

export default function DashboardClient({ transactions, vehicles, loadedYear }) {
  const [expenses, setExpenses] = useState([]);
  const [periodMode, setPeriodMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthStr());
  const [selectedYear, setSelectedYear] = useState(getLocalMonthStr().substring(0, 4));
  // Fallback aman kalau prop loadedYear entah kenapa tidak terkirim.
  const effectiveLoadedYear = loadedYear || Number(getLocalMonthStr().substring(0, 4));
  // Tahun transaksi & expenses yang sudah dimuat dari server (tahun berjalan
  // saat halaman pertama kali dibuka). Kalau user pindah ke tahun lain lewat
  // selector, effect di bawah fetch data tahun itu on-demand dan menyimpannya
  // di sini — tanpa ini, memilih tahun lampau akan tampak kosong karena
  // datanya memang belum pernah diminta dari server.
  const [extraYearData, setExtraYearData] = useState(null); // { year, transactions, expenses }
  const [loadingYear, setLoadingYear] = useState(false);

  // Tahun mana yang SEDANG dilihat user, baik lewat mode Bulanan (tahun ikut
  // bagian dari selectedMonth) maupun mode Tahunan (selectedYear).
  const viewingYear = periodMode === 'year' ? selectedYear : selectedMonth.substring(0, 4);

  useEffect(() => {
    if (viewingYear === String(effectiveLoadedYear)) return; // sudah dimuat server, tidak perlu fetch
    if (extraYearData?.year === viewingYear) return; // tahun ini sudah pernah di-fetch, jangan ulang

    let cancelled = false;
    (async () => {
      setLoadingYear(true);
      const start = `${viewingYear}-01-01`;
      const end = `${viewingYear}-12-31`;
      let tx = [];
      let exp = [];
      try {
        const res = await fetch(`/api/transactions?start_date=${start}&end_date=${end}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) tx = data;
        }
      } catch (err) {
        console.error('Fetch transaksi tahun lain error:', err);
      }
      try {
        const res = await fetch(`/api/expenses?start_date=${start}&end_date=${end}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) exp = data;
        }
      } catch (err) {
        console.error('Fetch expenses tahun lain error:', err);
      }
      if (!cancelled) {
        setExtraYearData({ year: viewingYear, transactions: tx, expenses: exp });
        setLoadingYear(false);
      }
    })();
    return () => { cancelled = true; };
  }, [viewingYear, effectiveLoadedYear, extraYearData]);

  useEffect(() => {
    (async () => {
      let list = null;
      // PERBAIKAN: dulu tanpa batas tanggal sama sekali — ikut ditarik
      // seluruhnya setiap load, sama seperti masalah transactions di atas.
      // Dibatasi ke tahun yang sama dengan transactions (loadedYear) supaya
      // konsisten; tahun lain di-fetch on-demand lewat effect di atas.
      const start = `${effectiveLoadedYear}-01-01`;
      const end = `${effectiveLoadedYear}-12-31`;
      try {
        const res = await fetch(`/api/expenses?start_date=${start}&end_date=${end}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) list = data;
        }
      } catch (err) {
        console.error('Fetch expenses via API error:', err);
      }
      if (list === null) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .gte('expense_date', start)
            .lte('expense_date', end)
            .order('expense_date', { ascending: false });
          if (!error) list = data || [];
        } catch (err) {
          console.error('Fetch expenses via Supabase error:', err);
        }
      }
      setExpenses(list || []);
    })();
  }, [effectiveLoadedYear]);

  // Kalau user sedang melihat tahun selain yang dimuat server, pakai data
  // on-demand (extraYearData); selain itu pakai data awal dari server/props.
  const viewingExtraYear = extraYearData?.year === viewingYear && viewingYear !== String(effectiveLoadedYear);
  const safeTx       = viewingExtraYear ? (extraYearData.transactions || []) : (Array.isArray(transactions) ? transactions : []);
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeExpenses = viewingExtraYear ? (extraYearData.expenses || []) : (Array.isArray(expenses) ? expenses : []);

  const periodRange = useMemo(() => {
    const currentYear = getLocalMonthStr().substring(0, 4);
    if (periodMode === 'year') {
      return {
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`,
        label: `Tahun ${selectedYear}`,
        isCurrent: selectedYear === currentYear,
      };
    }
    const parts = selectedMonth.split('-').map(Number);
    const y = parts[0];
    const m = parts[1];
    const lastDay = new Date(y, m, 0).getDate();
    return {
      start: `${selectedMonth}-01`,
      end: `${selectedMonth}-${String(lastDay).padStart(2, '0')}`,
      label: `${MONTH_NAMES[m - 1]} ${y}`,
      isCurrent: selectedMonth === getLocalMonthStr(),
    };
  }, [periodMode, selectedMonth, selectedYear]);

  const filteredTx = safeTx.filter(t => {
    const d = toLocalDateStr(t.created_at);
    return d >= periodRange.start && d <= periodRange.end;
  });

  const filteredExpenses = safeExpenses.filter(e => {
    const d = e.expense_date || toLocalDateStr(e.created_at);
    return d >= periodRange.start && d <= periodRange.end;
  });

  const yearOptions = useMemo(() => {
    // PERBAIKAN: dulu daftar tahun di-derive dari transaksi yang SUDAH
    // dimuat (safeTx) — tapi sekarang transaksi awal hanya mencakup tahun
    // berjalan (lihat catatan performa di atas), jadi kalau tetap begini,
    // dropdown tahun cuma akan pernah menampilkan SATU pilihan (tahun ini)
    // selamanya — user tidak akan pernah bisa memilih tahun lalu sama
    // sekali, karena data tahun lalu memang belum pernah dimuat untuk
    // "ditemukan" oleh logic ini. Diganti ke rentang tetap (5 tahun ke
    // belakang) yang tidak bergantung pada data yang sudah di-fetch —
    // memilih tahun yang datanya belum dimuat akan otomatis memicu
    // on-demand fetch (lihat useEffect viewingYear di atas).
    const current = Number(getLocalMonthStr().substring(0, 4));
    const years = [];
    for (let y = current; y >= current - 4; y--) years.push(y);
    return years;
  }, []);

  const handleResetPeriod = () => {
    setSelectedMonth(getLocalMonthStr());
    setSelectedYear(getLocalMonthStr().substring(0, 4));
  };

  const today        = getLocalDateStr();
  const paidTx       = filteredTx.filter(isPaidTransaction);
  const todayPaidTx  = paidTx.filter(t => toLocalDateStr(t.created_at) === today);
  // "Pendapatan Hari Ini" = pendapatan sewa motor hari ini + pemasukan
  // Keuangan hari ini (tip, biaya antar-jemput, klaim deposit, dll).
  // Keuangan income yang benar-benar "rental_income" sudah dikecualikan
  // dari kategori yang bisa dipilih saat input (lihat expenses/page.jsx),
  // jadi menjumlahkan keduanya di sini tidak akan menghitung dobel.
  const todayExpenses = safeExpenses.filter(e => (e.expense_date || toLocalDateStr(e.created_at)) === today);
  const todayOtherIncome = todayExpenses.filter(isIncomeEntry).reduce((s, e) => s + Number(e.amount || 0), 0);
  const todayRevenue = todayPaidTx.reduce((s, t) => s + Number(t.total_price || 0), 0) + todayOtherIncome;
  const showToday    = periodRange.isCurrent && periodMode === 'month';

  const activeCount      = safeVehicles.filter(v => v.status === 'rented').length;
  const availableCount   = safeVehicles.filter(v => v.status === 'available').length;
  const maintenanceCount = safeVehicles.filter(v => v.status === 'maintenance').length;

  const summary = calcFinancialSummary({
    transactions: filteredTx,
    expenses: filteredExpenses,
    vehicles: safeVehicles,
  });
  const { totalRevenue, totalExpenses, investorPayout, netProfit } = summary;

  const hasInvestor = safeVehicles.some(v =>
    v.owner_type === 'investor' || v.ownership_type === 'investor'
  );

  const activeTx           = safeTx.filter(t => t.status === 'active');
  const completedTx        = filteredTx.filter(t => t.status === 'completed');
  const totalDepositHeld   = activeTx.reduce((s, t) => s + Number(t.deposit || 0), 0);
  const totalDepositReturned = completedTx.reduce((s, t) => s + Number(t.deposit || 0), 0);

  const unpaidTx    = safeTx.filter(t => t.status === 'active' && t.payment_status === 'unpaid');
  const totalUnpaid = unpaidTx.reduce((s, t) => s + Number(t.total_price || 0), 0);

  const recentTx    = filteredTx.slice(0, 5);

  // Reuse summary.totalRevenue (from calcFinancialSummary) rather than a
  // separate transactions-only calculation, so this figure always matches
  // the "Total Pemasukan" card lower on the page — same period, same
  // rental + Keuangan income combination.
  const periodRevenue = totalRevenue;


  // ── Perlu perhatian: hanya yang ada isinya ──
  const overdueTx = activeTx.filter(t => daysUntil(t.end_date) < 0);
  const dueSoonTx = activeTx.filter(t => { const d = daysUntil(t.end_date); return d === 0 || d === 1; });
  const attention = [
    overdueTx.length > 0 && { href: '/tracking?tab=overdue', icon: 'fa-solid fa-circle-exclamation', title: `${overdueTx.length} sewa lewat jatuh tempo`, sub: 'Hubungi penyewa sekarang' },
    dueSoonTx.length > 0 && { href: '/tracking?tab=critical', icon: 'fa-regular fa-clock', title: `${dueSoonTx.length} sewa berakhir hari ini/besok`, sub: 'Kirim pengingat WhatsApp' },
    unpaidTx.length > 0 && { href: '/transactions', icon: 'fa-solid fa-money-bill-wave', title: `${unpaidTx.length} sewa belum dibayar`, sub: `Total ${formatRupiah(totalUnpaid)}` },
    maintenanceCount > 0 && { href: '/tracking?view=armada&tab=maintenance', icon: 'fa-solid fa-wrench', title: `${maintenanceCount} motor dalam perawatan`, sub: 'Belum bisa disewakan' },
  ].filter(Boolean);

  // ── Pendapatan sewa per bulan (tahun yang sedang dilihat) ──
  const nowMonth = getLocalMonthStr();
  const monthly = MONTH_SHORT.map((label, i) => {
    const key = `${viewingYear}-${String(i + 1).padStart(2, '0')}`;
    const total = safeTx
      .filter(t => isPaidTransaction(t) && toLocalDateStr(t.created_at).startsWith(key))
      .reduce((s, t) => s + Number(t.total_price || 0), 0);
    return { key, label, total };
  }).filter(m => m.key <= nowMonth && (m.total > 0 || m.key.slice(0, 4) === nowMonth.slice(0, 4)));
  const firstWithData = monthly.findIndex(m => m.total > 0);
  const chartMonths = firstWithData >= 0 ? monthly.slice(firstWithData) : monthly.slice(-3);
  const chartMax = Math.max(1, ...chartMonths.map(m => m.total));
  const selectedMonthKey = periodMode === 'month' ? selectedMonth : null;

  const totalFleet = safeVehicles.length || 1;
  const pct = (n) => `${(n / totalFleet) * 100}%`;

  return (
    <div className="dash2">
      {/* ── Judul + periode ── */}
      <div className="dash2-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Ringkasan</h1>
          <p className="dash2-muted">
            {periodRange.label}
            {loadingYear && <> · <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> memuat data {viewingYear}…</>}
          </p>
        </div>
        <div className="dash2-period">
          <div className="dash2-seg" role="group" aria-label="Jenis periode">
            <button type="button" className={periodMode === 'month' ? 'active' : ''} onClick={() => setPeriodMode('month')}>Bulan</button>
            <button type="button" className={periodMode === 'year' ? 'active' : ''} onClick={() => setPeriodMode('year')}>Tahun</button>
          </div>
          {periodMode === 'month' && (
            <select
              className="form-control dash2-select"
              aria-label="Pilih bulan"
              value={selectedMonth.substring(5, 7)}
              onChange={e => setSelectedMonth(`${selectedMonth.substring(0, 4)}-${e.target.value}`)}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>{name}</option>
              ))}
            </select>
          )}
          <select
            className="form-control dash2-select"
            aria-label="Pilih tahun"
            value={periodMode === 'year' ? selectedYear : selectedMonth.substring(0, 4)}
            onChange={e => {
              if (periodMode === 'year') setSelectedYear(e.target.value);
              else setSelectedMonth(`${e.target.value}-${selectedMonth.substring(5, 7)}`);
            }}
          >
            {yearOptions.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          {!periodRange.isCurrent && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetPeriod}>Kembali ke sekarang</button>
          )}
        </div>
        <Link href="/transactions?new=1" className="btn btn-primary dash2-cta">
          <i className="fa-solid fa-plus" aria-hidden="true"></i> Transaksi baru
        </Link>
      </div>

      <div className="dash2-grid">
        {/* ── Kolom 1: Keuangan ── */}
        <section className="dash2-col" aria-labelledby="dash-keuangan">
          <div className="dash2-section-head">
            <h2 id="dash-keuangan">Keuangan</h2>
            <Link href="/reports">Laporan <i className="fa-solid fa-chevron-right" aria-hidden="true"></i></Link>
          </div>
          <div className="list-card">
            <div className="dash2-hero">
              <span className="dash2-muted">Pendapatan sewa · {paidTx.length} transaksi lunas</span>
              <span className="dash2-big">{formatRupiah(summary.rentalRevenue)}</span>
              {showToday && <span className="dash2-muted">Hari ini: <strong>{formatRupiah(todayRevenue)}</strong></span>}
            </div>
            <div className="dash2-row"><span>Pemasukan lain</span><strong>{formatRupiah(summary.otherIncome)}</strong></div>
            <div className="dash2-row"><span>Pengeluaran</span><strong>− {formatRupiah(totalExpenses)}</strong></div>
            {hasInvestor && <div className="dash2-row"><span>Bagi hasil investor</span><strong>− {formatRupiah(investorPayout)}</strong></div>}
            <div className="dash2-row total"><span>Laba bersih</span><strong>{formatRupiah(netProfit)}</strong></div>
            {(totalDepositHeld > 0 || totalDepositReturned > 0) && (
              <div className="dash2-row"><span>Deposit ditahan · dikembalikan</span><strong>{formatRupiah(totalDepositHeld)} · {formatRupiah(totalDepositReturned)}</strong></div>
            )}
          </div>
        </section>

        {/* ── Kolom 2: Perlu perhatian + Armada ── */}
        <section className="dash2-col" aria-labelledby="dash-perhatian">
          <div className="dash2-section-head"><h2 id="dash-perhatian">Perlu perhatian</h2></div>
          <div className="list-card">
            {attention.length === 0 ? (
              <div className="list-row">
                <span className="list-row-icon"><i className="fa-solid fa-check" aria-hidden="true"></i></span>
                <span className="list-row-text"><span className="list-row-title">Semua aman</span><span className="list-row-sub">Tidak ada yang perlu ditindaklanjuti</span></span>
              </div>
            ) : attention.map(a => (
              <Link key={a.href + a.title} href={a.href} className="list-row">
                <span className="list-row-icon"><i className={a.icon} aria-hidden="true"></i></span>
                <span className="list-row-text"><span className="list-row-title">{a.title}</span><span className="list-row-sub">{a.sub}</span></span>
                <i className="fa-solid fa-chevron-right list-row-chev" aria-hidden="true"></i>
              </Link>
            ))}
          </div>

          <div className="dash2-section-head">
            <h2>Armada</h2>
            <Link href="/tracking?view=armada">Status armada <i className="fa-solid fa-chevron-right" aria-hidden="true"></i></Link>
          </div>
          <div className="list-card dash2-pad">
            <div className="dash2-tiles">
              <div><strong>{activeCount}</strong><span>Disewa</span></div>
              <div><strong>{availableCount}</strong><span>Tersedia</span></div>
              <div><strong>{maintenanceCount}</strong><span>Perawatan</span></div>
            </div>
            <div className="dash2-bar" aria-hidden="true">
              <span style={{ width: pct(activeCount) }} className="b1"></span>
              <span style={{ width: pct(availableCount) }} className="b2"></span>
              <span style={{ width: pct(maintenanceCount) }} className="b3"></span>
            </div>
            <span className="dash2-muted">
              {Math.round((activeCount / totalFleet) * 100)}% dari {safeVehicles.length} motor sedang disewa
            </span>
          </div>
        </section>

        {/* ── Kolom 3: Grafik + transaksi terbaru ── */}
        <section className="dash2-col" aria-labelledby="dash-grafik">
          <div className="dash2-section-head"><h2 id="dash-grafik">Pendapatan sewa per bulan · {viewingYear}</h2></div>
          <div className="list-card dash2-pad">
            {chartMonths.every(m => m.total === 0) ? (
              <span className="dash2-muted">Belum ada pendapatan di tahun ini.</span>
            ) : (
              <div className="dash2-chart" role="img" aria-label={`Pendapatan sewa per bulan tahun ${viewingYear}`}>
                {chartMonths.map(m => (
                  <div key={m.key} className="dash2-chart-col">
                    <span className="dash2-chart-val">{m.total > 0 ? shortRupiah(m.total) : '–'}</span>
                    <span className={`dash2-chart-bar${m.key === selectedMonthKey ? ' on' : ''}`} style={{ height: `${Math.max(4, (m.total / chartMax) * 120)}px` }}></span>
                    <span className="dash2-chart-label">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash2-section-head">
            <h2>Transaksi terbaru</h2>
            <Link href="/transactions">Semua <i className="fa-solid fa-chevron-right" aria-hidden="true"></i></Link>
          </div>
          <div className="list-card">
            {recentTx.length === 0 ? (
              <div className="list-row"><span className="list-row-sub">Belum ada transaksi di {periodRange.label}.</span></div>
            ) : recentTx.map(tx => {
              const st = txStatus(tx);
              return (
                <Link key={tx.id} href="/transactions" className="list-row">
                  <span className="list-row-text">
                    <span className="list-row-title">{tx.renter_name}</span>
                    <span className="list-row-sub">{tx.vehicles?.name || 'Motor'} · {tx.duration_days || 1} hari</span>
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
    </div>
  );
}
