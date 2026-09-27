/**
 * Konfigurasi Next.js — Panel Admin + halaman publik Boss Rent Pererenan.
 *
 * Koneksi Supabase: lihat src/lib/supabase/config.js (env var opsional,
 * default ke project "Pererenan Website Rental"). Tidak ada secret key.
 */
const isDev = process.env.NODE_ENV === 'development';

/*
 * Content-Security-Policy (tanpa nonce, sesuai panduan Next.js). Hanya sumber
 * yang memang dipakai aplikasi yang diizinkan:
 *  - Supabase (data, auth, storage foto serah terima) untuk fetch & gambar,
 *  - flagcdn.com untuk bendera kode negara di panel admin,
 *  - data:/blob: untuk logo & foto yang diunggah/dikompres di browser.
 * 'unsafe-inline' diperlukan skrip & style bawaan Next.js (tanpa nonce);
 * 'unsafe-eval' hanya saat `next dev`.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://flagcdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Filter XSS bawaan browser lama sudah usang & bisa disalahgunakan — dimatikan (anjuran OWASP).
  { key: 'X-XSS-Protection', value: '0' },
];

const nextConfig = {
  // Jangan umumkan framework & versinya di header respons.
  poweredByHeader: false,

  // Halaman Ketersediaan digabung ke Tracking (tab "Status Armada").
  async redirects() {
    return [
      { source: '/availability', destination: '/tracking?view=armada', permanent: false },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      // Foto & logo di /public/images: disimpan browser 1 hari (dicek ulang diam-diam
      // sampai 7 hari) supaya kunjungan berikutnya tidak mengunduh ulang gambar.
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};

export default nextConfig;
