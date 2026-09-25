import Image from 'next/image';
import '@/styles/landing.css';
import { BUSINESS, STATS, FLEET, WHY_US, STEPS, REVIEWS, FAQ, IMAGES, MONTHLY_MIN_DAYS } from '@/lib/landing/config';
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
          <span>{BUSINESS.name}</span>
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
            <dl className="lp-hero-stats">
              {STATS.map(s => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lp-hero-chip">
            <span className="lp-hero-chip-icon"><LIcon name="truck" size={18} /></span>
            <span>
              <strong>Free delivery</strong>
              <em>At your villa in under an hour</em>
            </span>
          </div>
        </div>

        <BookingIsland variant="bar" />
      </section>

      {/* ── Deretan model (strip tenang) ── */}
      <section className="lp-strip" aria-label="Models we rent">
        {FLEET.map(f => <span key={f.id}>{f.name}</span>)}
      </section>

      {/* ── Armada: teks kiri, kartu kanan ── */}
      <section className="lp-section lp-section-white lp-fleet" id="fleet">
        <div className="lp-fleet-intro">
          <span className="lp-kicker">Our fleet</span>
          <h2>Handpicked for<br />your Bali ride</h2>
          <p>
            Capacity, engine size and storage for every model — so you know exactly what turns up
            at your door. Every scooter is serviced monthly and comes with two helmets.
          </p>
          <a className="lp-btn lp-btn-ghost" href={simpleWa} target="_blank" rel="noopener noreferrer">
            Ask what&apos;s available <LIcon name="arrow" size={18} />
          </a>
          <span className="lp-fleet-note">
            <LIcon name="check" size={16} /> Weekly &amp; monthly rates already discounted
          </span>
        </div>
        <div className="lp-fleet-main">
          <BookingIsland variant="fleet" />
          <span className="lp-swipe-hint">Swipe to see all {FLEET.length} models →</span>
        </div>
      </section>

      {/* ── Kenapa kami ── */}
      <section className="lp-section lp-section-mist">
        <div className="lp-section-head">
          <span className="lp-kicker">Why us</span>
          <h2>Booked in minutes, ridden all week</h2>
        </div>
        <div className="lp-why-grid">
          {WHY_US.map(w => (
            <div key={w.title} className="lp-card lp-why">
              <span className="lp-why-icon"><LIcon name={w.icon} size={20} /></span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pemisah foto ── */}
      <div className="lp-divider">
        <Image src={IMAGES.divider} alt="" fill sizes="100vw" loading="lazy" />
      </div>

      {/* ── Cara sewa ── */}
      <section className="lp-section lp-section-white" id="how">
        <div className="lp-section-head">
          <span className="lp-kicker">How it works</span>
          <h2>Three steps, no paperwork</h2>
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
          <span>Rentals of {MONTHLY_MIN_DAYS} days or more · fitting included</span>
          <span>Helmets &amp; raincoat always free</span>
        </div>
      </section>

      {/* ── Ulasan ── */}
      <section className="lp-section lp-section-mist" id="reviews">
        <div className="lp-reviews-head">
          <div className="lp-section-head">
            <span className="lp-kicker">Reviews</span>
            <h2>What guests say</h2>
          </div>
          <a className="lp-btn lp-btn-ghost" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
            Read all reviews on Google <LIcon name="arrow" size={16} />
          </a>
        </div>
        {REVIEWS.isSample && (
          <span className="lp-sample">Sample reviews — replace with real ones before launch</span>
        )}
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

      {/* ── Area antar ── */}
      <section className="lp-section lp-section-white">
        <div className="lp-card lp-area">
          <div className="lp-area-text">
            <h2>Free delivery area</h2>
            <p>We drop the scooter off and pick it up again — no charge inside these areas.</p>
            <div className="lp-chips">
              {BUSINESS.deliveryAreas.map(a => <span key={a}>{a}</span>)}
            </div>
            <span className="lp-hint">{BUSINESS.deliveryNote}</span>
            <a className="lp-link" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
              <LIcon name="pin" size={16} /> Open in Google Maps
            </a>
          </div>
          <div className="lp-area-map">
            <Image src={IMAGES.map} alt="Map of the delivery area around Pererenan" width={900} height={640}
              sizes="(max-width: 860px) 100vw, 50vw" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── FAQ (tanpa JavaScript) ── */}
      <section className="lp-section lp-section-white" id="faq">
        <div className="lp-section-head">
          <span className="lp-kicker">FAQ</span>
          <h2>Questions we get every day</h2>
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
        <div className="lp-footer-grid">
          <div>
            <strong>{BUSINESS.name}</strong>
            <p>Scooter rental in Pererenan. Clean bikes, honest prices, delivered to your door.</p>
          </div>
          <div>
            <span className="lp-footer-label">Visit us</span>
            <p>{BUSINESS.address}</p>
            <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
              <LIcon name="pin" size={16} /> Open in Google Maps
            </a>
          </div>
          <div>
            <span className="lp-footer-label">Talk to us</span>
            <a href={simpleWa} target="_blank" rel="noopener noreferrer">
              <LIcon name="wa" size={16} /> {BUSINESS.phoneDisplay}
            </a>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer">
              <LIcon name="insta" size={16} /> {BUSINESS.instagram}
            </a>
            <span className="lp-footer-hours"><LIcon name="clock" size={16} /> {BUSINESS.hours}</span>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
          <span>Add-ons: top box &amp; surf rack from {MONTHLY_MIN_DAYS} days</span>
        </div>
      </footer>

      {/* ── Tombol WhatsApp melayang ── */}
      <a className="lp-float" href={simpleWa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <LIcon name="wa" size={26} />
      </a>
    </div>
  );
}
