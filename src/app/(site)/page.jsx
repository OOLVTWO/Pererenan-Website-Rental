import { preload } from 'react-dom';
import Hero from '@/components/landing/Hero';
import BookingIsland from '@/components/landing/BookingIsland';
import Fleet from '@/components/landing/Fleet';
import { Faq, HowItWorks, Reviews, WhyUs } from '@/components/landing/Sections';
import Footer from '@/components/landing/Footer';
import { BUSINESS, FLEET, IMAGES } from '@/lib/landing/config';

const TITLE = 'Scooter Rental in Pererenan & Canggu — Boss Rent Pererenan';
const DESCRIPTION =
  'Rent an automatic scooter in Pererenan, Canggu and Berawa from Rp 100k a day. Free delivery to your villa, two helmets and a raincoat included. Book on WhatsApp.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: BUSINESS.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: IMAGES.hero, width: 1376, height: 774, alt: 'Scooter on a rice-field road in Bali' }],
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: BUSINESS.name,
  image: `${BUSINESS.siteUrl}${IMAGES.hero}`,
  logo: `${BUSINESS.siteUrl}${IMAGES.logo}`,
  url: BUSINESS.siteUrl,
  telephone: BUSINESS.phoneDisplay,
  priceRange: 'Rp 100.000 – Rp 250.000 / day',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Pantai Pererenan No.119',
    addressLocality: 'Mengwi',
    addressRegion: 'Bali',
    postalCode: '80351',
    addressCountry: 'ID',
  },
  openingHours: 'Mo-Su 08:00-20:00',
  areaServed: BUSINESS.areas,
  makesOffer: FLEET.map((s) => ({
    '@type': 'Offer',
    name: `${s.name} rental`,
    price: s.price.daily,
    priceCurrency: 'IDR',
  })),
};

/*
 * Halaman publik — sepenuhnya statis, satu DOM responsif:
 *  HP (mockup 390px) sebagai dasar; ≥720px hero dua kolom & seksi versi
 *  desktop; ≥900px armada 4 kolom; ≥960px bilah cek harga satu baris.
 *  Satu-satunya client component: BookingIsland.
 */
export default function LandingPage() {
  preload(IMAGES.hero, { as: 'image', fetchPriority: 'high' });
  return (
    <div className="lp">
      <Hero />
      <BookingIsland variant="bar" />
      <Fleet />
      <HowItWorks />
      <WhyUs />
      <Reviews />
      <Faq />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }} />
    </div>
  );
}
