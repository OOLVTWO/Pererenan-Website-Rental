import Image from 'next/image';
import { Icon, Stars } from './Icon';
import { BENEFITS, FAQ, IMAGES, PAID_ADDON_MIN_DAYS, REVIEWS, STEPS } from '@/lib/landing/config';
import { whatsappUrl } from '@/lib/landing/booking';

/** Cara sewa 3 langkah + strip Extras. */
export function HowItWorks() {
  return (
    <section className="lp-how" id="how-it-works">
      <div className="lp-sec-head">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">How it works</span>
          <h2 className="lp-h2">Three steps, no counter queue.</h2>
        </div>
        <p className="lp-sec-lead">
          Everything runs over WhatsApp. No account to create, no card to enter, no deposit for daily and weekly
          rentals.
        </p>
      </div>
      <ol className="lp-steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className="lp-step">
            <span className="lp-step-rail">
              <span className="lp-step-num">{i + 1}</span>
              {i < STEPS.length - 1 && <span className="lp-step-line"></span>}
            </span>
            <span className="lp-step-body">
              <b>{s.title}</b>
              <span>{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="lp-extras">
        <b>Extras</b>
        <i></i>
        <span>
          Top box <strong>Rp 350.000</strong>
        </span>
        <span>
          Surf rack <strong>Rp 350.000</strong>
        </span>
        <small>{`Rentals of ${PAID_ADDON_MIN_DAYS} days or more · fitting included`}</small>
        <small>Helmets &amp; raincoat always free</small>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section className="lp-why">
      <div className="lp-why-card">
        <div className="lp-why-main">
          <div className="lp-sec-title">
            <span className="lp-eyebrow">Why us</span>
            <h2 className="lp-h2">Rental without the usual traps.</h2>
          </div>
          <div className="lp-why-list">
            {BENEFITS.map((b) => (
              <div key={b.title} className="lp-why-item">
                <span className="lp-tile">
                  <Icon name={b.icon} size="19" color="#1D4ED8" />
                </span>
                <span className="lp-why-txt">
                  <b>{b.title}</b>
                  <span>{b.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <Image
          className="lp-why-photo"
          src={IMAGES.why}
          alt="Two riders on a white scooter on a road through the rice fields in Bali"
          width={1100}
          height={614}
          unoptimized
          loading="lazy"
        />
      </div>
      <p className="lp-note lp-mb">Every bike is on a monthly service log, and the same team answers your messages.</p>
    </section>
  );
}

export function Reviews() {
  if (!REVIEWS.show) return null;
  return (
    <section className="lp-reviews" id="reviews">
      <div className="lp-reviews-head">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">Guests</span>
          <h2 className="lp-h2">What renters say.</h2>
        </div>
      </div>
      <div className="lp-rev-grid">
        {REVIEWS.items.map((r) => (
          <figure key={r.name} className="lp-rev">
            <Stars />
            <p>{r.text}</p>
            <figcaption>
              <span className="lp-avatar">{r.initial}</span>
              <span className="lp-rev-who">
                <span>{r.name}</span>{' '}
                <span className="lp-rev-from">
                  <span className="lp-mb">· </span>
                  {r.country}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** FAQ: HP pakai <details> native (tanpa JavaScript), ≥720px kartu terbuka seperti mockup desktop. */
export function Faq() {
  return (
    <section className="lp-faq" id="faq">
      <div className="lp-sec-head">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">FAQ</span>
          <h2 className="lp-h2">
            Good to know<span className="lp-dk"> before you book</span>.
          </h2>
        </div>
        <p className="lp-sec-lead">Everything runs over WhatsApp, and we answer in English and Bahasa Indonesia.</p>
      </div>
      <div className="lp-faq-list">
        {FAQ.map((f, i) => (
          <details key={f.q} className="lp-qa" name="lp-faq" open={i === 0}>
            <summary>
              <span>{f.q}</span>
              <Icon name="plus" size="18" color="#1D4ED8" className="lp-plus" />
              <Icon name="minus" size="18" color="#1D4ED8" className="lp-minus" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="lp-faq-grid">
        {FAQ.map((f, i) => (
          <div key={f.q} className="lp-faq-card">
            <span className="lp-faq-q">
              <i>{i + 1}</i>
              <span>{f.q}</span>
            </span>
            <span className="lp-faq-a">{f.a}</span>
          </div>
        ))}
        <div className="lp-faq-ask">
          <span className="lp-tile">
            <Icon name="chat" size="20" color="#1D4ED8" />
          </span>
          <b>Still have a question?</b>
          <p>Send it over and we reply with a straight answer, usually within minutes.</p>
          <a
            className="lp-btn-soft is-white"
            href={whatsappUrl('Hi Boss Rent! I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size="16" color="#1E40AF" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
