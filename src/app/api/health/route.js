import { NextResponse } from 'next/server';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_CONFIG_SOURCE } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health — cek cepat konfigurasi & koneksi ke Supabase.
 * Tidak menampilkan secret apa pun (URL project & publishable key memang publik).
 */
export async function GET() {
  const result = {
    ok: false,
    supabase: {
      host: new URL(SUPABASE_URL).hostname,
      config: SUPABASE_CONFIG_SOURCE,
      auth: null,
    },
    time: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    result.supabase.auth = res.ok ? 'ok' : `HTTP ${res.status}`;
    result.ok = res.ok;
  } catch (err) {
    result.supabase.auth = `tidak terjangkau: ${err?.message || err}`;
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
