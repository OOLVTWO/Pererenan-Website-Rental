-- ============================================================
-- Boss Rent Pererenan — Migration 004: Daftar admin (allowlist)
--
-- Sebelumnya: SEMUA user yang login punya akses penuh. Kalau signup publik
-- masih aktif di Supabase Auth, orang asing bisa mendaftar lalu membaca data.
-- Sekarang: hanya user yang ada di tabel admin_users yang bisa membaca/menulis
-- data & foto. User lain yang login hanya melihat data kosong.
--
-- Menambah admin baru (Supabase → SQL Editor):
--   insert into public.admin_users (user_id, note)
--   select id, 'staff' from auth.users where email = 'email@contoh.com';
--
-- Idempotent. Jalankan SETELAH akun admin pertama dibuat di
-- Authentication → Users: semua user yang sudah ada saat migration ini
-- dijalankan otomatis menjadi admin.
-- ============================================================

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  note       text not null default '',
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Tanpa policy: tabel ini tidak bisa dibaca/diubah lewat API (hanya SQL Editor).
revoke all on public.admin_users from anon, authenticated;

-- Fungsi cek admin di schema 'private' (tidak terekspos lewat API /rest/v1).
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Tabel data: akses hanya untuk admin
do $$
declare t text;
begin
  foreach t in array array['vehicles', 'transactions', 'expenses', 'customers', 'service_logs'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- Foto serah terima: akses hanya untuk admin
drop policy if exists "handover_photos_admin_select" on storage.objects;
create policy "handover_photos_admin_select" on storage.objects for select to authenticated
  using (bucket_id = 'handover-photos' and (select private.is_admin()));
drop policy if exists "handover_photos_admin_insert" on storage.objects;
create policy "handover_photos_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'handover-photos' and (select private.is_admin()));
drop policy if exists "handover_photos_admin_update" on storage.objects;
create policy "handover_photos_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'handover-photos' and (select private.is_admin()))
  with check (bucket_id = 'handover-photos' and (select private.is_admin()));
drop policy if exists "handover_photos_admin_delete" on storage.objects;
create policy "handover_photos_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'handover-photos' and (select private.is_admin()));

drop function if exists public.is_admin();

-- Rapikan peringatan Security Advisor: search_path tetap untuk trigger function
alter function public.set_updated_at() set search_path = '';

-- Admin awal = semua akun yang sudah ada saat ini
insert into public.admin_users (user_id, note)
select id, 'admin awal' from auth.users
on conflict (user_id) do nothing;
