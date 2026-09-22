-- ============================================================
-- Boss Rent Pererenan — Migration 006: Ringkasan Dashboard di database
--
-- Sebelumnya Dashboard menarik SEMUA transaksi tahun berjalan (ratusan baris)
-- hanya untuk menghitung ringkasan di browser. Fungsi di bawah menghitungnya
-- langsung di database, sehingga yang dikirim ke browser cukup angka jadi.
--
-- Aturan bisnis mengikuti src/lib/finance.js:
--  * Transaksi diakui (cash basis): status completed, atau active yang bukan 'unpaid'
--  * Bagi hasil investor = persentase × OMSET KOTOR motor investor
--  * Semua pengeluaran ditanggung owner (tidak memotong bagian investor)
--  * Tanggal memakai waktu Bali (Asia/Makassar)
-- Idempotent.
-- ============================================================

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
           (v.owner_type = 'investor' or coalesce(trim(v.owner_name), '') <> '') as is_inv
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

create or replace function public.dashboard_overview()
returns json
language sql
stable
set search_path = public
as $$
  with v as (select status from vehicles),
  aktif as (
    select t.id, t.end_date, t.total_price, t.payment_status
    from transactions t where t.status = 'active'
  ),
  hari_ini as (select (now() at time zone 'Asia/Makassar')::date as d)
  select json_build_object(
    'totalVehicles',  (select count(*) from v),
    'rentedCount',    (select count(*) from v where status = 'rented'),
    'availableCount', (select count(*) from v where status = 'available'),
    'activeCount',    (select count(*) from aktif),
    'overdueCount',   (select count(*) from aktif, hari_ini where end_date < d),
    'dueSoonCount',   (select count(*) from aktif, hari_ini where end_date between d and d + 1),
    'unpaidCount',    (select count(*) from aktif where payment_status = 'unpaid'),
    'unpaidTotal',    coalesce((select sum(total_price) from aktif where payment_status = 'unpaid'), 0),
    'recent', coalesce((
      select json_agg(r) from (
        select t.id, t.renter_name, t.total_price, t.duration_days, t.status, t.payment_status,
               v2.name as vehicle_name
        from transactions t left join vehicles v2 on v2.id = t.vehicle_id
        order by t.created_at desc limit 5
      ) r), '[]'::json)
  );
$$;

create or replace function public.monthly_rental_revenue(p_year integer)
returns table (bulan integer, total numeric)
language sql
stable
set search_path = public
as $$
  select extract(month from (t.created_at at time zone 'Asia/Makassar'))::int as bulan,
         sum(t.total_price) as total
  from transactions t
  where (t.status = 'completed' or (t.status = 'active' and coalesce(t.payment_status, 'paid') <> 'unpaid'))
    and extract(year from (t.created_at at time zone 'Asia/Makassar'))::int = p_year
  group by 1 order by 1;
$$;

revoke all on function public.dashboard_summary(date, date) from public, anon;
revoke all on function public.dashboard_overview() from public, anon;
revoke all on function public.monthly_rental_revenue(integer) from public, anon;
grant execute on function public.dashboard_summary(date, date) to authenticated;
grant execute on function public.dashboard_overview() to authenticated;
grant execute on function public.monthly_rental_revenue(integer) to authenticated;
