import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie set akan ditangani proxy
          }
        },
      },
    }
  );
}

/**
 * Client untuk API route (/api/*), dipanggil SETELAH requireAuth().
 *
 * Sengaja memakai sesi admin yang sedang login (bukan service role key):
 * RLS memberi akses penuh ke user yang login, jadi hasilnya sama, tapi
 * tidak ada secret yang perlu disimpan di Vercel — tidak ada yang bisa bocor.
 * (Riwayat: secret key project lama pernah bocor di repo publik.)
 */
export async function createAdminClient() {
  return createClient();
}
