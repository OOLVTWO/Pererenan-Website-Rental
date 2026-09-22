import { createClient } from '@/lib/supabase/server';
import VehiclesClient from './VehiclesClient';

// Data motor diambil di server supaya halaman langsung tampil berisi armada.
export default async function VehiclesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
  return <VehiclesClient initialVehicles={data || []} />;
}
