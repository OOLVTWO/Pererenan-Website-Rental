/**
 * Pencarian teks di panel admin (Transaksi & Tracking).
 *
 * Huruf besar/kecil, spasi, titik & strip diabaikan, supaya plat atau nomor HP
 * bisa diketik bebas: "dk5770", "5770 fab" → "DK 5770 FAB"; "0812 3456" → "0812-3456".
 */

const compact = (s) => s.replace(/[\s.\-_/]+/g, '');

/** true kalau salah satu `fields` memuat `query`. Query kosong = semua cocok. */
export function matchesQuery(query, fields) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  const qc = compact(q);
  return fields.some((f) => {
    if (f === null || f === undefined) return false;
    const s = String(f).toLowerCase();
    return s.includes(q) || (qc !== '' && compact(s).includes(qc));
  });
}

/**
 * Query pencarian yang aman disisipkan ke filter PostgREST `.or(...)`:
 * koma, kurung, kutip & backslash memecah sintaks filter; % dan * adalah
 * wildcard LIKE. Semuanya diganti spasi.
 */
export function sanitizeFilterQuery(query) {
  return String(query ?? '')
    .replace(/[,()"'\\%*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}
