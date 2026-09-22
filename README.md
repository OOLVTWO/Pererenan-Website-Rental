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
| Tracking Sewa / Ketersediaan | Sewa aktif, overdue, status unit |
| Servis Motor | Jejak servis per motor, status "perlu servis" (km / hari) |
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
Buat di Supabase → Authentication → Users → Add user (centang Auto Confirm).
Matikan pendaftaran publik: Authentication → Sign In / Providers → nonaktifkan
"Allow new users to sign up" — setiap user yang login punya akses penuh.

## Database

Skema ada di `supabase/migrations/` (idempotent, aman dijalankan ulang):

- `001_schema.sql` — tabel inti (vehicles, transactions, customers, expenses) + RLS admin-only
- `002_service_logs.sql` — jejak servis motor
- `003_handover_photo_storage.sql` — bucket privat `handover-photos`

Jalankan lewat Supabase → SQL Editor bila membuat project baru.

## Aturan penting (hemat kuota egress Supabase)

- **Jangan `select('*')`** pada `transactions`, `vehicles`, `customers` di halaman list.
  Pakai kolom ringan dari `src/lib/queryColumns.js`.
- Foto serah terima disimpan di **Supabase Storage** (bucket privat), kolom
  `handover_image_url` hanya berisi referensi `storage://handover-photos/...`.
  Lihat `src/lib/handoverPhoto.js`.
- Polling pakai `startVisiblePolling` (`src/lib/visiblePolling.js`) supaya berhenti saat tab tidak aktif.
- Query yang bisa > 1000 baris wajib pakai `fetchAllRows` (PostgREST memotong di 1000 baris tanpa error).
