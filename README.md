# Boss Rent Pererenan — Panel Admin

Panel administrasi rental motor Boss Rent Pererenan (Pererenan, Bali).
Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage), di-deploy di **Vercel**.

> Repo ini hanya berisi **panel admin**. Website publik / katalog `/fleet`
> tidak termasuk di sini.

## Fitur

| Menu | Fungsi |
|---|---|
| Dashboard | Ringkasan omset, pengeluaran, piutang, pengingat servis |
| Transaksi | Catat sewa, invoice WhatsApp, foto serah terima (1 foto / transaksi) |
| Data Customer | Master data penyewa + riwayat |
| Data Motor | Armada, tarif, motor investor |
| Tracking Sewa | Sewa aktif, overdue, pengingat WhatsApp + tab Status Armada (tersedia/disewa/perawatan) |
| Servis Motor | Catatan servis per motor (tanggal, pekerjaan, bengkel, biaya) |
| Keuangan | Pemasukan & pengeluaran |
| Laporan | Laporan periode + export Excel, bagi hasil investor |
| Pengaturan | Profil bisnis, metode pembayaran, template WA, password, backup |

## Setup lokal

```bash
npm install
npm run dev                  # http://localhost:3000
```

Perintah lain: `npm run lint`, `npm test`, `npm run build`.

## Koneksi Supabase

Tidak ada env var yang wajib. Default-nya ada di `src/lib/supabase/config.js`
(project **Pererenan Website Rental**). Env var berikut opsional, hanya untuk
mengarahkan ke project lain:

| Nama | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (memang publik; aman karena RLS) |

Aplikasi **tidak memakai secret / service role key**. Semua akses memakai sesi
admin yang login, dilindungi RLS (hanya user yang login yang bisa membaca/menulis).

### Akun admin
1. Supabase → Authentication → Users → Add user (centang Auto Confirm).
2. Daftarkan sebagai admin (SQL Editor):
   ```sql
   insert into public.admin_users (user_id, note)
   select id, 'admin' from auth.users where email = 'email@contoh.com';
   ```
Hanya user di `admin_users` yang bisa membaca/menulis data & foto (migration 004).
User lain yang berhasil login hanya melihat data kosong. Tetap disarankan
menonaktifkan signup publik: Authentication → Sign In / Providers.

## Database

Skema ada di `supabase/migrations/` (idempotent, aman dijalankan ulang):

- `001_schema.sql` — tabel inti (vehicles, transactions, customers, expenses) + RLS admin-only
- `002_service_logs.sql` — jejak servis motor
- `003_handover_photo_storage.sql` — bucket privat `handover-photos`
- `004_admin_allowlist.sql` — hanya akun di `admin_users` yang bisa akses data
- `005_app_settings.sql` — pengaturan panel tersimpan per akun (ikut ke semua perangkat)

Jalankan lewat Supabase → SQL Editor bila membuat project baru.

## Aturan penting (hemat kuota egress Supabase)

- **Jangan `select('*')`** pada `transactions`, `vehicles`, `customers` di halaman list.
  Pakai kolom ringan dari `src/lib/queryColumns.js`.
- Foto serah terima disimpan di **Supabase Storage** (bucket privat), kolom
  `handover_image_url` hanya berisi referensi `storage://handover-photos/...`.
  Lihat `src/lib/handoverPhoto.js`.
- Polling pakai `startVisiblePolling` (`src/lib/visiblePolling.js`) supaya berhenti saat tab tidak aktif.
- Query yang bisa > 1000 baris wajib pakai `fetchAllRows` (PostgREST memotong di 1000 baris tanpa error).
