'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV, isActivePath } from '@/components/layout/navConfig';

/** Bar navigasi bawah (HP): Beranda · Transaksi · Tracking · Menu. */
export default function BottomNav({ trackingAlerts = 0 }) {
  const pathname = usePathname();
  const mainHrefs = BOTTOM_NAV.slice(0, 3).map(i => i.href);
  const onMainPage = mainHrefs.some(h => isActivePath(pathname, h));

  return (
    <nav className="shell-bottom-nav" aria-label="Navigasi utama">
      {BOTTOM_NAV.map(item => {
        const active = item.href === '/menu' ? !onMainPage : isActivePath(pathname, item.href);
        const badge = item.badge === 'tracking' ? trackingAlerts : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shell-bottom-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="shell-bottom-icon">
              <i className={item.icon} aria-hidden="true"></i>
              {badge > 0 && <span className="shell-bottom-badge">{badge}</span>}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
