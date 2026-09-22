import { createClient } from '@/lib/supabase/server';
import { redirect, unstable_rethrow } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';

export default async function DashboardLayout({ children }) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    // Teruskan sinyal internal Next.js (mis. penanda halaman dinamis) — jangan ditelan.
    unstable_rethrow(err);
    console.error('DashboardLayout: gagal memeriksa sesi Supabase:', err?.message || err);
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
