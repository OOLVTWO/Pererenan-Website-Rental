import '@/styles/landing.css';
import { Sprite } from '@/components/landing/Icon';
import MobileFit from '@/components/landing/MobileFit';

/**
 * Layout halaman publik (/ dan /scooters/[id]). CSS landing, skrip viewport
 * HP, dan sprite ikon dimuat sekali di sini — tidak ikut dirender ulang saat
 * berpindah halaman lewat <Link>. Panel admin tidak memakai layout ini.
 */
export default function SiteLayout({ children }) {
  return (
    <>
      <MobileFit />
      {children}
      <Sprite />
    </>
  );
}
