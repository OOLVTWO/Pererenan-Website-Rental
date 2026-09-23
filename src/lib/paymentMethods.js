/**
 * Metode pembayaran yang dipakai di form transaksi & invoice.
 *
 * Penamaan: nama singkat yang langsung dikenali (bukan campuran
 * Indonesia-Inggris), dengan keterangan pendek untuk detailnya. Setiap jenis
 * pembayaran punya ikon sendiri supaya mudah dibedakan sekilas.
 */

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash',             label: 'Tunai',              hint: 'Bayar langsung di tempat',        icon: 'fa-solid fa-money-bill-wave',  color: '#1D4ED8', active: true },
  { id: 'transfer_bca',     label: 'Transfer BCA',       hint: 'Rekening bank BCA',               icon: 'fa-solid fa-building-columns', color: '#1D4ED8', active: true },
  { id: 'transfer_mandiri', label: 'Transfer Mandiri',   hint: 'Rekening bank Mandiri',           icon: 'fa-solid fa-building-columns', color: '#1D4ED8', active: true },
  { id: 'qris',             label: 'QRIS',               hint: 'GoPay, OVO, DANA, ShopeePay',     icon: 'fa-solid fa-qrcode',           color: '#1D4ED8', active: true },
  { id: 'card',             label: 'Kartu debit/kredit', hint: 'Visa, Mastercard',                icon: 'fa-solid fa-credit-card',      color: '#1D4ED8', active: true },
  { id: 'wise',             label: 'Wise / Revolut',     hint: 'Transfer dari luar negeri',       icon: 'fa-solid fa-globe',            color: '#1D4ED8', active: true },
];

/** Label lama yang boleh ditimpa saat penamaan dirapikan (kalau user belum mengubahnya sendiri). */
const LEGACY_LABELS = {
  cash: ['Tunai / Cash', 'Cash', 'Tunai'],
  transfer_bca: ['Transfer Bank BCA', 'Transfer BCA'],
  transfer_mandiri: ['Transfer Bank Mandiri', 'Transfer Mandiri'],
  qris: ['QRIS / GoPay / OVO', 'QRIS (GoPay/OVO/Dana)', 'QRIS'],
  card: ['Kartu Kredit / Debit', 'Kartu kredit / debit'],
  wise: ['Wise / Revolut (FX)', 'Wise / Revolut'],
};

/** Samakan ikon & rapikan nama bawaan pada data yang sudah tersimpan di perangkat. */
function refreshDefaults(methods) {
  return methods.map(m => {
    const def = DEFAULT_PAYMENT_METHODS.find(d => d.id === m.id);
    if (!def) return m;
    const labelIsDefault = (LEGACY_LABELS[m.id] || []).includes(m.label);
    return {
      ...m,
      icon: def.icon,
      hint: m.hint ?? def.hint,
      label: labelIsDefault ? def.label : m.label,
    };
  });
}

const STORAGE_KEY = 'boss_rent_payment_methods';

export function getPaymentMethods() {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_METHODS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PAYMENT_METHODS));
      return DEFAULT_PAYMENT_METHODS;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PAYMENT_METHODS;
    return refreshDefaults(parsed);
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
}

export function savePaymentMethods(methods) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

export function getPaymentMethodMeta(id) {
  const methods = getPaymentMethods();
  const found = methods.find(m => m.id === id);
  if (found) return found;

  // Fallback map for legacy values
  if (id === 'cash') return { id: 'cash', label: 'Tunai', icon: 'fa-solid fa-money-bill-wave', color: '#1D4ED8' };
  if (id === 'transfer') return { id: 'transfer', label: 'Transfer bank', icon: 'fa-solid fa-building-columns', color: '#1D4ED8' };
  if (id === 'qris') return { id: 'qris', label: 'QRIS', icon: 'fa-solid fa-qrcode', color: '#1D4ED8' };

  return { id, label: id, icon: 'fa-solid fa-credit-card', color: 'var(--brand-primary-light)' };
}
