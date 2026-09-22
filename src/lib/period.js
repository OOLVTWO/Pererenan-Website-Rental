/**
 * Periode bersama untuk Dashboard, Keuangan, dan Laporan — supaya angkanya
 * bisa dibandingkan langsung. Default: bulan berjalan (bukan "semua waktu",
 * yang dulu membuat halaman Keuangan menarik seluruh riwayat dan tampil minus).
 */
import { getLocalDateStr } from '@/lib/finance';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const PERIOD_OPTIONS = [
  { key: 'this_month', label: 'Bulan ini' },
  { key: 'last_month', label: 'Bulan lalu' },
  { key: 'last_3_months', label: '3 bulan terakhir' },
  { key: 'this_year', label: 'Tahun ini' },
  { key: 'all', label: 'Semua' },
  { key: 'custom', label: 'Atur sendiri' },
];

export function getPeriodRange(key, custom = {}) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (key === 'last_month') {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return { start: iso(start), end: iso(end), label: `${MONTHS[start.getMonth()]} ${start.getFullYear()}` };
  }
  if (key === 'last_3_months') {
    const start = new Date(y, m - 2, 1);
    return { start: iso(start), end: getLocalDateStr(), label: `${MONTHS[start.getMonth()]} – ${MONTHS[m]} ${y}` };
  }
  if (key === 'this_year') {
    return { start: `${y}-01-01`, end: `${y}-12-31`, label: `Tahun ${y}` };
  }
  if (key === 'all') {
    return { start: '2000-01-01', end: '2999-12-31', label: 'Semua periode' };
  }
  if (key === 'custom') {
    const start = custom.start || iso(new Date(y, m, 1));
    const end = custom.end || getLocalDateStr();
    return { start, end, label: `${formatTanggal(start)} – ${formatTanggal(end)}` };
  }
  return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)), label: `${MONTHS[m]} ${y}` };
}

/** Tanggal Indonesia: 23 Sep 2026 (bukan 09/23/2026). */
export function formatTanggal(value, opts = {}) {
  if (!value) return '-';
  const s = String(value).slice(0, 10);
  const [yy, mm, dd] = s.split('-').map(Number);
  if (!yy || !mm || !dd) return '-';
  return new Date(yy, mm - 1, dd).toLocaleDateString('id-ID', { day: 'numeric', month: opts.long ? 'long' : 'short', year: 'numeric' });
}
