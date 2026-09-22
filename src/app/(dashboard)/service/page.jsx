import { createClient } from '@/lib/supabase/server';
import { getPeriodRange } from '@/lib/period';
import { SERVICE_LOG_SELECT } from '@/lib/serviceLogServer';
import ServiceClient from './ServiceClient';

// Daftar motor + catatan servis tahun berjalan diambil di server.
export default async function ServicePage() {
  const supabase = await createClient();
  const year = getPeriodRange('this_year');

  const [vehRes, logRes] = await Promise.all([
    supabase.from('vehicles').select('id, name, plate_number').order('name'),
    supabase.from('service_logs').select(SERVICE_LOG_SELECT)
      .gte('service_date', year.start).lte('service_date', year.end)
      .order('service_date', { ascending: false }),
  ]);

  return <ServiceClient initialVehicles={vehRes.data || []} initialLogs={logRes.data || []} />;
}
