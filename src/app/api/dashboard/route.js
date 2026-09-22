import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/apiAuth';

// GET /api/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD&year=2026
// Ringkasan dihitung di database (lihat migration 006) — browser hanya
// menerima angka jadi, bukan ratusan baris transaksi.
export async function GET(request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  if (!start || !end) return NextResponse.json({ error: 'Periode tidak lengkap.' }, { status: 400 });

  const supabase = await createClient();
  const [summaryRes, monthlyRes] = await Promise.all([
    supabase.rpc('dashboard_summary', { p_start: start, p_end: end }),
    supabase.rpc('monthly_rental_revenue', { p_year: year }),
  ]);

  if (summaryRes.error) {
    console.error('dashboard_summary error:', summaryRes.error.message);
    return NextResponse.json({ error: summaryRes.error.message }, { status: 500 });
  }
  return NextResponse.json({ summary: summaryRes.data, monthly: monthlyRes.data || [] });
}
