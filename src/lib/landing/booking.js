/**
 * Logika pemesanan halaman publik — fungsi murni (tanpa jaringan/DOM),
 * dipakai BookingIsland dan diuji di booking.test.js.
 */
import { ADDONS, BUSINESS, MONTH_DAYS, WEEK_DAYS } from './config';

/* ── Format ─────────────────────────────────────────────── */

/** 500000 -> "Rp 500.000" (tanpa Intl supaya hasil server = client). */
export function formatRupiah(amount) {
  const n = Math.round(Number(amount) || 0);
  return `Rp ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/** Harga ringkas seperti di kartu mockup: 800000 -> "800rb", 1500000 -> "1,5jt". */
export function formatShort(amount) {
  if (amount >= 1000000) return `${String(Math.round(amount / 100000) / 10).replace('.', ',')}jt`;
  return `${Math.round(amount / 1000)}rb`;
}

/** 100000 -> "Rp 100k". */
export const formatK = (amount) => `Rp ${Math.round(amount / 1000)}k`;

/* ── Tanggal (YYYY-MM-DD, dihitung di UTC supaya bebas zona waktu) ── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86400000;

function parse(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Tanggal lokal perangkat hari ini sebagai YYYY-MM-DD. */
export function todayIso(now = new Date()) {
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const addDays = (iso, n) => toIso(parse(iso) + n * DAY_MS);

/**
 * Jumlah hari sewa, dihitung inklusif seperti di mockup
 * (ambil 24 Sep, kembali 28 Sep = 5 days). Minimal 1.
 */
export function rentalDays(pickUp, returnDate) {
  return Math.max(1, Math.round((parse(returnDate) - parse(pickUp)) / DAY_MS) + 1);
}

/** Tanggal kembali untuk sejumlah hari sewa (kebalikan rentalDays). */
export const returnFor = (pickUp, days) => addDays(pickUp, Math.max(1, days) - 1);

/** "2026-09-24" -> "24 Sep 2026". */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Rentang seperti di mockup: "24 – 28 Sep 2026", "30 Sep – 3 Oct 2026". */
export function formatRange(a, b) {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  if (ya !== yb) return `${formatDate(a)} – ${formatDate(b)}`;
  if (ma !== mb) return `${da} ${MONTHS[ma - 1]} – ${db} ${MONTHS[mb - 1]} ${yb}`;
  return `${da} – ${db} ${MONTHS[mb - 1]} ${yb}`;
}

/**
 * Normalisasi perubahan tanggal/durasi. Mengubah tanggal ambil atau kembali
 * menyesuaikan jumlah hari; mengubah jumlah hari menggeser tanggal kembali.
 * Tanggal ambil tidak boleh sebelum hari ini.
 */
export function updateDates(state, change, today) {
  let { pickUp, returnDate } = state;
  let days = rentalDays(pickUp, returnDate);
  if ('pickUp' in change) {
    pickUp = change.pickUp < today ? today : change.pickUp;
    if (returnDate < pickUp) returnDate = returnFor(pickUp, days);
  }
  if ('returnDate' in change) {
    returnDate = change.returnDate < pickUp ? pickUp : change.returnDate;
  }
  if ('days' in change) {
    days = Math.min(365, Math.max(1, Math.round(change.days) || 1));
    returnDate = returnFor(pickUp, days);
  }
  return { pickUp, returnDate, days: rentalDays(pickUp, returnDate) };
}

/* ── Tarif: kombinasi paket termurah ──────────────────────── */

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Harga sewa dengan kombinasi paket termurah (bulanan = 30 hari,
 * mingguan = 7 hari, sisanya harian) — bukan tarif harian × jumlah hari.
 * Paket boleh menutup lebih dari durasi bila justru lebih murah.
 * Contoh (tarif mingguan < 7× harian): 9 hari = 1 minggu + 2 hari.
 */
export function calcRental(price, days) {
  const n = Math.max(1, Math.round(days) || 1);
  const { daily, weekly, monthly } = price;
  let best = null;
  for (let m = 0; m <= Math.ceil(n / MONTH_DAYS); m++) {
    const afterMonths = Math.max(0, n - m * MONTH_DAYS);
    for (let w = 0; w <= Math.ceil(afterMonths / WEEK_DAYS); w++) {
      const d = Math.max(0, afterMonths - w * WEEK_DAYS);
      const total = m * monthly + w * weekly + d * daily;
      const covered = m * MONTH_DAYS + w * WEEK_DAYS + d;
      const better =
        !best ||
        total < best.total ||
        (total === best.total && (covered < best.covered || (covered === best.covered && m + w + d < best.units)));
      if (better) best = { total, months: m, weeks: w, dailyDays: d, covered, units: m + w + d };
    }
  }
  const { total, months, weeks, dailyDays } = best;
  const plan = months ? 'monthly' : weeks ? 'weekly' : 'daily';
  const label =
    plan === 'daily' ? `${plural(n, 'day')} · daily rate` : `${plural(n, 'day')} · ${plan} rate applied`;
  const parts = [];
  if (months) parts.push(plural(months, 'month'));
  if (weeks) parts.push(plural(weeks, 'week'));
  if (dailyDays) parts.push(plural(dailyDays, 'day'));
  const breakdown = plan === 'daily' ? `Daily rate × ${n}` : parts.join(' + ');
  return { total, days: n, months, weeks, dailyDays, plan, label, breakdown };
}

/** Selisih paket dibanding tarif harian (untuk tabel tarif halaman detail). */
export const saving = (price, days, packagePrice) => Math.max(0, price.daily * days - packagePrice);

/* ── Perlengkapan ─────────────────────────────────────────── */

export const initialAddons = () => Object.fromEntries(ADDONS.map((a) => [a.id, a.initial]));

/** Perlengkapan + status terkunci untuk durasi tertentu. */
export function addonStates(days) {
  return ADDONS.map((a) => ({ ...a, locked: !!a.minDays && days < a.minDays }));
}

/** Batasi jumlah (0..max) dan kosongkan perlengkapan yang terkunci. */
export function normalizeAddons(selection, days) {
  return Object.fromEntries(
    addonStates(days).map((a) => {
      const qty = Math.round(Number(selection?.[a.id]) || 0);
      return [a.id, a.locked ? 0 : Math.min(a.max, Math.max(0, qty))];
    }),
  );
}

/** Total perlengkapan berbayar + baris rinciannya. */
export function calcAddons(selection, days) {
  const qty = normalizeAddons(selection, days);
  const lines = addonStates(days)
    .filter((a) => qty[a.id] > 0)
    .map((a) => ({ id: a.id, name: a.name, qty: qty[a.id], amount: a.price * qty[a.id], free: a.price === 0 }));
  return { qty, lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

/* ── WhatsApp ─────────────────────────────────────────────── */

export function whatsappUrl(message) {
  const base = `https://wa.me/${BUSINESS.phoneE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Ringkasan pesanan lengkap untuk tombol "Send on WhatsApp". */
export function buildBookingMessage({ scooter, pickUp, returnDate, addons, area }) {
  const days = rentalDays(pickUp, returnDate);
  const rental = calcRental(scooter.price, days);
  const extra = calcAddons(addons, days);
  const addonLines = extra.lines.map(
    (l) => `• ${l.name}${l.qty > 1 ? ` × ${l.qty}` : ''} — ${l.free ? 'free' : formatRupiah(l.amount)}`,
  );
  return [
    'Hi Boss Rent! I would like to book a scooter.',
    '',
    `Scooter: ${scooter.name}`,
    `Pick-up: ${formatDate(pickUp)}`,
    `Return: ${formatDate(returnDate)}`,
    `Duration: ${plural(days, 'day')}`,
    `Rate: ${rental.breakdown} (${rental.plan} rate) — ${formatRupiah(rental.total)}`,
    'Add-ons:',
    ...(addonLines.length ? addonLines : ['• None']),
    `Delivery area: ${area} (free)`,
    `Total: ${formatRupiah(rental.total + extra.total)}`,
    '',
    'Is this scooter available for these dates?',
  ].join('\n');
}
