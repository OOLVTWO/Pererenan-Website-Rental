import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/styles/landing.css';
import { BUSINESS, FLEET, EQUIPMENT, EQUIPMENT_MIN_DAYS } from '@/lib/landing/config';
import { formatRupiah, whatsappUrl } from '@/lib/landing/booking';
import { LIcon } from '@/components/landing/LIcon';
import BookingIsland from '@/components/landing/BookingIsland';

/** Semua halaman motor dibuat statis saat build — tidak menyentuh database. */
export function generateStaticParams() {
  return FLEET.map(f => ({ id: f.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bike = FLEET.find(f => f.id === id);
  if (!bike) return {};
  const price = formatRupiah(bike.price.daily);
  return {
    title: `Rent a ${bike.name} in Pererenan & Canggu — ${BUSINESS.shortName}`,
    description: `${bike.name} scooter rental from ${price} a day. ${bike.engine}, helmets included, delivered free around Canggu, Berawa and Pererenan.`,
    alternates: { canonical: `/scooters/${bike.id}` },
    openGraph: { title: `${bike.name} — ${BUSINESS.shortName}`, description: bike.blurb, type: 'website' },
  };
}

export default async function ScooterPage({ params }) {
  const { id } = await params;
  const bike = FLEET.find(f => f.id === id);
  if (!bike) notFound();

  const others = FLEET.filter(f => f.id !== bike.id);
  const wa = whatsappUrl(
    BUSINESS.phoneE164,
    `Hi Boss Rent! I'd like to rent the ${bike.name}. Is it available?`,
  );
  const rates = [
    { label: 'Daily', price: bike.price.daily, note: '1–6 days' },
    { label: 'Weekly', price: bike.price.weekly, note: '7 days', save: bike.price.daily * 7 - bike.price.weekly },
    { label: 'Monthly', price: bike.price.monthly, note: '30 days', save: bike.price.daily * 30 - bike.price.monthly },
  ];

  return (
    <div className="lp">
      <header className="lp-subheader">
        <Link className="lp-back" href="/#fleet">
          <LIcon name="arrow" size={17} /> All scooters
        </Link>
        <a className="lp-btn lp-btn-primary lp-btn-sm" href={wa} target="_blank" rel="noopener noreferrer">
          <LIcon name="wa" size={16} /> WhatsApp
        </a>
      </header>

      <section className="lp-detail">
        <div className="lp-detail-media">
          <Image src={bike.photo} alt={bike.name} width={900} height={600} priority sizes="(max-width: 860px) 100vw, 50vw" />
          {bike.tag && <span className="lp-bike-tag">{bike.tag}</span>}
        </div>

        <div className="lp-detail-text">
          <span className="lp-kicker">{bike.engine}</span>
          <h1>{bike.name}</h1>
          <p>{bike.description || bike.blurb}</p>

          <ul className="lp-detail-specs">
            <li><LIcon name="engine" size={17} /> {bike.engine}</li>
            <li><LIcon name="user" size={17} /> {bike.riders}</li>
            <li><LIcon name="box" size={17} /> {bike.storage}</li>
            <li><LIcon name="helmet" size={17} /> 2 helmets &amp; raincoat included</li>
          </ul>

          <div className="lp-detail-price">
            <span>From</span>
            <strong>{formatRupiah(bike.price.daily)}</strong>
            <span>/ day</span>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-mist">
        <div className="lp-section-head">
          <span className="lp-kicker">Rates</span>
          <h2>What the {bike.name} costs</h2>
          <p>Weekly and monthly rates are already discounted — the calculator picks the cheapest package for your dates.</p>
        </div>
        <div className="lp-rate-grid">
          {rates.map(r => (
            <div key={r.label} className="lp-rate-card">
              <span className="lp-rate-label">{r.label}</span>
              <strong>{formatRupiah(r.price)}</strong>
              <span className="lp-rate-note">{r.note}</span>
              {r.save > 0 && <span className="lp-rate-save">Save {formatRupiah(r.save)}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-section-white" id="book">
        <div className="lp-section-head">
          <span className="lp-kicker">Book it</span>
          <h2>Check your dates</h2>
          <p>Pick your dates and add-ons. Nothing is booked until we confirm availability on WhatsApp.</p>
        </div>
        <BookingIsland variant="quick" initialVehicleId={bike.id} />
      </section>

      <section className="lp-section lp-section-mist">
        <div className="lp-section-head">
          <span className="lp-kicker">Included &amp; extras</span>
          <h2>What comes with it</h2>
        </div>
        <div className="lp-why-grid">
          {EQUIPMENT.map(e => (
            <div key={e.id} className="lp-card lp-why">
              <span className="lp-why-icon"><LIcon name={e.icon} size={20} /></span>
              <div>
                <h3>{e.name} — {e.free ? 'free' : formatRupiah(e.price)}</h3>
                <p>{e.minDays ? `Available on rentals of ${e.minDays} days or more. Fitting included.` : e.info}</p>
              </div>
            </div>
          ))}
        </div>
        <span className="lp-hint">
          <LIcon name="info" size={15} /> Top box and surf rack can be added from {EQUIPMENT_MIN_DAYS} days.
        </span>
      </section>

      <section className="lp-section lp-section-white">
        <div className="lp-section-head">
          <span className="lp-kicker">Other models</span>
          <h2>Compare with the rest</h2>
        </div>
        <div className="lp-other-grid">
          {others.map(f => (
            <Link key={f.id} className="lp-other" href={`/scooters/${f.id}`}>
              <Image src={f.photo} alt="" width={320} height={210} sizes="30vw" loading="lazy" />
              <span>
                <strong>{f.name}</strong>
                <em>{formatRupiah(f.price.daily)} / day</em>
              </span>
              <LIcon name="arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

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
            <a href={wa} target="_blank" rel="noopener noreferrer">
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
          <Link href="/">Back to the home page</Link>
        </div>
      </footer>

      <a className="lp-float" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <LIcon name="wa" size={26} />
      </a>
    </div>
  );
}
