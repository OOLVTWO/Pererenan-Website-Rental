-- ============================================================
-- Boss Rent Pererenan — Migration 005: Pengaturan panel per akun
--
-- Sebelumnya profil bisnis, metode pembayaran, dan template WhatsApp hanya
-- tersimpan di localStorage masing-masing perangkat. Tabel ini membuatnya
-- ikut ke semua perangkat admin. Idempotent.
-- ============================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_admin_all" on public.app_settings;
create policy "app_settings_admin_all" on public.app_settings
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

revoke all on public.app_settings from anon;
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
