/**
 * Dynamic Payment Methods Manager
 * Boss Rent Pererenan
 */

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash', label: 'Tunai', icon: 'fa-solid fa-money-bill-wave', color: '#1D4ED8', active: true },
  { id: 'transfer_bca', label: 'Transfer BCA', icon: 'fa-solid fa-building-columns', color: '#1D4ED8', active: true },
  { id: 'transfer_mandiri', label: 'Transfer Mandiri', icon: 'fa-solid fa-building-columns', color: '#1D4ED8', active: true },
  { id: 'qris', label: 'QRIS (GoPay/OVO/Dana)', icon: 'fa-solid fa-qrcode', color: '#1D4ED8', active: true },
  { id: 'card', label: 'Kartu kredit / debit', icon: 'fa-solid fa-credit-card', color: '#1D4ED8', active: true },
  { id: 'wise', label: 'Wise / Revolut', icon: 'fa-solid fa-arrow-right-left', color: '#1D4ED8', active: true },
];

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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PAYMENT_METHODS;
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
  if (id === 'transfer') return { id: 'transfer', label: 'Transfer Bank', icon: 'fa-solid fa-building-columns', color: '#1D4ED8' };
  if (id === 'qris') return { id: 'qris', label: 'QRIS', icon: 'fa-solid fa-qrcode', color: '#1D4ED8' };

  return { id, label: id, icon: 'fa-solid fa-credit-card', color: 'var(--brand-primary-light)' };
}
