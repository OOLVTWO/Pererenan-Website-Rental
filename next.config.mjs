/**
 * Konfigurasi Next.js — Panel Admin Boss Rent Pererenan.
 *
 * Koneksi Supabase: lihat src/lib/supabase/config.js (env var opsional,
 * default ke project "Pererenan Website Rental"). Tidak ada secret key.
 */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
