import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './Icon';
import { BENEFITS, FLEET, FLEET_FILTERS, PAID_ADDON_MIN_DAYS, matchesFilter } from '@/lib/landing/config';
import { formatK, formatShort, whatsappUrl } from '@/lib/landing/booking';

/** Strip kepercayaan 4 poin (di bawah kartu cek harga). */
export function Trust() {
  return (
    <section className="lp-trust" aria-label="Why guests pick us">
      {BENEFITS.map((b) => (
        <div key={b.title} className="lp-trust-item">
          <span className="lp-tile">
            <Icon name={b.icon} size="19" color="#1D4ED8" />
          </span>
          <span className="lp-trust-txt">
            <b>{b.title}</b>
            <span>{b.text}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

export function ScooterCard({ scooter, priority = false }) {
  const tags = FLEET_FILTERS.filter((f) => matchesFilter(scooter, f.id))
    .map((f) => f.id)
    .join(' ');
  return (
    <article className="lp-card" data-lp-card={tags}>
      <div className="lp-card-media">
        <Image
          src={scooter.photo}
          alt={scooter.name}
          width={800}
          height={520}
          unoptimized
          loading={priority ? 'eager' : 'lazy'}
        />
        {scooter.badge && <span className="lp-badge">{scooter.badge}</span>}
        <span className="lp-cc">{`${scooter.cc}cc`}</span>
      </div>
      <div className="lp-card-body">
        <h3>{scooter.name}</h3>
        <span className="lp-tags">
          <span>automatic</span>
          <span>2 riders</span>
        </span>
        <span className="lp-card-price">
          <span className="lp-from">
            <span>From</span>
            <b>
              {formatK(scooter.price.daily)}
              <span> /day</span>
            </b>
          </span>
          <span className="lp-week">
            week
            <br />
            <strong>{formatShort(scooter.price.weekly)}</strong>
          </span>
        </span>
        <span className="lp-card-actions">
          <Link className="lp-btn-soft is-white" href={`/scooters/${scooter.id}`}>
            Details
          </Link>
          <button type="button" className="lp-btn-soft" data-lp-book={scooter.id}>
            Book now <Icon name="arrow" size="15" color="#1E40AF" />
          </button>
        </span>
      </div>
    </article>
  );
}

/** Armada: 7 motor + kartu "Not sure which one?". Filter & "Book now" dijalankan BookingIsland. */
export default function Fleet() {
  return (
    <section className="lp-fleet" id="fleet">
      <div className="lp-fleet-head">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">The fleet</span>
          <h2 className="lp-h2">
            Seven models,
            <br className="lp-mb" /> 39 scooters ready.
          </h2>
        </div>
        <div className="lp-chips" role="group" aria-label="Filter scooters">
          {FLEET_FILTERS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className={i === 0 ? 'lp-chip is-on' : 'lp-chip'}
              data-lp-filter={f.id}
              aria-pressed={i === 0}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lp-grid">
        {FLEET.map((s) => (
          <ScooterCard key={s.id} scooter={s} />
        ))}
        <article className="lp-ask">
          <span className="lp-tile">
            <Icon name="chat" size="20" color="#1D4ED8" />
          </span>
          <h3>Not sure which one?</h3>
          <p>Tell us where you are going and how long. We pick the right scooter.</p>
          <a
            className="lp-btn-soft is-white"
            href={whatsappUrl("Hi Boss Rent! I'm not sure which scooter to pick. Can you help?")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size="15" color="#1E40AF" /> Ask us
          </a>
        </article>
      </div>
      <p className="lp-note lp-mb">
        {`Weekly and monthly rates are already discounted and applied automatically. Top box and surf rack: Rp 350.000 each, on rentals of ${PAID_ADDON_MIN_DAYS} days or more, fitting included.`}
      </p>
    </section>
  );
}
