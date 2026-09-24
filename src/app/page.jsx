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

/** Harga contoh untuk bagian perbandingan (model paling sering disewa). */
const HEADLINE_BIKE = FLEET[0];

function priceRows() {
  const p = HEADLINE_BIKE.price;
  return [
    { label: 'Daily', price: p.daily, note: 'per day', save: null },
    { label: 'Weekly', price: p.weekly, note: '7 days', save: p.daily * 7 - p.weekly },
    { label: 'Monthly', price: p.monthly, note: '30 days', save: p.daily * 30 - p.monthly, highlight: true },
  ];
}

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
          <a href="#prices">Prices</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a className="lp-btn lp-btn-primary lp-btn-sm" href={simpleWa} target="_blank" rel="noopener noreferrer">
            <LIcon name="wa" size={17} /> WhatsApp
          </a>
        </nav>
      </header>

      {/* ── Hero: teks kiri + foto kanan, angka menyatu di bawah tombol ── */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <span className="lp-eyebrow">Scooter rental · Pererenan · Canggu · Berawa</span>
            <h1>{BUSINESS.tagline}</h1>
            <p>{BUSINESS.intro}</p>
            <div className="lp-hero-cta">
              <a className="lp-btn lp-btn-dark" href="#fleet">
                Explore the fleet <LIcon name="arrow" size={18} />
              </a>
              <a className="lp-btn lp-btn-outline" href={simpleWa} target="_blank" rel="noopener noreferrer">
                <LIcon name="wa" size={18} /> Chat with us
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

          <div className="lp-hero-media">
            <Image src={IMAGES.hero} alt="Scooter parked on a quiet road in Pererenan"
              width={1376} height={774} priority sizes="(max-width: 900px) 100vw, 55vw" />
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-icon"><LIcon name="truck" size={18} /></span>
              <span>
                <strong>Free delivery</strong>
                <em>Villa drop-off in under an hour</em>
              </span>
            </div>
          </div>
        </div>

        <BookingIsland variant="bar" />
      </section>

      {/* ── Armada ── */}
      <section className="lp-section lp-section-white" id="fleet">
        <div className="lp-section-head">
          <span className="lp-kicker">Our fleet</span>
          <h2>Every scooter, with the details that matter</h2>
          <p>Capacity, engine size and storage for each model — so you know exactly what turns up.</p>
        </div>
        <BookingIsland variant="fleet" />
        <span className="lp-swipe-hint">Swipe to see all {FLEET.length} models →</span>
      </section>

      {/* ── Sorotan satu motor (bagian gelap) ── */}
      <section className="lp-showcase">
        <span className="lp-showcase-ghost" aria-hidden="true">155</span>
        <div className="lp-showcase-inner">
          <div className="lp-showcase-media">
            <Image src={FLEET[1].photo} alt={FLEET[1].name} width={800} height={520}
              sizes="(max-width: 900px) 90vw, 46vw" loading="lazy" />
          </div>
          <div className="lp-showcase-text">
            <span className="lp-eyebrow light">Most booked for long rides</span>
            <h2>{FLEET[1].name}</h2>
            <p>{FLEET[1].blurb}</p>
            <ul className="lp-showcase-specs">
              <li><LIcon name="engine" size={17} /> {FLEET[1].engine}</li>
              <li><LIcon name="user" size={17} /> {FLEET[1].riders}</li>
              <li><LIcon name="box" size={17} /> {FLEET[1].storage}</li>
              <li><LIcon name="shield" size={17} /> Helmets &amp; raincoat included</li>
            </ul>
            <div className="lp-showcase-price">
              <span>From</span>
              <strong>{formatRupiah(FLEET[1].price.daily)}</strong>
              <span>/ day</span>
            </div>
            <a className="lp-btn lp-btn-light" href="#fleet">
              See all models <LIcon name="arrow" size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Perbandingan harga ── */}
      <section className="lp-band" id="prices">
        <div className="lp-section-head lp-on-dark">
          <span className="lp-kicker">Longer = cheaper</span>
          <h2>{HEADLINE_BIKE.name} — what you pay</h2>
          <p>Weekly and monthly rates are already discounted. The calculator applies them for you.</p>
        </div>
        <div className="lp-price-grid">
          {priceRows().map(r => (
            <div key={r.label} className={`lp-price-card${r.highlight ? ' highlight' : ''}`}>
              <span className="lp-price-label">{r.label}</span>
              <strong>{formatRupiah(r.price)}</strong>
              <span className="lp-price-note">{r.note}</span>
              {r.save > 0 && <span className="lp-price-save">Save {formatRupiah(r.save)}</span>}
            </div>
          ))}
        </div>
        <span className="lp-band-note">Same idea for every model — each card shows its weekly and monthly price.</span>
      </section>

      {/* ── Kenapa kami ── */}
      <section className="lp-section">
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
      </section>

      {/* ── Ulasan ── */}
      <section className="lp-section" id="reviews">
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
      <section className="lp-section">
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
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<LIcon name="down" size={18} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Ajakan terakhir ── */}
      <section className="lp-section">
        <div className="lp-cta">
          <div>
            <h2>Ready to ride today?</h2>
            <p>Send a request and we&apos;ll confirm availability in minutes.</p>
          </div>
          <a className="lp-btn lp-btn-light lp-btn-lg" href={simpleWa} target="_blank" rel="noopener noreferrer">
            <LIcon name="wa" size={19} /> Book on WhatsApp
          </a>
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
