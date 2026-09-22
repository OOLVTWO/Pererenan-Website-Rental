'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NAV_GROUPS, isActivePath } from '@/components/layout/navConfig';

/** Sidebar desktop: flat, 1 menu = 1 klik. Disembunyikan di HP (pakai BottomNav). */
export default function Sidebar({ user, trackingAlerts = 0 }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userEmail = user?.email || 'admin';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <aside className="shell-sidebar" aria-label="Menu utama">
      <Link href="/dashboard" className="shell-brand">
        <span className="shell-brand-mark">BR</span>
        <span className="shell-brand-text">
          <span className="shell-brand-name">Boss Rent</span>
          <span className="shell-brand-sub">Pererenan · Admin</span>
        </span>
      </Link>

      <nav className="shell-nav">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="shell-nav-group">
            {group.map(item => {
              const active = isActivePath(pathname, item.href);
              const badge = item.badge === 'tracking' ? trackingAlerts : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shell-nav-item${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span className="shell-nav-label">{item.label}</span>
                  {badge > 0 && <span className="shell-nav-badge" aria-label={`${badge} perlu perhatian`}>{badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shell-user">
        <span className="shell-user-avatar" aria-hidden="true">{userInitial}</span>
        <span className="shell-user-text">
          <span className="shell-user-email">{userEmail}</span>
          <span className="shell-user-role">Admin</span>
        </span>
        <button type="button" className="shell-icon-btn" onClick={handleLogout} aria-label="Keluar" title="Keluar">
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
        </button>
      </div>
    </aside>
  );
}
