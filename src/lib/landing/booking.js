/**
 * Perhitungan harga & pesan WhatsApp untuk halaman publik. Fungsi murni,
 * tanpa akses jaringan/database — supaya gampang diuji dan aman dipakai di server.
 */
import { EQUIPMENT, MONTHLY_MIN_DAYS } from './config';

export const DAY_MS = 86400000;

/** Jumlah hari sewa dari dua tanggal (YYYY-MM-DD). Minimal 1 hari. */
export function daysBetween(start, end) {
  if (!start || !end) return 1;
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
  return Math.max(1, Math.round((b - a) / DAY_MS));
}

/** Tanggal (YYYY-MM-DD) setelah ditambah n hari. */
export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Harga sewa: pakai paket termurah untuk durasi tersebut.
 * 30 hari → 1 bulan; 9 hari → 1 minggu + 2 hari; dst.
 */
export function calcRental(price, days) {
  const d = Math.max(1, Math.floor(days) || 1);
  const daily = Number(price?.daily) || 0;
  const weekly = Number(price?.weekly) || daily * 7;
  const monthly = Number(price?.monthly) || daily * 30;

  const months = Math.floor(d / 30);
  let rest = d - months * 30;
  const weeks = Math.floor(rest / 7);
  rest -= weeks * 7;

  let total = months * monthly + weeks * weekly + rest * daily;
  // Kalau menaikkan ke paket berikutnya justru lebih murah, pakai yang murah.
  if (rest > 0 && rest * daily > weekly) total = months * monthly + (weeks + 1) * weekly;
  if (weeks * weekly + rest * daily > monthly && months >= 0 && d > 21) {
    total = Math.min(total, (months + 1) * monthly);
  }

  const lines = [];
  if (months) lines.push({ label: `${months} × monthly rate`, amount: months * monthly });
  if (weeks) lines.push({ label: `${weeks} × weekly rate`, amount: weeks * weekly });
  if (rest) lines.push({ label: `${rest} × daily rate`, amount: rest * daily });
  if (!lines.length) lines.push({ label: `${d} × daily rate`, amount: d * daily });

  return { total, days: d, lines, isMonthly: d >= MONTHLY_MIN_DAYS };
}

/** Perlengkapan yang boleh dipilih untuk durasi tertentu. */
export function availableEquipment(days) {
  const d = Math.max(1, Math.floor(days) || 1);
  return EQUIPMENT.map(e => ({ ...e, disabled: !!e.minDays && d < e.minDays }));
}

/** Batasi jumlah perlengkapan sesuai max & aturan bulanan. */
export function normalizeEquipment(selection, days) {
  const out = {};
  availableEquipment(days).forEach(e => {
    const qty = Number(selection?.[e.id]) || 0;
    out[e.id] = e.disabled ? 0 : Math.min(Math.max(0, Math.round(qty)), e.max);
  });
  return out;
}

/** Total harga perlengkapan berbayar. */
export function calcEquipment(selection, days) {
  const normalized = normalizeEquipment(selection, days);
  const lines = [];
  let total = 0;
  availableEquipment(days).forEach(e => {
    const qty = normalized[e.id];
    if (!qty) return;
    const amount = e.price * qty;
    total += amount;
    lines.push({ id: e.id, label: `${e.name} × ${qty}`, amount, free: !!e.free });
  });
  return { total, lines, selection: normalized };
}

export function formatShort(n) {
  if (n >= 1000000) {
    const jt = n / 1000000;
    return `${String(jt % 1 === 0 ? jt : jt.toFixed(1)).replace('.', ',')}jt`;
  }
  if (n >= 100000) return `${Math.round(n / 1000)}rb`;
  return `Rp ${Math.round(n / 1000)}k`;
}

export function formatRupiah(n) {
  return `Rp ${Math.round(Number(n) || 0).toLocaleString('id-ID')}`;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-09-25 → "25 Sep 2026" (tidak bergantung locale perangkat). */
export function formatDateEn(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  return `${d} ${MONTHS_EN[m - 1]} ${y}`;
}

/** Pesan WhatsApp (bahasa Inggris) berisi seluruh ringkasan pesanan. */
export function buildWhatsAppMessage({ vehicle, startDate, endDate, days, time, address, equipment, rental, equipmentTotal }) {
  const eq = (equipment || []).map(l => `• ${l.label}${l.free ? ' (free)' : ` — ${formatRupiah(l.amount)}`}`);
  return [
    '*Booking request — Boss Rent Pererenan*',
    '',
    `Scooter: ${vehicle?.name || '-'}`,
    `Pick-up: ${formatDateEn(startDate)}${time ? ` at ${time}` : ''}`,
    `Return: ${formatDateEn(endDate)}`,
    `Duration: ${days} day${days > 1 ? 's' : ''}`,
    address ? `Delivery to: ${address}` : 'Delivery address: (to confirm)',
    '',
    '*Add-ons*',
    ...(eq.length ? eq : ['• None']),
    '',
    `Rental: ${formatRupiah(rental)}`,
    equipmentTotal ? `Add-ons: ${formatRupiah(equipmentTotal)}` : null,
    `*Estimated total: ${formatRupiah((rental || 0) + (equipmentTotal || 0))}*`,
    '',
    'Please confirm if this scooter is available for these dates. Thank you!',
  ].filter(Boolean).join('\n');
}

export function whatsappUrl(phoneE164, message) {
  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}
