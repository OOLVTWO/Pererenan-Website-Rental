<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Catatan proyek — Panel Admin Boss Rent Pererenan

Baca bagian ini sebelum mulai kerja. Isinya pelajaran dari sesi-sesi sebelumnya.

## Lingkup
- Repo ini **hanya panel admin**. Website publik `/fleet` sengaja tidak ada di sini.
- Hosting: **Vercel** (bukan Netlify), project `pererenan-website-rental`.
- Database/Auth/Storage: Supabase project **`Pererenan Website Rental`** (ref `fltfzhcvvfmregcsjovm`).
  Project lama `boss-rent-pererenan` (ref `eedrziblypwrufdzctvd`) milik app lama — JANGAN diubah dari repo ini.
- Kuota Supabase Free (termasuk egress) dihitung per ORGANISASI, jadi kedua project berbagi kuota yang sama.

## Workflow & keamanan
- Bypass auth khusus sandbox untuk testing **tidak boleh pernah di-commit**. Cek diff sebelum commit.
- Jangan commit secret (service role key, DB password, token GitHub).
- Aplikasi sengaja TIDAK memakai service role key: `createAdminClient()` = sesi admin yang login (RLS).
  URL + publishable key project ada di `src/lib/supabase/config.js` (aman publik).
- Akun admin dibuat di Supabase Auth, lalu WAJIB didaftarkan ke `public.admin_users` (RLS memakai `private.is_admin()`).
  User login yang tidak ada di `admin_users` tidak bisa melihat data apa pun.
- Verifikasi minimal sebelum push: `npm run lint` (0 error), `npm test`, `npm run build`.
- Perubahan skema = file baru di `supabase/migrations/NNN_*.sql`, idempotent, dengan RLS + grant eksplisit
  (Supabase mewajibkan grant eksplisit untuk tabel baru di Data API).

## Egress Supabase (project pernah kena `exceed_egress_quota`)
- Penyebab dulu: foto base64 di dalam baris + `select('*')` + polling 60 detik.
- Untuk list/agregasi pakai kolom dari `src/lib/queryColumns.js` (`TX_LIGHT_SELECT`, `VEHICLE_LIGHT_COLUMNS`, dst).
  Kolom foto hanya diambil per baris: `GET /api/transactions/:id`.
- Form edit transaksi ikut menyimpan kolom foto → **wajib** buka dengan data lengkap dari
  `GET /api/transactions/:id`, dan kirim `handover_image_url` hanya jika diubah.
- Batas 1000 baris PostgREST: pakai `fetchAllRows` untuk query yang bisa bertambah panjang.
- Polling pakai `startVisiblePolling` (berhenti saat tab tersembunyi).
- Hitung jumlah data dengan `select('id', { count: 'exact', head: true })`, bukan mengunduh baris.

## Foto
- 1 foto per transaksi: foto serah terima (penyewa + motor). Tidak ada lagi foto KTP.
- Disimpan di bucket privat `handover-photos`; kolom berisi `storage://handover-photos/<path>`.
  Tampilkan via signed URL (`resolvePhotoSrc`); untuk canvas/invoice pakai `resolvePhotoDataUrl`.
- `compressImage` / `compressImageToBlob` di `src/lib/imageCompressor.js` (maks 1280px untuk foto serah terima).
- Foto katalog motor (`vehicles.image_url`) masih base64 — hanya dimuat di halaman Data Motor.

## Data
- Kategori pengeluaran default = `other`. Data lama berkategori `service` sebagian besar bukan servis motor.
- Jejak servis ada di tabel `service_logs`; kolom `vehicles.last_service_km / last_serviced_at / current_km`
  disinkronkan otomatis dari catatan servis terbaru (`src/lib/serviceLogServer.js`).
- Interval servis (km / hari) disimpan di localStorage `boss_rent_biz_settings` (Pengaturan → Profil Bisnis).
