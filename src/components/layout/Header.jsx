'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findNavItem } from '@/components/layout/navConfig';

/** Top bar HP: logo + nama halaman. Di desktop disembunyikan (sidebar sudah ada). */
export default function Header() {
  const pathname = usePathname();
  const item = findNavItem(pathname);
  const title = pathname === '/menu' ? 'Menu' : item?.label || 'Boss Rent';

  return (
    <header className="shell-topbar">
      <Link href="/dashboard" className="shell-brand compact" aria-label="Ke Dashboard">
        <span className="shell-brand-mark">BR</span>
      </Link>
      <span className="shell-topbar-title">{title}</span>
    </header>
  );
}
