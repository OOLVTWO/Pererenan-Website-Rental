'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { BUSINESS, FLEET, MONTHLY_MIN_DAYS, TERMS } from '@/lib/landing/config';
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
  const [fleetFilter, setFleetFilter] = useState('all');
  const [step, setStep] = useState(1);      // 1 = isi data, 2 = ringkasan akhir
  const [agreed, setAgreed] = useState(false);

  const vehicle = useMemo(() => FLEET.find(f => f.id === vehicleId) || FLEET[0], [vehicleId]);
  const endDate = useMemo(() => addDays(startDate, Math.max(1, days)), [startDate, days]);
  const rental = useMemo(() => calcRental(vehicle.price, days), [vehicle, days]);
  const eq = useMemo(() => calcEquipment(equipment, days), [equipment, days]);
  const equipmentList = useMemo(() => availableEquipment(days), [days]);
  const total = rental.total + eq.total;

  const openFor = useCallback((id) => {
    if (id) setVehicleId(id);
    setStep(1);
    setAgreed(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => { setOpen(false); setPicking(false); }, []);

  /** Ubah tanggal kembali → jumlah hari ikut menyesuaikan (dan sebaliknya). */
  const setReturnDate = (value) => {
    const d = daysBetween(startDate, value);
    setDays(d);
  };

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

  // ── Bilah pemesanan mendatar yang menumpuk di bawah hero ──
  if (variant === 'bar') {
    return (
      <>
        <div className="lp-bar">
          <label className="lp-bar-field">
            <span>Scooter</span>
            <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
              {FLEET.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <label className="lp-bar-field">
            <span>Pick-up</span>
            <input type="date" value={startDate} min={todayStr()} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label className="lp-bar-field">
            <span>Return</span>
            <input type="date" value={endDate} min={startDate} onChange={e => setReturnDate(e.target.value)} />
          </label>
          <div className="lp-bar-total">
            <span>{days} day{days > 1 ? 's' : ''} · estimated</span>
            <strong>{formatRupiah(rental.total)}</strong>
          </div>
          <button type="button" className="lp-btn lp-btn-primary lp-bar-cta" onClick={() => openFor()}>
            Book now <LIcon name="arrow" size={18} />
          </button>
        </div>
        {open && renderSheet()}
      </>
    );
  }

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
            <label className="lp-field">
              <span>Return</span>
              <input type="date" value={endDate} min={startDate} onChange={e => setReturnDate(e.target.value)} />
            </label>
          </div>
          <span className="lp-hint">
            <LIcon name="clock" size={15} /> {days} day{days > 1 ? 's' : ''}
            {days >= 7 && ' · weekly rate applied'}
          </span>

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

  // ── Armada + tab filter ──
  const filters = [
    { key: 'all', label: 'All models', test: () => true },
    { key: 'budget', label: 'Under Rp 150k', test: f => f.price.daily < 150000 },
    { key: 'small', label: '110–125cc', test: f => /1[01][05]cc|125cc/.test(f.engine) },
    { key: 'big', label: '155cc & up', test: f => /15[05]cc|160cc/.test(f.engine) },
  ];
  const shown = FLEET.filter(filters.find(t => t.key === fleetFilter)?.test || (() => true));

  return (
    <>
      <div className="lp-fleet-tabs" role="tablist" aria-label="Filter scooters">
        {filters.map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={fleetFilter === t.key}
            className={`lp-tab${fleetFilter === t.key ? ' active' : ''}`}
            onClick={() => setFleetFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="lp-fleet-grid">
        {shown.map(f => (
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
        <article className="lp-bike-ask">
          <span className="lp-bike-ask-icon"><LIcon name="wa" size={20} /></span>
          <h3>Not sure which one?</h3>
          <p>Tell us where you are going and how long. We pick the right scooter.</p>
          <a className="lp-btn" href={`https://wa.me/${BUSINESS.phoneE164}`} target="_blank" rel="noopener noreferrer">
            <LIcon name="wa" size={16} /> Ask us
          </a>
        </article>
      </div>

      {open && renderSheet()}
    </>
  );

  // ── Lembar pesanan: langkah 1 (isi data) → langkah 2 (ringkasan akhir) ──
  function renderSheet() {
    const stepBar = (
      <div className="lp-steps-bar" aria-label={`Step ${step} of 2`}>
        <span className={step === 1 ? 'active' : 'done'}>
          <span className="num">{step > 1 ? <LIcon name="check" size={14} /> : '1'}</span> Details
        </span>
        <span className="bar" />
        <span className={step === 2 ? 'active' : ''}>
          <span className="num">2</span> Review &amp; send
        </span>
      </div>
    );

    return (
      <div className="lp-sheet-overlay" role="dialog" aria-modal="true" aria-label="Your booking" onClick={close}>
        <div className="lp-sheet" onClick={e => e.stopPropagation()}>
          <header className="lp-sheet-head">
            <span>
              <strong>{step === 1 ? 'Your booking' : 'Check before sending'}</strong>
              <em>{step === 1 ? 'Choose dates, delivery and add-ons' : 'Nothing is booked until we confirm'}</em>
            </span>
            <button type="button" aria-label="Close" onClick={close}><LIcon name="x" size={18} /></button>
          </header>

          {stepBar}

          {step === 1 ? (
            <>
              <div className="lp-sheet-body">
                <div className="lp-picked">
                  <Image src={vehicle.photo} alt={vehicle.name} width={160} height={120} />
                  <span>
                    <strong>{vehicle.name}</strong>
                    <em>{formatRupiah(vehicle.price.daily)} / day · {vehicle.engine}</em>
                  </span>
                  <button type="button" onClick={() => setPicking(v => !v)}>{picking ? 'Done' : 'Change'}</button>
                </div>

                {picking && (
                  <div className="lp-picker">
                    {FLEET.map(f => (
                      <button key={f.id} type="button" className={f.id === vehicleId ? 'active' : ''}
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
                    <label className="lp-field">
                      <span>Return date</span>
                      <input type="date" value={endDate} min={startDate} onChange={e => setReturnDate(e.target.value)} />
                    </label>
                  </div>
                  <div className="lp-field-row">
                    <label className="lp-field lp-field-days">
                      <span>Days</span>
                      <input type="number" min="1" max="365" inputMode="numeric" value={days}
                        onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))} />
                    </label>
                    <span className="lp-hint" style={{ alignSelf: 'flex-end', paddingBottom: '14px' }}>
                      <LIcon name="clock" size={15} /> Back on {formatDateEn(endDate)}
                      {days >= 7 && ' · weekly rate applied'}
                    </span>
                  </div>
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
                          <span className="lp-addon-name">{item.name}<InfoDot text={item.info} /></span>
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
                              <span>{qty}</span>
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

                <div className="lp-estimate">
                  <span>Estimated total</span>
                  <strong>{formatRupiah(total)}</strong>
                </div>
              </div>

              <footer className="lp-sheet-foot">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => setStep(2)}>
                  Review booking <LIcon name="arrow" size={18} />
                </button>
                <span>Next: a final summary before anything is sent.</span>
              </footer>
            </>
          ) : (
            <>
              <div className="lp-sheet-body">
                <div className="lp-picked">
                  <Image src={vehicle.photo} alt={vehicle.name} width={160} height={120} />
                  <span>
                    <strong>{vehicle.name}</strong>
                    <em>{vehicle.engine} · {vehicle.riders}</em>
                  </span>
                </div>

                <div className="lp-recap">
                  <span className="lp-recap-title">Rental</span>
                  <div className="lp-recap-row"><span>Pick-up</span><strong>{formatDateEn(startDate)} · {time}</strong></div>
                  <div className="lp-recap-row"><span>Return</span><strong>{formatDateEn(endDate)}</strong></div>
                  <div className="lp-recap-row"><span>Duration</span><strong>{days} day{days > 1 ? 's' : ''}</strong></div>
                  <div className="lp-recap-row"><span>Delivery to</span><strong>{address || 'To be confirmed on WhatsApp'}</strong></div>
                </div>

                <div className="lp-recap">
                  <span className="lp-recap-title">Add-ons</span>
                  {eq.lines.length ? eq.lines.map(l => (
                    <div key={l.id} className="lp-recap-row">
                      <span>{l.label}</span>
                      <strong>{l.free ? 'FREE' : formatRupiah(l.amount)}</strong>
                    </div>
                  )) : <div className="lp-recap-row"><span>None selected</span><strong>—</strong></div>}
                </div>

                <div className="lp-total">
                  {rental.lines.map(l => (
                    <div key={l.label}><span>{l.label}</span><strong>{formatRupiah(l.amount)}</strong></div>
                  ))}
                  {eq.total > 0 && (
                    <div><span>Add-ons</span><strong>{formatRupiah(eq.total)}</strong></div>
                  )}
                  <div className="lp-total-sum"><span>Estimated total</span><strong>{formatRupiah(total)}</strong></div>
                  <em>Paid on delivery — cash, bank transfer or QRIS.</em>
                </div>

                <details className="lp-terms">
                  <summary>Rental terms &amp; conditions <LIcon name="down" size={18} /></summary>
                  <ol>{TERMS.map(t => <li key={t}>{t}</li>)}</ol>
                </details>

                <label className="lp-agree">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                  <span>I have read and agree to the rental terms &amp; conditions above.</span>
                </label>

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
                <div className="lp-foot-row">
                  <button type="button" className="lp-btn lp-btn-back" onClick={() => setStep(1)}>Back</button>
                  {agreed ? (
                    <a className="lp-btn lp-btn-primary lp-btn-lg" href={waHref} target="_blank" rel="noopener noreferrer">
                      <LIcon name="wa" size={19} /> Send request
                    </a>
                  ) : (
                    <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" disabled>
                      <LIcon name="wa" size={19} /> Send request
                    </button>
                  )}
                </div>
                <span>{agreed ? 'Opens WhatsApp with every detail already written.' : 'Please accept the terms to continue.'}</span>
              </footer>
            </>
          )}
        </div>
      </div>
    );
  }
}
