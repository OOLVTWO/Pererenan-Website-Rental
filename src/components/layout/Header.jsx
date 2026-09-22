'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <Image className="shell-brand-mark" src="/images/logoCompany.png" alt="Boss Rent Pererenan" width={40} height={27} priority />
      </Link>
      <span className="shell-topbar-title">{title}</span>
    </header>
  );
}
