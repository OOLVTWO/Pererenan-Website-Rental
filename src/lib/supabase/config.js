/**
 * Konfigurasi koneksi Supabase — project "Pererenan Website Rental".
 *
 * Default di bawah dipakai kalau env var tidak di-set di Vercel, supaya panel
 * langsung bisa diakses setelah deploy tanpa setup tambahan.
 *
 * Aman untuk ada di repo publik:
 *  - URL project memang publik.
 *  - Publishable key (sb_publishable_...) memang didesain untuk dikirim ke
 *    browser. Tanpa login, key ini TIDAK bisa membaca/mengubah data apa pun:
 *    semua tabel memakai RLS admin-only dan hak akses anon sudah dicabut
 *    (lihat supabase/migrations/001_schema.sql).
 *
 * Secret / service role key TIDAK dipakai sama sekali oleh aplikasi ini.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fltfzhcvvfmregcsjovm.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iWt45_dREFPYUyb_m1XonA_v3JR1D6-';
