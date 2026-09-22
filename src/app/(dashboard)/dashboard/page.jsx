import { createClient } from '@/lib/supabase/server';
import { getPeriodRange } from '@/lib/period';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

/**
 * Dashboard (server): SEMUA ringkasan dihitung di database (migration 006).
 * Dulu halaman ini menarik seluruh transaksi tahun berjalan (ratusan baris)
 * hanya untuk dijumlahkan di browser.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const range = getPeriodRange('this_month');

  const [summaryRes, overviewRes, monthlyRes] = await Promise.all([
    supabase.rpc('dashboard_summary', { p_start: range.start, p_end: range.end }),
    supabase.rpc('dashboard_overview'),
    supabase.rpc('monthly_rental_revenue', { p_year: year }),
  ]);

  return (
    <DashboardClient
      initialSummary={summaryRes.data || null}
      overview={overviewRes.data || null}
      initialMonthly={monthlyRes.data || []}
      initialPeriod={{ key: 'this_month', start: range.start, end: range.end, year }}
      error={summaryRes.error?.message || null}
    />
  );
}
