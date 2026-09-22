/**
 * Servis Motor — helper murni (tanpa I/O). Fitur ini untuk PENCATATAN servis
 * yang dilakukan (bukan mendeteksi jadwal servis / kilometer).
 */

/** Pilihan cepat pekerjaan servis (tersimpan sebagai teks di kolom items). */
export const SERVICE_ITEM_OPTIONS = [
  'Ganti oli mesin',
  'Oli gardan',
  'Servis CVT / V-belt',
  'Kampas / minyak rem',
  'Ban',
  'Aki',
  'Busi',
  'Filter udara',
  'Servis rutin / tune-up',
  'Kelistrikan / lampu',
  'Body / spion',
];

/** Normalisasi input form → payload aman untuk database. */
export function normalizeServiceLogInput(body = {}) {
  const items = Array.isArray(body.items)
    ? [...new Set(body.items.map((s) => String(s || '').trim()).filter(Boolean))].slice(0, 30)
    : [];
  const costNum = Number(body.cost);
  return {
    vehicle_id: body.vehicle_id ? String(body.vehicle_id) : null,
    service_date: typeof body.service_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.service_date)
      ? body.service_date
      : null,
    items,
    workshop: String(body.workshop || '').trim().slice(0, 120),
    cost: Number.isFinite(costNum) && costNum > 0 ? Math.round(costNum) : 0,
    notes: String(body.notes || '').trim().slice(0, 2000),
  };
}

/** Judul pengeluaran otomatis di menu Keuangan (plat nomor disertakan). */
export function buildServiceExpenseTitle(vehicle, items) {
  const name = [vehicle?.name, vehicle?.plate_number ? `(${vehicle.plate_number})` : '']
    .filter(Boolean).join(' ');
  const what = items && items.length ? items.join(', ') : 'Servis';
  return `Servis Motor: ${name || 'Motor'} - ${what}`.slice(0, 200);
}
