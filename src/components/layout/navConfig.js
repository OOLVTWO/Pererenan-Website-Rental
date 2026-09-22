/**
 * Satu sumber menu untuk sidebar (desktop), bar bawah & halaman Menu (HP).
 * Aturan: 1 menu = 1 klik ke halamannya, TANPA dropdown. Sub-bagian halaman
 * (filter/tab) ada di dalam halaman itu sendiri (lihat components/ui/PageTabs).
 */
export const NAV_GROUPS = [
  [
    { href: '/dashboard',    icon: 'fa-solid fa-house',               label: 'Dashboard',     desc: 'Ringkasan hari ini' },
    { href: '/transactions', icon: 'fa-solid fa-receipt',             label: 'Transaksi',     desc: 'Catat & kelola sewa' },
    { href: '/tracking',     icon: 'fa-regular fa-clock',             label: 'Tracking Sewa', desc: 'Jatuh tempo & status armada', badge: 'tracking' },
  ],
  [
    { href: '/customers',    icon: 'fa-solid fa-user-group',          label: 'Customer',      desc: 'Data penyewa' },
    { href: '/vehicles',     icon: 'fa-solid fa-motorcycle',          label: 'Motor',         desc: 'Armada & investor' },
    { href: '/service',      icon: 'fa-solid fa-screwdriver-wrench',  label: 'Servis Motor',  desc: 'Jejak & jadwal servis' },
  ],
  [
    { href: '/expenses',     icon: 'fa-solid fa-wallet',              label: 'Keuangan',      desc: 'Pemasukan & pengeluaran' },
    { href: '/reports',      icon: 'fa-solid fa-chart-column',        label: 'Laporan',       desc: 'Laba rugi & bagi hasil' },
    { href: '/settings',     icon: 'fa-solid fa-sliders',             label: 'Pengaturan',    desc: 'Profil, WhatsApp, backup' },
  ],
];

// Bar bawah (HP): 3 menu harian + Menu (semua menu dalam satu daftar)
export const BOTTOM_NAV = [
  { href: '/dashboard',    icon: 'fa-solid fa-house',   label: 'Beranda' },
  { href: '/transactions', icon: 'fa-solid fa-receipt', label: 'Transaksi' },
  { href: '/tracking',     icon: 'fa-regular fa-clock', label: 'Tracking', badge: 'tracking' },
  { href: '/menu',         icon: 'fa-solid fa-grip',    label: 'Menu' },
];

export function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname) {
  for (const group of NAV_GROUPS) {
    for (const item of group) if (isActivePath(pathname, item.href)) return item;
  }
  return null;
}
