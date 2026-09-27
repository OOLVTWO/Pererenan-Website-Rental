import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/landing/Icon';
import { Brand } from '@/components/landing/Hero';
import BookingIsland from '@/components/landing/BookingIsland';
import Footer from '@/components/landing/Footer';
import { ADDONS, BUSINESS, FLEET, MONTH_DAYS, WEEK_DAYS, findScooter } from '@/lib/landing/config';
import { formatK, formatRupiah, saving } from '@/lib/landing/booking';

/** Tujuh halaman motor dibuat statis saat build; id lain = 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return FLEET.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const s = findScooter(id);
  if (!s) return {};
  const title = `${s.name} rental in Pererenan & Canggu — ${BUSINESS.name}`;
  const description = `Rent the ${s.name} (${s.cc}cc automatic) from ${formatRupiah(s.price.daily)} a day, ${formatRupiah(
    s.price.weekly,
  )} a week or ${formatRupiah(s.price.monthly)} a month. Free delivery in Canggu, Berawa and Pererenan, two helmets and a raincoat included.`;
  return {
    title,
    description,
    alternates: { canonical: `/scooters/${s.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `/scooters/${s.id}`,
      siteName: BUSINESS.name,
      type: 'website',
      images: [{ url: s.photo, width: 800, height: 520, alt: s.name }],
    },
  };
}

export default async function ScooterPage({ params }) {
  const { id } = await params;
  const s = findScooter(id);
  if (!s) notFound();

  const rates = [
    { label: 'Daily', price: s.price.daily, per: '/ day', note: 'Up to 6 days' },
    { label: 'Weekly', price: s.price.weekly, per: `/ ${WEEK_DAYS} days`, save: saving(s.price, WEEK_DAYS, s.price.weekly) },
    { label: 'Monthly', price: s.price.monthly, per: `/ ${MONTH_DAYS} days`, save: saving(s.price, MONTH_DAYS, s.price.monthly) },
  ];
  const specs = [
    { icon: 'scooter', text: `${s.cc}cc · automatic` },
    { icon: 'users', text: '2 riders' },
    { icon: 'box', text: s.storage },
    { icon: 'helmet', text: '2 helmets + raincoat' },
  ];
  const others = FLEET.filter((o) => o.id !== s.id);

  return (
    <div className="lp">
      <header className="lp-sub">
        <Brand />
        <Link className="lp-sub-back" href="/#fleet">
          <Icon name="arrow" size="16" color="#0F172A" /> All scooters
        </Link>
      </header>

      <section className="lp-detail">
        <div className="lp-detail-media">
          <Image src={s.photo} alt={s.name} width={800} height={520} unoptimized priority />
          {s.badge && <span className="lp-badge">{s.badge}</span>}
        </div>
        <div className="lp-detail-main">
          <span className="lp-eyebrow">{`${s.cc}cc · automatic`}</span>
          <h1>{s.name}</h1>
          <p className="lp-detail-desc">{s.description}</p>
          <ul className="lp-specs">
            {specs.map((sp) => (
              <li key={sp.text}>
                <span className="lp-tile">
                  <Icon name={sp.icon} size="17" color="#1D4ED8" />
                </span>
                {sp.text}
              </li>
            ))}
          </ul>
          <div className="lp-rates" aria-label="Rates">
            {rates.map((r) => (
              <div key={r.label} className="lp-rate">
                <span>{r.label}</span>
                <b>{formatRupiah(r.price)}</b>
                <small>{r.per}</small>
                {r.save > 0 ? <em>{`Save ${formatRupiah(r.save)}`}</em> : <small>{r.note ?? 'Best for short stays'}</small>}
              </div>
            ))}
          </div>
          <BookingIsland variant="card" scooterId={s.id} />
        </div>
      </section>

      <section className="lp-kit">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">Included &amp; extras</span>
          <h2 className="lp-h2">What comes with the bike.</h2>
        </div>
        <div className="lp-kit-list">
          {ADDONS.map((a) => (
            <div key={a.id} className="lp-kit-item">
              <span className="lp-tile">
                <Icon name={a.icon} size="19" color="#1D4ED8" />
              </span>
              <span className="lp-why-txt">
                <b>{a.max > 1 ? `${a.max} × ${a.name.toLowerCase()}` : a.name}</b>
                <span>{a.note}</span>
              </span>
              <span className="lp-kit-price">
                {a.price ? formatRupiah(a.price) : 'FREE'}
                {a.minDays ? (
                  <>
                    <br />
                    <span className="lp-addon-lock">{`From ${a.minDays} days`}</span>
                  </>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-others" id="models">
        <div className="lp-sec-title">
          <span className="lp-eyebrow">The fleet</span>
          <h2 className="lp-h2">Other scooters.</h2>
        </div>
        <div className="lp-others-grid">
          {others.map((o) => (
            <Link key={o.id} className="lp-other" href={`/scooters/${o.id}`}>
              <Image src={o.photo} alt={o.name} width={800} height={520} unoptimized loading="lazy" />
              <b>{o.name}</b>
              <span>{`From ${formatK(o.price.daily)} /day`}</span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
