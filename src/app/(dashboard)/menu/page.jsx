'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NAV_GROUPS } from '@/components/layout/navConfig';

/** Halaman Menu (HP): semua menu dalam satu daftar datar — tanpa dropdown. */
export default function MenuPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="menu-page">
      <h1 className="page-title">Menu</h1>
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="list-card">
          {group.map(item => (
            <Link key={item.href} href={item.href} className="list-row">
              <span className="list-row-icon"><i className={item.icon} aria-hidden="true"></i></span>
              <span className="list-row-text">
                <span className="list-row-title">{item.label}</span>
                <span className="list-row-sub">{item.desc}</span>
              </span>
              <i className="fa-solid fa-chevron-right list-row-chev" aria-hidden="true"></i>
            </Link>
          ))}
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-block" onClick={handleLogout}>
        <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i> Keluar
      </button>
    </div>
  );
}
