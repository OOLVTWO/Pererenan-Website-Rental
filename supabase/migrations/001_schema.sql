-- ============================================================
-- Boss Rent Pererenan (Panel Admin) — Migration 001: Skema dasar
--
-- Struktur tabel mengikuti database produksi lama yang sudah teruji
-- (kolom, tipe, NOT NULL, default, generated column, FK, index).
-- Perbedaan yang disengaja:
--   * RLS bersih: HANYA admin yang login (authenticated). Tidak ada akses
--     anon sama sekali — repo ini tidak punya halaman publik.
--   * transactions.payment_method tanpa CHECK constraint, karena metode
--     pembayaran bisa ditambah sendiri di Pengaturan (BCA, Mandiri, kartu, dll).
--   * Tabel business_settings tidak dibuat (tidak dipakai panel admin).
--
-- Jalankan di Supabase → SQL Editor pada project BARU. Idempotent.
-- ============================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── VEHICLES ────────────────────────────────────────────────
create table if not exists public.vehicles (
  id                       uuid primary key default gen_random_uuid(),
  name                     varchar not null,
  plate_number             varchar not null unique,
  year                     integer not null,
  color                    varchar not null,
  category                 varchar default 'matic',
  rate_per_day             numeric not null default 0,
  rate_per_week            numeric default 0,
  rate_per_month           numeric default 0,
  status                   varchar not null default 'available'
                             check (status in ('available', 'rented', 'maintenance')),
  image_url                text,
  notes                    text,
  current_km               integer default 15000,
  last_service_km          integer default 0,
  last_serviced_at         timestamptz,
  owner_type               text default 'internal',
  owner_name               text,
  owner_contact            text,
  revenue_share_percentage integer default 70,
  purchase_date            date,
  purchase_price           numeric default 0,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);
create index if not exists idx_vehicles_status on public.vehicles (status);

drop trigger if exists set_updated_at_vehicles on public.vehicles;
create trigger set_updated_at_vehicles
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ── TRANSACTIONS ────────────────────────────────────────────
create table if not exists public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  vehicle_id         uuid not null references public.vehicles(id) on delete restrict,
  renter_name        varchar not null,
  renter_phone       varchar not null,
  renter_id_number   varchar,
  renter_address     text,
  start_date         date not null,
  end_date           date not null,
  duration_days      integer generated always as (end_date - start_date) stored,
  total_price        numeric not null,
  deposit            numeric default 0,
  discount           numeric default 0,
  damage_fee         numeric default 0,
  km_start           integer default 0,
  km_end             integer default 0,
  payment_method     varchar default 'cash',
  payment_status     varchar default 'paid' check (payment_status in ('paid', 'unpaid')),
  status             varchar not null default 'active'
                       check (status in ('active', 'completed', 'cancelled')),
  issues_reported    text,
  notes              text,
  -- Kolom lama (tidak dipakai lagi oleh panel; dipertahankan untuk kompatibilitas data)
  customer_image_url text,
  -- Referensi foto serah terima: "storage://handover-photos/<path>"
  handover_image_url text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
create index if not exists idx_transactions_start_date on public.transactions (start_date);
create index if not exists idx_transactions_end_date   on public.transactions (end_date);
create index if not exists idx_transactions_status     on public.transactions (status);
create index if not exists idx_transactions_vehicle_id on public.transactions (vehicle_id);

drop trigger if exists set_updated_at_transactions on public.transactions;
create trigger set_updated_at_transactions
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ── EXPENSES (pengeluaran + pemasukan lain) ─────────────────
create table if not exists public.expenses (
  id                  uuid primary key default gen_random_uuid(),
  type                varchar default 'expense',
  title               varchar not null,
  category            varchar not null default 'other',
  amount              numeric not null default 0,
  expense_date        date not null,
  vehicle_id          uuid references public.vehicles(id) on delete set null,
  notes               text,
  is_auto_transaction boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists idx_expenses_expense_date on public.expenses (expense_date desc);
create index if not exists idx_expenses_vehicle_id   on public.expenses (vehicle_id);

drop trigger if exists set_updated_at_expenses on public.expenses;
create trigger set_updated_at_expenses
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- ── CUSTOMERS ───────────────────────────────────────────────
create table if not exists public.customers (
  id                 uuid primary key default gen_random_uuid(),
  name               varchar not null,
  phone              varchar not null,
  id_number          varchar,
  address            text,
  notes              text,
  customer_image_url text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists idx_customers_name  on public.customers (name);
create index if not exists idx_customers_phone on public.customers (phone);

drop trigger if exists set_updated_at_customers on public.customers;
create trigger set_updated_at_customers
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ── RLS: HANYA admin yang login ─────────────────────────────
alter table public.vehicles     enable row level security;
alter table public.transactions enable row level security;
alter table public.expenses     enable row level security;
alter table public.customers    enable row level security;

drop policy if exists "vehicles_admin_all" on public.vehicles;
create policy "vehicles_admin_all" on public.vehicles
  for all to authenticated using (true) with check (true);

drop policy if exists "transactions_admin_all" on public.transactions;
create policy "transactions_admin_all" on public.transactions
  for all to authenticated using (true) with check (true);

drop policy if exists "expenses_admin_all" on public.expenses;
create policy "expenses_admin_all" on public.expenses
  for all to authenticated using (true) with check (true);

drop policy if exists "customers_admin_all" on public.customers;
create policy "customers_admin_all" on public.customers
  for all to authenticated using (true) with check (true);

-- Grant eksplisit; anon (pengunjung tanpa login) tidak punya akses apa pun.
revoke all on public.vehicles, public.transactions, public.expenses, public.customers from anon;
grant select, insert, update, delete
  on public.vehicles, public.transactions, public.expenses, public.customers to authenticated;
grant all on public.vehicles, public.transactions, public.expenses, public.customers to service_role;
