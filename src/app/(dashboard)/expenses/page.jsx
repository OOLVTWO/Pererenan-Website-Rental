import { createClient } from '@/lib/supabase/server';
import { TX_LIGHT_COLUMNS, fetchAllRows } from '@/lib/queryColumns';
import { isPaidTransaction } from '@/lib/finance';
import { getPeriodRange } from '@/lib/period';
import ExpensesClient from './ExpensesClient';

// Halaman server: kas periode berjalan diambil di sini (catatan manual +
// pendapatan sewa), jadi halaman langsung tampil berisi angka.
export default async function ExpensesPage() {
  const range = getPeriodRange('this_month');
  const supabase = await createClient();

  const [expRes, txRes] = await Promise.all([
    fetchAllRows(() => supabase.from('expenses').select('*')
      .gte('expense_date', range.start).lte('expense_date', range.end)
      .order('expense_date', { ascending: false })),
    fetchAllRows(() => supabase.from('transactions').select(TX_LIGHT_COLUMNS)
      .gte('created_at', `${range.start}T00:00:00Z`).lte('created_at', `${range.end}T23:59:59Z`)),
  ]);

  const paid = (txRes.data || []).filter(isPaidTransaction);

  return (
    <ExpensesClient
      initialRecords={expRes.data || []}
      initialRental={{ total: paid.reduce((s, t) => s + Number(t.total_price || 0), 0), count: paid.length }}
      initialPeriod={{ key: 'this_month', start: range.start, end: range.end }}
    />
  );
}
