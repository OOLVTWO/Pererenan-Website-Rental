import Image from 'next/image';
import '@/styles/landing.css';
import { BUSINESS, STATS, FLEET, WHY_US, STEPS, REVIEWS, FAQ, IMAGES, EQUIPMENT_MIN_DAYS } from '@/lib/landing/config';
import { formatRupiah, whatsappUrl } from '@/lib/landing/booking';
import { LIcon } from '@/components/landing/LIcon';
import BookingIsland from '@/components/landing/BookingIsland';

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

const simpleWa = whatsappUrl(
  BUSINESS.phoneE164,
  "Hi Boss Rent! I'd like to rent a scooter. Could you tell me what's available?",
);


export default function LandingPage() {
  return (
    <div className="lp">
      {/* ── Header ── */}
      <header className="lp-header">
        <a className="lp-brand" href="#top">
          <Image src="/images/logoCompany.png" alt="" width={40} height={27} priority />
          <span className="lp-brand-short">{BUSINESS.shortName}</span>
          <span className="lp-brand-long">{BUSINESS.name}</span>
        </a>
        <nav className="lp-nav" aria-label="Main">
          <a href="#fleet">Fleet</a>
          <a href="#how">How it works</a>
          <a href="#reviews">Reviews</a>
          <a href="#faq">FAQ</a>
          <a className="lp-btn lp-btn-primary lp-btn-sm" href={simpleWa} target="_blank" rel="noopener noreferrer">
            <LIcon name="wa" size={17} /> WhatsApp
          </a>
        </nav>
      </header>

      {/* ── Hero: foto latar penuh + gradasi, teks di atasnya (gaya DriveX) ── */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-bg">
          <Image src={IMAGES.hero} alt="" fill priority sizes="100vw" />
          <span className="lp-hero-veil" aria-hidden="true" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <span className="lp-eyebrow light">Pererenan · Canggu · Berawa</span>
            <h1>{BUSINESS.tagline}</h1>
            <p>{BUSINESS.intro}</p>
            <div className="lp-hero-cta">
              <a className="lp-btn lp-btn-primary" href="#fleet">
                Book a scooter <LIcon name="arrow" size={18} />
              </a>
              <a className="lp-btn lp-btn-glass" href={simpleWa} target="_blank" rel="noopener noreferrer">
                <LIcon name="wa" size={18} /> Chat on WhatsApp
              </a>
            </div>
            <div className="lp-hero-trust">
              <span className="lp-stars" aria-label="Rated 5 out of 5">
                {[0, 1, 2, 3, 4].map(i => <LIcon key={i} name="star" size={15} />)}
              </span>
              <span><strong>{STATS[3].value}</strong> rating</span>
              <i aria-hidden="true" />
              <span><strong>{STATS[0].value}</strong> scooters</span>
              <i aria-hidden="true" />
              <span><strong>{STATS[1].value}</strong> models</span>
            </div>
          </div>

          <div className="lp-hero-chip">
            <span className="lp-hero-chip-icon"><LIcon name="clock" size={18} /></span>
            <span>
              <strong>Delivered in 1 hour</strong>
              <em>{BUSINESS.hours}</em>
            </span>
          </div>
        </div>

        <BookingIsland variant="bar" />
      </section>

      {/* ── Strip kepercayaan ── */}
      <section className="lp-trust" aria-label="What every rental includes">
        {WHY_US.map(w => (
          <div key={w.title}>
            <span className="lp-trust-icon"><LIcon name={w.icon} size={19} /></span>
            <span>
              <strong>{w.title}</strong>
              <em>{w.short}</em>
            </span>
          </div>
        ))}
      </section>

      {/* ── Armada: teks kiri, kartu kanan ── */}
      <section className="lp-section lp-section-white lp-fleet" id="fleet">
        <div className="lp-fleet-intro">
          <div className="lp-fleet-titles">
            <span className="lp-kicker">The fleet</span>
            <h2>Seven models, {STATS[0].value} scooters ready.</h2>
          </div>
        </div>
        <div className="lp-fleet-main">
          <BookingIsland variant="fleet" />
        <p className="lp-fleet-note">
          No hidden weekend surcharge — weekly and monthly rates are already discounted and applied
          automatically. Top box and surf rack: {formatRupiah(350000)} each, on rentals of{' '}
          {EQUIPMENT_MIN_DAYS} days or more, fitting included.
        </p>
          <span className="lp-swipe-hint">Swipe to see all {FLEET.length} models →</span>
        </div>
      </section>

      {/* ── Cara sewa ── */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-section-head">
          <span className="lp-kicker">How it works</span>
          <h2>Three steps, no counter queue.</h2>
        </div>
        <ol className="lp-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="lp-step-num">{i + 1}</span>
              <span><strong>{s.title}</strong><em>{s.text}</em></span>
            </li>
          ))}
        </ol>
        <div className="lp-extras">
          <b>Extras</b>
          <span>Top box <strong>{formatRupiah(350000)}</strong></span>
          <span>Surf rack <strong>{formatRupiah(350000)}</strong></span>
          <span>Rentals of {EQUIPMENT_MIN_DAYS} days or more · fitting included</span>
          <span>Helmets &amp; raincoat always free</span>
        </div>
      </section>

      {/* ── Kenapa kami ── */}
      <section className="lp-section lp-section-white">
        <div className="lp-why-panel">
          <div className="lp-why-side">
            <span className="lp-kicker">Why us</span>
            <h2>Rental without the usual traps.</h2>
            <div className="lp-why-grid">
              {WHY_US.map(w => (
                <div key={w.title} className="lp-why">
                  <span className="lp-why-icon"><LIcon name={w.icon} size={20} /></span>
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <span className="lp-hint">
              <LIcon name="check" size={15} /> Every bike is on a monthly service log, and the same team answers your messages.
            </span>
          </div>
          <div className="lp-why-media">
            <Image src={IMAGES.divider} alt="" width={1200} height={800} sizes="(max-width: 900px) 100vw, 46vw" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── Ulasan ── */}
      <section className="lp-section lp-section-mist" id="reviews">
        <div className="lp-reviews-head">
          <div className="lp-section-head">
            <span className="lp-kicker">Reviews</span>
            <h2>What renters say.</h2>
          </div>
          <a className="lp-btn lp-btn-ghost" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
            Read all reviews on Google <LIcon name="arrow" size={16} />
          </a>
        </div>
        <div className="lp-review-grid">
          {REVIEWS.items.map(r => (
            <figure key={r.name} className="lp-card lp-review">
              <span className="lp-review-stars" aria-label="5 out of 5">
                {[0, 1, 2, 3, 4].map(i => <LIcon key={i} name="star" size={15} />)}
              </span>
              <blockquote>{r.text}</blockquote>
              <figcaption><strong>{r.name}</strong><em>{r.country} · {r.date}</em></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── FAQ (tanpa JavaScript) ── */}
      <section className="lp-section lp-section-white" id="faq">
        <div className="lp-section-head">
          <span className="lp-kicker">FAQ</span>
          <h2>Good to know.</h2>
        </div>
        <div className="lp-faq">
          {FAQ.slice(0, 5).map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<LIcon name="down" size={18} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
          <div className="lp-faq-ask">
            <h3>Still have a question?</h3>
            <p>Send it over and we reply with a straight answer, usually within minutes.</p>
            <a className="lp-btn" href={simpleWa} target="_blank" rel="noopener noreferrer">
              <LIcon name="wa" size={16} /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-lead">
            <span className="lp-footer-brand">
              <Image src="/images/logoCompany.png" alt="" width={38} height={26} />
              <strong>{BUSINESS.name}</strong>
            </span>
            <p>Send us your dates and we reply with availability and a delivery time.</p>
            <div className="lp-footer-cta">
              <a className="lp-btn lp-btn-primary" href={simpleWa} target="_blank" rel="noopener noreferrer">
                <LIcon name="wa" size={18} /> {BUSINESS.phoneDisplay}
              </a>
              <a className="lp-btn lp-btn-ghost" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
                <LIcon name="pin" size={17} /> Get directions
              </a>
            </div>
            <div className="lp-chips">
              {BUSINESS.deliveryAreas.map(a => <span key={a}>{a}</span>)}
            </div>
          </div>
          <div className="lp-footer-map">
            <Image src={IMAGES.map} alt="Map of the delivery area around Pererenan" width={900} height={640}
              sizes="(max-width: 860px) 100vw, 44vw" loading="lazy" />
          </div>
        </div>

        <div className="lp-footer-grid">
          <div>
            <span className="lp-footer-label">Visit us</span>
            <p>{BUSINESS.address}</p>
          </div>
          <div>
            <span className="lp-footer-label">Talk to us</span>
            <a href={simpleWa} target="_blank" rel="noopener noreferrer">
              <LIcon name="wa" size={16} /> {BUSINESS.phoneDisplay}
            </a>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer">
              <LIcon name="insta" size={16} /> {BUSINESS.instagram}
            </a>
          </div>
          <div>
            <span className="lp-footer-label">Opening hours</span>
            <span className="lp-footer-hours"><LIcon name="clock" size={16} /> {BUSINESS.hours}</span>
            <span className="lp-footer-hours"><LIcon name="truck" size={16} /> {BUSINESS.deliveryNote}</span>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
          <span>Add-ons: top box &amp; surf rack from {EQUIPMENT_MIN_DAYS} days</span>
        </div>
      </footer>

      {/* ── Tombol WhatsApp melayang ── */}
      <a className="lp-float" href={simpleWa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <LIcon name="wa" size={26} />
      </a>
    </div>
  );
}
