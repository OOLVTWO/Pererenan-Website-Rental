import Image from 'next/image';
import Link from 'next/link';
import { Icon, Stars } from './Icon';
import { BUSINESS, IMAGES, NAV, REVIEWS } from '@/lib/landing/config';
import { whatsappUrl } from '@/lib/landing/booking';

const WA = whatsappUrl("Hi Boss Rent! I'd like to rent a scooter.");

// Menu Reviews ikut hilang bila seksi ulasan disembunyikan.
const LINKS = NAV.filter((n) => n.id !== 'reviews' || REVIEWS.show);

/** Logo BOSS + nama. Dipakai di header, footer & halaman motor. */
export function Brand({ className = '', href = '/', eager = false }) {
  return (
    <Link className={`lp-brand ${className}`} href={href}>
      <Image
        className="lp-logo"
        src={IMAGES.logo}
        alt=""
        width={188}
        height={139}
        unoptimized
        loading={eager ? 'eager' : 'lazy'}
      />
      <span className="lp-brand-name">
        {`${BUSINESS.shortName} `}
        <span className="lp-brand-place">{BUSINESS.place}</span>
      </span>
    </Link>
  );
}

/**
 * Laci menu HP: muncul dari kanan, halaman masih terlihat di kiri.
 * Buka/tutup, kunci scroll & penanda seksi aktif diatur BookingIsland
 * lewat atribut data-lp-* (HTML ini tetap statis).
 */
function MenuDrawer() {
  return (
    <div className="lp-drawer" id="lp-drawer">
      <div className="lp-drawer-veil" data-lp-menu-close=""></div>
      <div className="lp-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="lp-drawer-top">
          <button type="button" className="lp-drawer-close" data-lp-menu-close="" aria-label="Close menu">
            <Icon name="close" size="22" color="#0F172A" />
          </button>
        </div>
        <div className="lp-drawer-brand">
          <Image src={IMAGES.logo} alt="" width={188} height={139} unoptimized />
          <span>
            <b>{BUSINESS.name}</b>
            <small>Scooter rental · Bali</small>
          </span>
        </div>
        <nav className="lp-drawer-nav" aria-label="Menu">
          {LINKS.map((n) => (
            <a key={n.id} href={`#${n.id}`} data-lp-nav={n.id}>
              <Icon name={n.icon} size="22" color="#475569" />
              {n.label}
            </a>
          ))}
        </nav>
        <div className="lp-drawer-foot">
          <span>
            <Icon name="clock" size="20" color="#475569" />
            <span>
              <b>Open daily</b>
              {` ${BUSINESS.hours}`}
            </span>
          </span>
          <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" size="20" color="#475569" />
            {BUSINESS.instagram}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Header menempel (transparan di puncak halaman, putih begitu digulir) + hero
 * (HP: satu kolom, ≥720px: dua kolom).
 */
export default function Hero() {
  return (
    <>
      <section className="lp-hero" id="top">
        <div className="lp-hero-photo"></div>
        <div className="lp-hero-veil"></div>

        <header className="lp-head">
          <Brand eager />
          <nav className="lp-nav" aria-label="Main">
            {LINKS.filter((n) => !n.drawerOnly).map((n) => (
              <a key={n.id} href={`#${n.id}`} data-lp-nav={n.id}>
                {n.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="lp-menu-btn"
            data-lp-menu-open=""
            aria-label="Open menu"
            aria-controls="lp-drawer"
            aria-expanded="false"
          >
            <Icon name="menu" size="19" color="#fff" />
          </button>
        </header>

        <div className="lp-hero-body">
          <div className="lp-hero-text">
            <span className="lp-pill">Pererenan · Canggu · Berawa</span>
            <h1>
              Scooter rental
              <br className="lp-mb" /> made simple
              <br className="lp-mb" /> in Bali.
            </h1>
            <p className="lp-hero-lead">
              <span className="lp-mb">
                39 automatics, serviced monthly and delivered free to your door. Helmets on the seat, no passport held.
              </span>
              <span className="lp-dk">
                39 automatics, serviced monthly and delivered free to your door in Canggu, Berawa and Pererenan. Helmets
                on the seat, and your passport stays with you.
              </span>
            </p>
            <div className="lp-hero-cta">
              <button type="button" className="lp-btn" data-lp-book="">
                Book a scooter <Icon name="arrow" size="17" color="#fff" />
              </button>
              <a className="lp-btn-glass" href={WA} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size="17" color="#fff" /> Chat on WhatsApp
              </a>
            </div>
            <div className="lp-hero-rating">
              <Stars />
              <span>
                <strong>{BUSINESS.rating}</strong>
                {` · ${BUSINESS.scooters} scooters · open ${BUSINESS.hours}`}
              </span>
            </div>
            <div className="lp-hero-stats">
              <span>
                <Stars />
                <span>
                  <strong>{BUSINESS.rating}</strong> rating
                </span>
              </span>
              <i></i>
              <span>
                <strong>{BUSINESS.scooters}</strong> scooters
              </span>
              <i></i>
              <span>
                <strong>{BUSINESS.models}</strong> models
              </span>
            </div>
          </div>
          <div className="lp-hero-side">
            <div className="lp-side-card">
              <span className="lp-tile">
                <Icon name="clock" size="20" color="#fff" />
              </span>
              <span>
                <b>Opening hours</b>
                <small>{`Open daily ${BUSINESS.hours}`}</small>
              </span>
            </div>
          </div>
        </div>
      </section>
      <MenuDrawer />
    </>
  );
}
