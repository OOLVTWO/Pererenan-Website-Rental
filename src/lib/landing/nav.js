/**
 * Penanda seksi aktif di navbar & laci menu (fungsi murni, diuji di nav.test.js).
 *
 * `sections` = [{ id, top }] urut dari atas ke bawah, `top` = jarak tepi atas
 * seksi dari atas layar (getBoundingClientRect().top). Seksi aktif = seksi
 * terakhir yang tepi atasnya sudah melewati garis `line`. Di dasar halaman,
 * seksi terakhir yang aktif (seksi pendek seperti FAQ tak pernah mencapai garis).
 * Belum ada yang lewat → `fallback` (bagian paling atas halaman).
 */
export function activeSection(sections, line, { atBottom = false, fallback = null } = {}) {
  if (atBottom && sections.length) return sections[sections.length - 1].id;
  let active = fallback;
  for (const s of sections) {
    if (s.top <= line) active = s.id;
  }
  return active;
}
