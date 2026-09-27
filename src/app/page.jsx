/**
 * Placeholder sementara untuk halaman publik.
 *
 * Seluruh kode landing page lama sudah dihapus (commit ini). Berkas ini hanya
 * menjaga rute "/" tetap ada supaya build dan deploy tidak gagal, dan supaya
 * domain tidak menampilkan 404. Hapus saja saat mulai membangun ulang.
 */
export const metadata = {
  title: 'Boss Rent Pererenan',
  description: 'Scooter rental in Pererenan, Bali.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        color: '#0F172A',
        background: '#fff',
        textAlign: 'center',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Boss Rent Pererenan</h1>
      <p style={{ margin: 0, fontSize: '15px', color: '#475569' }}>
        New site coming soon. Message us on{' '}
        <a href="https://wa.me/6281237109751" style={{ color: '#1D4ED8', fontWeight: 600 }}>
          WhatsApp
        </a>
        .
      </p>
    </main>
  );
}
