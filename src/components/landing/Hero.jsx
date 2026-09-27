import Link from 'next/link';
import { Icon, Stars } from './Icon';
import { BUSINESS } from '@/lib/landing/config';
import { whatsappUrl } from '@/lib/landing/booking';

const WA = whatsappUrl("Hi Boss Rent! I'd like to rent a scooter.");

const NAV = [
  { label: 'Fleet', href: '#fleet' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
];

export function Brand({ className = '', href = '/' }) {
  return (
    <Link className={`lp-brand ${className}`} href={href}>
      <span className="lp-logo">
        <Icon name="scooter" size="19" color="#fff" />
      </span>
      <span className="lp-brand-name">
        {`${BUSINESS.shortName} `}
        <span className="lp-brand-place">{BUSINESS.place}</span>
      </span>
    </Link>
  );
}

/** Header transparan di atas foto + hero (HP: satu kolom, ≥720px: dua kolom). */
export default function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-photo"></div>
      <div className="lp-hero-veil"></div>

      <header className="lp-head">
        <Brand />
        <nav className="lp-nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="lp-head-wa" href={WA} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size="16" color="#fff" /> Chat on WhatsApp
        </a>
        <details className="lp-menu">
          <summary className="lp-menu-btn" aria-label="Menu">
            <Icon name="menu" size="19" color="#fff" />
          </summary>
          <div className="lp-menu-panel">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
            <a className="lp-menu-wa" href={WA} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size="16" color="#fff" /> Chat on WhatsApp
            </a>
          </div>
        </details>
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
              {` · ${BUSINESS.scooters} scooters · delivered in 1 hr`}
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
              <b>Delivered in 1 hour</b>
              <small>{`Open daily ${BUSINESS.hours}`}</small>
            </span>
          </div>
          <div className="lp-side-price">
            <span>From</span>
            <b>
              Rp 100k<span className="lp-per"> /day</span>
            </b>
          </div>
        </div>
      </div>
    </section>
  );
}
