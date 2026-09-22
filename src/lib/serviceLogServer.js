/**
 * Helper server-side untuk API Servis Motor (dipakai route handler).
 * Menggunakan admin client (service_role) — panggil HANYA setelah requireAuth.
 */
import { buildServiceExpenseTitle } from '@/lib/serviceLog';

export const SERVICE_LOG_SELECT =
  'id, vehicle_id, service_date, items, workshop, cost, notes, expense_id, created_at, updated_at, vehicles(id, name, plate_number)';

export async function getVehicleBasic(supabase, vehicleId) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, name, plate_number')
    .eq('id', vehicleId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Buat / ubah / hapus pengeluaran Keuangan yang terhubung ke catatan servis. */
export async function syncServiceExpense(supabase, { expenseId, recordExpense, vehicle, input }) {
  const wantsExpense = recordExpense && input.cost > 0;
  const payload = {
    title: buildServiceExpenseTitle(vehicle, input.items),
    category: 'service',
    amount: input.cost,
    expense_date: input.service_date,
    notes: [input.workshop && `Bengkel: ${input.workshop}`, input.notes]
      .filter(Boolean).join('\n'),
    type: 'expense',
    vehicle_id: vehicle.id,
  };

  if (expenseId && !wantsExpense) {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw new Error(`Gagal menghapus pengeluaran terkait: ${error.message}`);
    return null;
  }
  if (expenseId && wantsExpense) {
    const { error } = await supabase.from('expenses').update(payload).eq('id', expenseId);
    if (error) throw new Error(`Gagal memperbarui pengeluaran terkait: ${error.message}`);
    return expenseId;
  }
  if (!expenseId && wantsExpense) {
    const { data, error } = await supabase.from('expenses').insert([payload]).select('id').single();
    if (error) throw new Error(`Gagal mencatat biaya ke Keuangan: ${error.message}`);
    return data.id;
  }
  return null;
}

export function isMissingTableError(error) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || error?.code === 'PGRST205'
    || (/service_logs/.test(msg) && /does not exist|schema cache/i.test(msg));
}
