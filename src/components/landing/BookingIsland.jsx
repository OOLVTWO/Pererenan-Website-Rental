'use client';

/**
 * SATU-SATUNYA client component halaman publik.
 * - Bilah cek harga (beranda) atau kartu pesan (halaman detail motor). Motor
 *   (di beranda) & tanggal mulai kosong; harga tampil setelah semuanya dipilih.
 * - Sheet pemesanan 2 langkah (mockup "2-hp-sheet-booking").
 * - Lewat event delegation: chip filter armada [data-lp-filter] dan tombol
 *   [data-lp-book] di HTML statis (server component) ikut dijalankan di sini.
 * - Beranda: header menempel, penanda seksi aktif & laci menu (usePageChrome).
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { usePageChrome } from './usePageChrome';
import { ADDONS, BUSINESS, FLEET, TERMS, findScooter } from '@/lib/landing/config';
import {
  addonStates,
  buildBookingMessage,
  calcAddons,
  calcRental,
  formatDate,
  formatRange,
  formatRupiah,
  rentalDays,
  todayIso,
  updateDates,
  whatsappUrl,
} from '@/lib/landing/booking';

const noopSubscribe = () => () => {};

function openPicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* browser lama: fokus biasa sudah cukup */
  }
}

/**
 * Tombol lanjut ditekan tapi isian belum lengkap: buka isian pertama yang
 * masih kosong (daftar motor / pemilih tanggal) di dalam `box`.
 */
function openMissing(box, { scooter, pickUp, returnDate }) {
  const target = !scooter
    ? box?.querySelector('select[aria-label="Scooter"]')
    : !pickUp
      ? box?.querySelector('input[aria-label="Pick-up date"]')
      : !returnDate
        ? box?.querySelector('input[aria-label="Return date"]')
        : null;
  if (!target) return;
  target.focus({ preventScroll: true });
  try {
    target.showPicker?.();
  } catch {
    /* browser lama: fokus saja sudah cukup */
  }
}

function applyFilter(id) {
  document.querySelectorAll('[data-lp-filter]').forEach((chip) => {
    const on = chip.getAttribute('data-lp-filter') === id;
    chip.classList.toggle('is-on', on);
    chip.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('[data-lp-card]').forEach((card) => {
    card.hidden = !card.getAttribute('data-lp-card').split(' ').includes(id);
  });
}

/** Isian bilah cek harga: tampilan mockup + kontrol asli transparan di atasnya. */
function Field({ icon, label, value, placeholder, children }) {
  return (
    <label className="lp-field">
      <Icon name={icon} size="17" color="#1D4ED8" />
      <span className="lp-field-txt">
        <span className="lp-field-lb">{label}</span>
        <span className={value ? 'lp-field-val' : 'lp-field-val is-empty'}>
          {value || placeholder}
          <Icon name="chevron" size="16" color="#5B6474" />
        </span>
      </span>
      <Icon name="chevron" size="16" color="#5B6474" />
      {children}
    </label>
  );
}

function SheetField({ label, value, placeholder, children }) {
  return (
    <label className="lp-sel">
      <span className="lp-sel-lb">{label}</span>
      <span className={value ? 'lp-sel-box' : 'lp-sel-box is-empty'}>
        {value || placeholder}
        <Icon name="chevron" size="16" color="#5B6474" />
        {children}
      </span>
    </label>
  );
}

function Stepper({ label, value, min = 0, max, disabled = false, onChange }) {
  return (
    <span className="lp-stepper">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" size="15" color="#0F172A" />
      </button>
      <output aria-live="polite">{value ?? '–'}</output>
      <button
        type="button"
        aria-label={`More ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange((value ?? 0) + 1)}
      >
        <Icon name="plus" size="15" color="#0F172A" />
      </button>
    </span>
  );
}

function Notice() {
  return (
    <div className="lp-notice">
      <Icon name="info" size="19" color="#1D4ED8" />
      <span>
        <strong>This is a request, not an instant booking.</strong> We check that this scooter is free for your dates
        and reply on WhatsApp — usually within minutes during opening hours.
      </span>
    </div>
  );
}

function SheetHead({ title, subtitle, step, onBack, backLabel }) {
  return (
    <div className="lp-sheet-head">
      <button type="button" className="lp-back" onClick={onBack} aria-label={backLabel}>
        <Icon name="back" size="20" color="#0F172A" />
      </button>
      <span className="lp-sheet-title">
        <b id="lp-sheet-title">{title}</b>
        <span>{subtitle}</span>
      </span>
      <span className="lp-dots" aria-hidden="true">
        <i className={step === 1 ? 'is-on' : undefined}></i>
        <i className={step === 2 ? 'is-on' : undefined}></i>
      </span>
    </div>
  );
}

export default function BookingIsland({ variant = 'bar', scooterId: initialScooter = null }) {
  const today = useSyncExternalStore(noopSubscribe, todayIso, () => null);
  const [scooterId, setScooterId] = useState(initialScooter);
  const [dates, setDates] = useState({ pickUp: null, returnDate: null });
  const [addons, setAddons] = useState(() => Object.fromEntries(ADDONS.map((a) => [a.id, a.initial])));
  const [area, setArea] = useState(BUSINESS.areas[0]);
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [used, setUsed] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const router = useRouter();
  usePageChrome(variant === 'bar');

  // Belum ada yang dipilih: motor (di beranda) & tanggal kosong, harga belum dihitung.
  const scooter = findScooter(scooterId) ?? null;
  const { pickUp, returnDate } = dates;
  const days = pickUp && returnDate ? rentalDays(pickUp, returnDate) : null;
  const rental = scooter && days ? calcRental(scooter.price, days) : null;
  const extra = calcAddons(addons, days ?? 0);
  const total = rental ? rental.total + extra.total : null;
  const picked = { scooter, pickUp, returnDate };
  const hint = !scooter ? 'Choose a scooter & dates' : 'Choose your dates';

  const change = (patch) =>
    setDates((cur) => {
      const next = updateDates(cur, patch, today);
      return { pickUp: next.pickUp, returnDate: next.returnDate };
    });

  const openSheet = (trigger) => {
    triggerRef.current = trigger ?? null;
    setUsed(true);
    setStep(1);
    setOpen(true);
  };

  const closeSheet = () => {
    setOpen(false);
    triggerRef.current?.focus?.({ preventScroll: true });
  };

  // Chip filter & tombol "Book now"/"Book a scooter" di HTML statis.
  useEffect(() => {
    const onClick = (e) => {
      const book = e.target.closest?.('[data-lp-book]');
      if (book) {
        e.preventDefault();
        const id = book.getAttribute('data-lp-book');
        if (id && findScooter(id)) setScooterId(id);
        triggerRef.current = book;
        setUsed(true);
        setStep(1);
        setOpen(true);
        return;
      }
      const chip = e.target.closest?.('[data-lp-filter]');
      if (chip) applyFilter(chip.getAttribute('data-lp-filter'));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Sheet terbuka: kunci scroll halaman, fokus ke panel, Escape menutup.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus?.({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [step]);

  const changeScooter = () => {
    setOpen(false);
    const fleet = document.getElementById('fleet') || document.getElementById('models');
    if (fleet) requestAnimationFrame(() => fleet.scrollIntoView());
    else router.push('/#fleet');
  };

  const dateInputs = {
    pickUp: (
      <input
        type="date"
        className="lp-field-in"
        aria-label="Pick-up date"
        min={today ?? undefined}
        value={pickUp ?? ''}
        onClick={openPicker}
        onChange={(e) => e.target.value && change({ pickUp: e.target.value })}
      />
    ),
    returnDate: (
      <input
        type="date"
        className="lp-field-in"
        aria-label="Return date"
        min={pickUp ?? today ?? undefined}
        value={returnDate ?? ''}
        onClick={openPicker}
        onChange={(e) => e.target.value && change({ returnDate: e.target.value })}
      />
    ),
  };

  const summary = (
    <div className="lp-check-foot">
      <div className="lp-check-sumbox">
        <span className="lp-check-sum">
          <span className="lp-check-rate">{rental ? rental.label : hint}</span>
          <span className="lp-check-price">{rental ? formatRupiah(rental.total) : 'Rp —'}</span>
        </span>
        {rental && (
          <span className="lp-check-best">
            best
            <br />
            price
          </span>
        )}
      </div>
      <button
        type="button"
        className="lp-btn lp-check-go"
        aria-haspopup="dialog"
        onClick={(e) => (rental ? openSheet(e.currentTarget) : openMissing(e.currentTarget.closest('.lp-check'), picked))}
      >
        {variant === 'bar' ? (
          <>
            <span className="lp-mb">Continue on WhatsApp</span>
            <span className="lp-dk">Continue</span>
          </>
        ) : (
          'Book now'
        )}
        <Icon name="arrow" size="17" color="#fff" />
      </button>
    </div>
  );

  const states = addonStates(days);
  const qty = extra.qty;
  const waUrl = rental ? whatsappUrl(buildBookingMessage({ scooter, pickUp, returnDate, addons, area })) : '#';

  return (
    <>
      {variant === 'bar' ? (
        <section className="lp-check lp-bar" aria-label="Check price and availability">
          <div className="lp-check-title">
            <span className="lp-check-h">
              Check price<span className="lp-mb"> &amp; availability</span>
            </span>
            <span className="lp-check-sub">Weekly &amp; monthly rates applied automatically</span>
          </div>
          <Field icon="scooter" label="Scooter" value={scooter?.name} placeholder="Select scooter">
            <select
              className="lp-field-in"
              aria-label="Scooter"
              value={scooter ? scooterId : ''}
              onChange={(e) => setScooterId(e.target.value)}
            >
              <option value="" disabled>
                Select scooter
              </option>
              {FLEET.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field icon="calendar" label="Pick-up" value={formatDate(pickUp)} placeholder="Select date">
            {dateInputs.pickUp}
          </Field>
          <Field icon="calendar" label="Return" value={formatDate(returnDate)} placeholder="Select date">
            {dateInputs.returnDate}
          </Field>
          {summary}
        </section>
      ) : (
        <div className="lp-check lp-check-card" id="book">
          <div className="lp-check-title">
            <span className="lp-check-h">{`Book the ${scooter?.name ?? 'scooter'}`}</span>
          </div>
          <Field icon="calendar" label="Pick-up" value={formatDate(pickUp)} placeholder="Select date">
            {dateInputs.pickUp}
          </Field>
          <Field icon="calendar" label="Return" value={formatDate(returnDate)} placeholder="Select date">
            {dateInputs.returnDate}
          </Field>
          {summary}
        </div>
      )}

      <div className={open ? 'lp-sheet is-open' : 'lp-sheet'} id="booking">
        <div className="lp-sheet-veil" onClick={closeSheet}></div>
        <div
          ref={panelRef}
          className="lp-sheet-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lp-sheet-title"
          tabIndex={-1}
          onClick={(e) => e.target === e.currentTarget && closeSheet()}
        >
          {used && scooter && (
            <>
              {step === 1 || !rental ? (
                <section className="lp-sheet-card">
                  <SheetHead
                    title="Your booking"
                    subtitle="Step 1 of 2 · details"
                    step={1}
                    onBack={closeSheet}
                    backLabel="Close booking"
                  />
                  <Notice />
                  <div className="lp-sheet-body">
                    <div className="lp-bike">
                      <Image src={scooter.photo} alt="" width={92} height={80} unoptimized />
                      <span className="lp-bike-txt">
                        <b>{scooter.name}</b>
                        <span>{`${scooter.cc}cc · automatic`}</span>
                      </span>
                      <button type="button" className="lp-change" onClick={changeScooter}>
                        Change
                      </button>
                    </div>
                    <SheetField label="Pick-up date" value={formatDate(pickUp)} placeholder="Select date">
                      {dateInputs.pickUp}
                    </SheetField>
                    <SheetField label="Return date" value={formatDate(returnDate)} placeholder="Select date">
                      {dateInputs.returnDate}
                    </SheetField>
                    <div className="lp-sel">
                      <span className="lp-sel-lb">Rental length</span>
                      <span className={days ? 'lp-sel-box' : 'lp-sel-box is-empty'}>
                        {days ? (days === 1 ? '1 day' : `${days} days`) : 'Select dates'}
                        <Stepper
                          label="days"
                          value={days}
                          min={1}
                          max={365}
                          disabled={!pickUp}
                          onChange={(n) => change({ days: n })}
                        />
                      </span>
                    </div>
                    <SheetField label="Delivery area" value={area}>
                      <select className="lp-field-in" aria-label="Delivery area" value={area} onChange={(e) => setArea(e.target.value)}>
                        {BUSINESS.areas.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </SheetField>
                    <div className="lp-addons">
                      <span className="lp-addons-h">Add-ons</span>
                      {states.map((a) => (
                        <div key={a.id} className={a.locked ? 'lp-addon is-locked' : 'lp-addon'}>
                          <span className="lp-tile">
                            <Icon name={a.icon} size="18" color="#1D4ED8" />
                          </span>
                          <span className="lp-addon-txt">
                            <b>{a.name}</b>
                            <span>{a.note}</span>
                          </span>
                          <span className="lp-addon-side">
                            <span className="lp-addon-price">{a.price ? formatRupiah(a.price) : 'FREE'}</span>
                            {a.locked ? (
                              <span className="lp-addon-lock">{`From ${a.minDays} days`}</span>
                            ) : (
                              <Stepper
                                label={a.name}
                                value={qty[a.id]}
                                max={a.max}
                                onChange={(n) => setAddons((cur) => ({ ...cur, [a.id]: Math.max(0, Math.min(a.max, n)) }))}
                              />
                            )}
                          </span>
                        </div>
                      ))}
                      <span className="lp-addon-note">
                        <Icon name="clock" size="14" color="#1D4ED8" />{' '}
                        {`Top box and surf rack unlock from ${ADDONS[2].minDays} days.`}
                      </span>
                    </div>
                    <div className="lp-total">
                      <span className="lp-total-txt">
                        <span>{rental ? rental.label : hint}</span>
                        <b>{rental ? formatRupiah(total) : 'Rp —'}</b>
                      </span>
                      <Icon name="arrow" size="20" color="#1D4ED8" />
                    </div>
                    <button
                      type="button"
                      className="lp-btn lp-wide"
                      onClick={(e) =>
                        rental ? setStep(2) : openMissing(e.currentTarget.closest('.lp-sheet-card'), picked)
                      }
                    >
                      Review booking <Icon name="arrow" size="17" color="#fff" />
                    </button>
                  </div>
                </section>
              ) : (
                <section className="lp-sheet-card">
                  <SheetHead
                    title="Review & send"
                    subtitle="Step 2 of 2 · confirm"
                    step={2}
                    onBack={() => setStep(1)}
                    backLabel="Back to details"
                  />
                  <Notice />
                  <div className="lp-sheet-body is-review">
                    <div className="lp-row">
                      <span>Scooter</span>
                      <b>{scooter.name}</b>
                    </div>
                    <div className="lp-row">
                      <span>Dates</span>
                      <b>{pickUp && returnDate ? formatRange(pickUp, returnDate) : ''}</b>
                    </div>
                    <div className="lp-row">
                      <span>Duration</span>
                      <b>{days === 1 ? '1 day' : `${days} days`}</b>
                    </div>
                    <div className="lp-row">
                      <span>Rate</span>
                      <b>{rental.breakdown}</b>
                    </div>
                    <div className="lp-row">
                      <span>Helmets</span>
                      <b>{`${qty.helmet} · included`}</b>
                    </div>
                    {qty.raincoat > 0 && (
                      <div className="lp-row">
                        <span>Raincoat</span>
                        <b>{`${qty.raincoat} · included`}</b>
                      </div>
                    )}
                    {extra.lines
                      .filter((l) => !l.free)
                      .map((l) => (
                        <div key={l.id} className="lp-row">
                          <span>{l.name}</span>
                          <b>{formatRupiah(l.amount)}</b>
                        </div>
                      ))}
                    <div className="lp-row">
                      <span>Delivery</span>
                      <b>{`${area} · free`}</b>
                    </div>
                    <div className="lp-row-total">
                      <span>Total</span>
                      <b>{formatRupiah(total)}</b>
                    </div>
                    <div className="lp-terms">
                      <span className="lp-terms-head">
                        <b>Rental terms</b>
                        <span>scroll to read all</span>
                      </span>
                      <ol>
                        {TERMS.map((t, i) => (
                          <li key={t}>
                            <i>{String(i + 1).padStart(2, '0')}</i>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <label className="lp-agree">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                      <span>I have read and agree to the rental terms above.</span>
                    </label>
                    <a
                      className="lp-btn"
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!agreed}
                      onClick={(e) => !agreed && e.preventDefault()}
                    >
                      <Icon name="whatsapp" size="19" color="#fff" /> Send on WhatsApp
                    </a>
                    <span className="lp-paynote">No payment now. Pay on delivery.</span>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
