'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { BUSINESS, FLEET, MONTHLY_MIN_DAYS } from '@/lib/landing/config';
import {
  calcRental, calcEquipment, availableEquipment, daysBetween, addDays,
  formatRupiah, formatDateEn, buildWhatsAppMessage, whatsappUrl,
} from '@/lib/landing/booking';
import { LIcon } from '@/components/landing/LIcon';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function InfoDot({ text }) {
  return (
    <span className="lp-info" tabIndex={0} role="button" aria-label={text}>
      <LIcon name="info" size={15} />
      <span className="lp-info-bubble">{text}</span>
    </span>
  );
}

/**
 * Satu-satunya bagian interaktif halaman publik: kartu cek harga di hero,
 * tombol "Book now" di kartu motor, dan lembar ringkasan pesanan.
 * Semua sisanya dirender di server (tanpa JavaScript).
 */
export default function BookingIsland({ variant = 'quick' }) {
  const [vehicleId, setVehicleId] = useState(FLEET[0].id);
  const [startDate, setStartDate] = useState(todayStr());
  const [days, setDays] = useState(5);
  const [time, setTime] = useState('10:00');
  const [address, setAddress] = useState('');
  const [equipment, setEquipment] = useState({ helmet: 2, raincoat: 1 });
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);

  const vehicle = useMemo(() => FLEET.find(f => f.id === vehicleId) || FLEET[0], [vehicleId]);
  const endDate = useMemo(() => addDays(startDate, Math.max(1, days)), [startDate, days]);
  const rental = useMemo(() => calcRental(vehicle.price, days), [vehicle, days]);
  const eq = useMemo(() => calcEquipment(equipment, days), [equipment, days]);
  const equipmentList = useMemo(() => availableEquipment(days), [days]);
  const total = rental.total + eq.total;

  const openFor = useCallback((id) => {
    if (id) setVehicleId(id);
    setOpen(true);
  }, []);

  const setQty = (id, delta, max) => {
    setEquipment(prev => {
      const next = Math.min(max, Math.max(0, (Number(prev[id]) || 0) + delta));
      return { ...prev, [id]: next };
    });
  };

  const waHref = whatsappUrl(BUSINESS.phoneE164, buildWhatsAppMessage({
    vehicle, startDate, endDate, days, time, address,
    equipment: eq.lines, rental: rental.total, equipmentTotal: eq.total,
  }));

  // ── Kartu cek harga di hero ──
  if (variant === 'quick') {
    return (
      <>
        <div className="lp-card lp-quick">
          <div className="lp-quick-head">
            <h2>Check price &amp; availability</h2>
            <span>Takes 10 seconds. No account needed.</span>
          </div>

          <label className="lp-field">
            <span>Scooter</span>
            <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
              {FLEET.map(f => (
                <option key={f.id} value={f.id}>{f.name} — {formatRupiah(f.price.daily)} / day</option>
              ))}
            </select>
          </label>

          <div className="lp-field-row">
            <label className="lp-field">
              <span>Pick-up</span>
              <input type="date" value={startDate} min={todayStr()} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label className="lp-field lp-field-days">
              <span>Days</span>
              <input type="number" min="1" max="365" inputMode="numeric" value={days}
                onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))} />
            </label>
          </div>

          <div className="lp-estimate">
            <span>Estimated total</span>
            <strong>{formatRupiah(rental.total)}</strong>
          </div>

          <button type="button" className="lp-btn lp-btn-primary" onClick={() => openFor()}>
            Book now <LIcon name="arrow" size={18} />
          </button>
          <span className="lp-quick-note">You&apos;ll see a summary before anything is sent.</span>
        </div>

        {open && renderSheet()}
      </>
    );
  }

  // ── Tombol "Book now" pada kartu armada ──
  return (
    <>
      <div className="lp-fleet-grid">
        {FLEET.map(f => (
          <article key={f.id} className="lp-bike">
            <div className="lp-bike-photo">
              <Image src={f.photo} alt={f.name} width={640} height={420} sizes="(max-width: 700px) 80vw, 33vw" />
              {f.tag && <span className="lp-bike-tag">{f.tag}</span>}
            </div>
            <div className="lp-bike-body">
              <h3>{f.name}</h3>
              <div className="lp-bike-specs">
                <span><LIcon name="user" size={15} /> {f.riders}</span>
                <span><LIcon name="engine" size={15} /> {f.engine}</span>
              </div>
              <span className="lp-bike-spec-row">
                <LIcon name="box" size={15} /> {f.storage}
                <InfoDot text="What fits under the seat — helmets are included with every rental." />
              </span>
              <p>{f.blurb}</p>
              <div className="lp-bike-price">
                <strong>{formatRupiah(f.price.daily)}</strong><span>/ day</span>
              </div>
              <div className="lp-bike-rates">
                <span>{formatRupiah(f.price.weekly)} / week</span>
                <span>{formatRupiah(f.price.monthly)} / month</span>
              </div>
              <button type="button" className="lp-btn lp-btn-primary" onClick={() => openFor(f.id)}>
                Book now <LIcon name="arrow" size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {open && renderSheet()}
    </>
  );

  // ── Lembar ringkasan pesanan ──
  function renderSheet() {
    return (
      <div className="lp-sheet-overlay" role="dialog" aria-modal="true" aria-label="Your booking"
        onClick={() => setOpen(false)}>
        <div className="lp-sheet" onClick={e => e.stopPropagation()}>
          <header className="lp-sheet-head">
            <span>
              <strong>Your booking</strong>
              <em>Review the details, then send on WhatsApp</em>
            </span>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <LIcon name="x" size={18} />
            </button>
          </header>

          <div className="lp-sheet-body">
            <div className="lp-picked">
              <Image src={vehicle.photo} alt={vehicle.name} width={160} height={120} />
              <span>
                <strong>{vehicle.name}</strong>
                <em>{formatRupiah(vehicle.price.daily)} / day · {vehicle.engine}</em>
              </span>
              <button type="button" onClick={() => setPicking(v => !v)}>
                {picking ? 'Done' : 'Change'}
              </button>
            </div>

            {picking && (
              <div className="lp-picker">
                {FLEET.map(f => (
                  <button key={f.id} type="button"
                    className={f.id === vehicleId ? 'active' : ''}
                    onClick={() => { setVehicleId(f.id); setPicking(false); }}>
                    <span>{f.name}</span>
                    <em>{formatRupiah(f.price.daily)} / day</em>
                  </button>
                ))}
              </div>
            )}

            <section className="lp-sheet-section">
              <h4>Rental period</h4>
              <div className="lp-field-row">
                <label className="lp-field">
                  <span>Pick-up date</span>
                  <input type="date" value={startDate} min={todayStr()} onChange={e => setStartDate(e.target.value)} />
                </label>
                <label className="lp-field lp-field-days">
                  <span>Days</span>
                  <input type="number" min="1" max="365" inputMode="numeric" value={days}
                    onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))} />
                </label>
              </div>
              <span className="lp-hint">
                <LIcon name="clock" size={15} /> Return {formatDateEn(endDate)} · {days} day{days > 1 ? 's' : ''}
                {days >= 7 && ' · weekly rate applied'}
              </span>
            </section>

            <section className="lp-sheet-section">
              <h4>Delivery</h4>
              <div className="lp-field-row">
                <label className="lp-field">
                  <span>Villa or hotel name</span>
                  <input type="text" placeholder="e.g. Villa Bamboo, Pererenan"
                    value={address} onChange={e => setAddress(e.target.value)} />
                </label>
                <label className="lp-field lp-field-days">
                  <span>Time</span>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </label>
              </div>
              <span className="lp-hint">
                <LIcon name="truck" size={15} /> Free delivery in {BUSINESS.deliveryAreas.slice(0, 3).join(', ')}
              </span>
            </section>

            <section className="lp-sheet-section">
              <h4>Add-ons</h4>
              {equipmentList.map(item => {
                const qty = Number(equipment[item.id]) || 0;
                return (
                  <div key={item.id} className={`lp-addon${item.disabled ? ' disabled' : ''}`}>
                    <span className="lp-addon-icon"><LIcon name={item.icon} size={19} /></span>
                    <span className="lp-addon-text">
                      <span className="lp-addon-name">
                        {item.name}
                        <InfoDot text={item.info} />
                      </span>
                      <em>{item.note}</em>
                    </span>
                    <span className="lp-addon-right">
                      <strong>{item.free ? 'FREE' : formatRupiah(item.price)}</strong>
                      {item.disabled ? (
                        <span className="lp-addon-locked">Monthly only</span>
                      ) : (
                        <span className="lp-stepper">
                          <button type="button" aria-label={`Remove one ${item.name}`}
                            onClick={() => setQty(item.id, -1, item.max)} disabled={qty === 0}>
                            <LIcon name="minus" size={15} />
                          </button>
                          <span>{item.disabled ? 0 : qty}</span>
                          <button type="button" aria-label={`Add one ${item.name}`}
                            onClick={() => setQty(item.id, 1, item.max)} disabled={qty >= item.max}>
                            <LIcon name="plus" size={15} />
                          </button>
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
              {days < MONTHLY_MIN_DAYS && (
                <span className="lp-hint">
                  <LIcon name="info" size={15} /> Top box and surf rack unlock from {MONTHLY_MIN_DAYS} days.
                </span>
              )}
            </section>

            <div className="lp-total">
              {rental.lines.map(l => (
                <div key={l.label}><span>{l.label}</span><strong>{formatRupiah(l.amount)}</strong></div>
              ))}
              {eq.lines.map(l => (
                <div key={l.id}>
                  <span>{l.label}</span>
                  <strong className={l.free ? 'free' : ''}>{l.free ? 'FREE' : formatRupiah(l.amount)}</strong>
                </div>
              ))}
              <div className="lp-total-sum">
                <span>Estimated total</span><strong>{formatRupiah(total)}</strong>
              </div>
              <em>Paid on delivery — cash, bank transfer or QRIS.</em>
            </div>

            <div className="lp-notice">
              <LIcon name="info" size={19} />
              <span>
                <strong>This is a booking request, not a confirmation.</strong> We&apos;ll check that this
                scooter is free for your dates and reply on WhatsApp — usually within a few minutes
                during opening hours.
              </span>
            </div>
          </div>

          <footer className="lp-sheet-foot">
            <a className="lp-btn lp-btn-primary lp-btn-lg" href={waHref} target="_blank" rel="noopener noreferrer">
              <LIcon name="wa" size={19} /> Send booking request
            </a>
            <span>Opens WhatsApp with every detail above already written.</span>
          </footer>
        </div>
      </div>
    );
  }
}
