import { createClient } from '@/lib/supabase/server';
import { TX_LIGHT_SELECT, VEHICLE_LIGHT_COLUMNS, fetchAllRows } from '@/lib/queryColumns';
import TransactionsClient from './TransactionsClient';

// Halaman server: data awal diambil di sini supaya halaman langsung tampil
// berisi data (tanpa spinner + round-trip dari browser). Kolom foto tidak ikut;
// id transaksi yang punya foto diambil terpisah (hanya kolom id).
export default async function TransactionsPage() {
  const supabase = await createClient();

  const [txRes, vehRes, photoRes] = await Promise.all([
    fetchAllRows(() => supabase.from('transactions').select(TX_LIGHT_SELECT).order('created_at', { ascending: false })),
    supabase.from('vehicles').select(VEHICLE_LIGHT_COLUMNS).order('name'),
    supabase.from('transactions').select('id').not('handover_image_url', 'is', null).neq('handover_image_url', ''),
  ]);

  return (
    <TransactionsClient
      initialTransactions={txRes.data || []}
      initialVehicles={vehRes.data || []}
      initialPhotoIds={(photoRes.data || []).map(r => r.id)}
    />
  );
}
