import { createClient } from '@/lib/supabase/server';
import { TX_LIGHT_SELECT, VEHICLE_LIGHT_COLUMNS } from '@/lib/queryColumns';

const PAGE_SIZE = 50;
import TransactionsClient from './TransactionsClient';

// Halaman server: data awal diambil di sini supaya halaman langsung tampil
// berisi data (tanpa spinner + round-trip dari browser). Kolom foto tidak ikut;
// id transaksi yang punya foto diambil terpisah (hanya kolom id).
export default async function TransactionsPage() {
  const supabase = await createClient();

  const [txRes, vehRes, photoRes] = await Promise.all([
    supabase.from('transactions').select(TX_LIGHT_SELECT).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1),
    supabase.from('vehicles').select(VEHICLE_LIGHT_COLUMNS).order('name'),
    supabase.from('transactions').select('id').not('handover_image_url', 'is', null).neq('handover_image_url', ''),
  ]);

  return (
    <TransactionsClient
      initialTransactions={txRes.data || []}
      pageSize={PAGE_SIZE}
      initialVehicles={vehRes.data || []}
      initialPhotoIds={(photoRes.data || []).map(r => r.id)}
    />
  );
}
