/**
 * Next.js 16 Proxy (konvensi baru; `middleware.js` deprecated sejak Next 16).
 *
 * Fungsi:
 *  1. Refresh session Supabase (access token) di setiap request.
 *  2. Proteksi area /dashboard — user belum login diarahkan ke /login.
 *
 * Sebelum file ini ada, token tidak pernah di-refresh: setelah ±1 jam
 * halaman client (vehicles, transactions, dll.) gagal fetch diam-diam
 * dan data tampak "hilang" padahal masih ada di database.
 */
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/supabase/config';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  let user = null;
  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // PENTING: getUser() (bukan getSession()) — validasi + refresh token.
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    // Jangan pernah membuat SELURUH situs error karena masalah koneksi/konfigurasi.
    // Perlakukan sebagai belum login: /login tetap bisa dibuka.
    console.error('proxy: gagal memeriksa sesi Supabase:', err?.message || err);
    user = null;
  }

  // Area dashboard wajib login
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi membuka /login → arahkan ke dashboard
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Hanya /login yang diperiksa di proxy. Halaman dashboard sudah diperiksa di
    // (dashboard)/layout.jsx — memeriksa dua kali berarti dua panggilan jaringan
    // ke Supabase untuk setiap kali halaman dibuka.
    matcher: ['/login'],
};
