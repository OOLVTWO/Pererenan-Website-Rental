/**
 * Konfigurasi koneksi Supabase — project "Pererenan Website Rental".
 *
 * Env var (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) opsional.
 * Nilai env HANYA dipakai kalau valid; kalau tidak valid (mis. berisi ID project
 * saja, bukan URL) atau mengarah ke project lama yang sudah dipensiunkan, env
 * diabaikan dan default di bawah dipakai. Sebelumnya env yang salah membuat
 * createServerClient() melempar "Invalid supabaseUrl" di middleware → SEMUA
 * halaman Internal Server Error.
 *
 * Aman untuk repo publik: URL project & publishable key memang publik; tanpa
 * login key ini tidak bisa membaca data apa pun (RLS admin-only).
 * Secret / service role key TIDAK dipakai sama sekali oleh aplikasi ini.
 */
const DEFAULT_URL = 'https://fltfzhcvvfmregcsjovm.supabase.co';
const DEFAULT_KEY = 'sb_publishable_iWt45_dREFPYUyb_m1XonA_v3JR1D6-';

// Project lama (sudah di-pause, datanya sudah dipindah). Jangan pernah dipakai lagi.
const RETIRED_PROJECT_REFS = ['eedrziblypwrufdzctvd'];

export function resolveSupabaseConfig(envUrl, envKey) {
  const url = String(envUrl || '').trim().replace(/\/+$/, '');
  const key = String(envKey || '').trim();

  let urlOk = false;
  try {
    const u = new URL(url);
    const ref = u.hostname.split('.')[0];
    urlOk = u.protocol === 'https:'
      && u.hostname.endsWith('.supabase.co')
      && !RETIRED_PROJECT_REFS.includes(ref);
  } catch {
    urlOk = false;
  }
  const keyOk = /^(sb_publishable_|eyJ)[A-Za-z0-9._-]{10,}$/.test(key);

  if (urlOk && keyOk) return { url, key, source: 'env' };
  return {
    url: DEFAULT_URL,
    key: DEFAULT_KEY,
    source: url || key ? 'default (env diabaikan: tidak valid / project lama)' : 'default',
  };
}

const resolved = resolveSupabaseConfig(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const SUPABASE_URL = resolved.url;
export const SUPABASE_PUBLISHABLE_KEY = resolved.key;
export const SUPABASE_CONFIG_SOURCE = resolved.source;
