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

## Aturan bisnis (dikonfirmasi owner)
- **Bagi hasil investor = persentase × OMSET KOTOR motor investor.** Pengeluaran apa pun — termasuk biaya
  servis motor investor — TIDAK memotong bagian investor; semuanya ditanggung owner dan mengurangi laba
  bersih owner (`calcInvestorPayouts` / `calcFinancialSummary` di `src/lib/finance.js`).
- **Servis Motor = pencatatan manual saja.** Tidak ada deteksi jadwal servis, tidak ada interval, tidak ada KM.
- **Kilometer (odometer) tidak dipakai di mana pun**: tidak di form transaksi, modal selesai, maupun data motor.
- Pengaturan panel disimpan di localStorage + tabel `app_settings` (migration 005) lewat `src/lib/appSettings.js`,
  supaya ikut ke semua perangkat admin.

## Data
- Kategori pengeluaran default = `other`. Data lama berkategori `service` sebagian besar bukan servis motor.
- Catatan servis ada di tabel `service_logs` (tanggal, pekerjaan, bengkel, biaya, catatan). Kolom KM di tabel
  dibiarkan kosong; kolom `vehicles.current_km / last_service_km / last_serviced_at` tidak dipakai lagi.

## Desain (sejak redesign flat)
- Flat & ringan: putih + satu biru (`--brand-primary` #1D4ED8), abu hanya untuk teks/garis. Tanpa gradient,
  shadow tebal, blur, atau animasi mencolok. Satu tema terang (tidak ada dark mode / toggle tema).
- Token & komponen dasar ada di `src/styles/flat.css` (dimuat setelah `globals.css`). Jangan tambah warna hijau/
  merah/kuning/ungu baru; status dibedakan dengan skala biru/abu + teks.
- Navigasi: `src/components/layout/navConfig.js` = satu sumber menu. Sidebar desktop & halaman `/menu` flat,
  1 menu = 1 klik, TANPA dropdown. HP (≤900px): top bar + bar bawah (Beranda · Transaksi · Tracking · Menu).
- Sub-bagian halaman = tab di dalam halaman (`src/components/ui/PageTabs.jsx`, tersimpan di `?tab=`),
  bukan submenu sidebar.
- Mobile-first: target sentuh ≥ 44px, modal jadi lembar bawah di HP.
