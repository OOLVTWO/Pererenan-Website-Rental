-- ============================================================
-- Boss Rent Pererenan — Migration 007: pindah kepemilikan motor investor
--
-- Motor titipan investor yang dibeli owner TIDAK perlu dihapus / dibuat ulang.
-- Cukup isi vehicles.owned_since = tanggal motor resmi jadi milik sendiri:
--  * sewa yang MULAI sebelum tanggal itu tetap bagi hasil investor
--    (owner_name & revenue_share_percentage disimpan sebagai riwayat),
--  * sewa mulai tanggal itu 100% milik owner.
-- Aturan yang sama ada di src/lib/finance.js (isInvestorShareTx).
-- Idempotent.
-- ============================================================

alter table public.vehicles add column if not exists owned_since date;

comment on column public.vehicles.owned_since is
  'Motor eks-investor: tanggal mulai milik sendiri. Sewa (start_date) sebelum tanggal ini = bagi hasil investor.';

-- Ringkasan dashboard: status investor ditentukan PER TRANSAKSI (bukan per motor),
-- supaya motor eks-investor hanya dibagi hasil untuk sewa sebelum owned_since.
create or replace function public.dashboard_summary(p_start date, p_end date)
returns json
language sql
stable
set search_path = public
as $$
  with paid as (
    select t.total_price, t.vehicle_id,
           (t.created_at at time zone 'Asia/Makassar')::date as tgl,
           coalesce(nullif(v.revenue_share_percentage, 0), 70) as pct,
           ((v.owner_type = 'investor' or coalesce(trim(v.owner_name), '') <> '')
             and (v.owned_since is null
                  or coalesce(t.start_date, (t.created_at at time zone 'Asia/Makassar')::date) < v.owned_since)) as is_inv
    from transactions t
    join vehicles v on v.id = t.vehicle_id
    where (t.status = 'completed' or (t.status = 'active' and coalesce(t.payment_status, 'paid') <> 'unpaid'))
      and (t.created_at at time zone 'Asia/Makassar')::date between p_start and p_end
  ),
  per_v as (
    select vehicle_id, is_inv, pct, sum(total_price) as rev
    from paid group by 1, 2, 3
  ),
  kas as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0) as other_income,
      coalesce(sum(amount) filter (where coalesce(type, 'expense') <> 'income'), 0) as expenses,
      coalesce(sum(amount) filter (where type = 'income' and expense_date = (now() at time zone 'Asia/Makassar')::date), 0) as other_income_today
    from expenses
    where expense_date between p_start and p_end
  )
  select json_build_object(
    'rentalRevenue',       coalesce((select sum(rev) from per_v), 0),
    'paidCount',           (select count(*) from paid),
    'ownerVehicleRevenue', coalesce((select sum(rev) from per_v where not is_inv), 0),
    'investorRevenue',     coalesce((select sum(rev) from per_v where is_inv), 0),
    'investorPayout',      coalesce((select sum(round(rev * pct / 100.0)) from per_v where is_inv), 0),
    'otherIncome',         (select other_income from kas),
    'totalExpenses',       (select expenses from kas),
    'todayRevenue',        coalesce((select sum(total_price) from paid where tgl = (now() at time zone 'Asia/Makassar')::date), 0)
                           + (select other_income_today from kas)
  );
$$;

revoke all on function public.dashboard_summary(date, date) from public, anon;
grant execute on function public.dashboard_summary(date, date) to authenticated;
