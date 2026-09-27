import '@/styles/landing.css';
import { BookingProvider } from '@/components/landing/BookingProvider';
import { HeroDesktop, HeroMobile } from '@/components/landing/Hero';
import { CheckPriceDesktop, CheckPriceMobile } from '@/components/landing/CheckPrice';
import { BenefitsDesktop, BenefitsMobile } from '@/components/landing/Benefits';
import { FleetDesktop, FleetMobile } from '@/components/landing/Fleet';
import { HowItWorksDesktop, HowItWorksMobile } from '@/components/landing/HowItWorks';
import { WhyUsDesktop, WhyUsMobile } from '@/components/landing/WhyUs';
import { ReviewsDesktop, ReviewsMobile } from '@/components/landing/Reviews';
import { FaqDesktop, FaqMobile } from '@/components/landing/Faq';
import { FooterDesktop, FooterMobile, WhatsAppFab } from '@/components/landing/Footer';
import MobileFit from '@/components/landing/MobileFit';

export const metadata = {
  title: 'Scooter Rental in Pererenan & Canggu — Boss Rent Pererenan',
  description:
    'Rent an automatic scooter in Pererenan, Canggu and Berawa from Rp 100k a day. Free delivery to your villa, helmet and raincoat included. Book on WhatsApp.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Scooter Rental in Pererenan & Canggu — Boss Rent Pererenan',
    description: 'Automatic scooters from Rp 100k a day, delivered free around Canggu. Helmet and raincoat included.',
    type: 'website',
    locale: 'en_US',
  },
};

/*
 * Halaman publik, dibangun dari 4 file mockup:
 *  - HP (≤ 480px): papan HP ("1-hp-halaman-penuh") diskalakan proporsional
 *               dari 390px ke lebar layar (lihat MobileFit).
 *  - 481–1023px : papan HP, melebar mengikuti layar.
 *  - ≥ 1024px : papan desktop ("3-desktop-hero-armada" + "4-desktop-seksi-bawah"),
 *               latar selebar layar, isi maks. 1160px.
 *  - Sheet booking ("2-hp-sheet-booking") dibuka dari tombol Book / Continue.
 */
export default function LandingPage() {
  return (
    <BookingProvider>
      <MobileFit />
      <div className="flex flex-col bg-white lg:hidden">
        <HeroMobile />
        <CheckPriceMobile />
        <BenefitsMobile />
        <FleetMobile />
        <HowItWorksMobile />
        <WhyUsMobile />
        <ReviewsMobile />
        <FaqMobile />
        <FooterMobile />
        <WhatsAppFab />
      </div>
      <div className="hidden flex-col bg-white lg:flex">
        <HeroDesktop />
        <CheckPriceDesktop />
        <BenefitsDesktop />
        <FleetDesktop />
        <HowItWorksDesktop />
        <WhyUsDesktop />
        <ReviewsDesktop />
        <FaqDesktop />
        <FooterDesktop />
      </div>
    </BookingProvider>
  );
}
