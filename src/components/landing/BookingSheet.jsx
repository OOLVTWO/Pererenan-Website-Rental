'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { PhotoPlaceholder } from './ui';
import { BOOKING, TERMS, bookingMessage, bookingTotal, scooterMeta, whatsappUrl } from '@/lib/landing/content';

/*
 * Sheet booking 2 langkah — kartu disalin dari "2-hp-sheet-booking.html".
 * Wadahnya (overlay, posisi bawah/tengah, animasi geser) tidak ada di
 * referensi, jadi dibuat seminimal mungkin: kartu tetap berada di dalam
 * padding 16px seperti papan referensi, dan di desktop lebar papannya 390px.
 */

const PRIMARY_BTN =
  'inline-flex items-center gap-[10px] min-h-[56px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold';

function SheetHeader({ id, title, subtitle, step }) {
  return (
    <div className="p-[16px_18px] border-b border-[#E4E9F0] flex items-center justify-between">
      <span className="flex flex-col gap-[3px]">
        <span id={id} className="font-display text-[17px] font-bold">{title}</span>
        <span className="text-[12.5px] text-[#5B6474]">{subtitle}</span>
      </span>
      <span className="flex gap-[5px]">
        {step === 1 ? (
          <>
            <span className="w-[22px] h-[4px] rounded-[99px] bg-[#1D4ED8]"></span>
            <span className="w-[10px] h-[4px] rounded-[99px] bg-[#D6E2FF]"></span>
          </>
        ) : (
          <>
            <span className="w-[10px] h-[4px] rounded-[99px] bg-[#D6E2FF]"></span>
            <span className="w-[22px] h-[4px] rounded-[99px] bg-[#1D4ED8]"></span>
          </>
        )}
      </span>
    </div>
  );
}

function RequestNotice() {
  return (
    <div className="flex gap-[11px] p-[12px_18px] bg-[#EEF3FF] border-b border-[#D6E2FF]">
      <Icon name="info" size="19" color="#1D4ED8" />
      <span className="text-[12.5px] leading-[1.6] text-[#475569]">
        <strong className="text-[#0F172A]">This is a request, not an instant booking.</strong> We check that this
        scooter is free for your dates and reply on WhatsApp — usually within minutes during opening hours.
      </span>
    </div>
  );
}

function SelectField({ label, value }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[12.5px] font-bold text-[#475569]">{label}</span>
      <span className="flex items-center justify-between gap-[10px] min-h-[50px] p-[0_14px] border border-[#E4E9F0] rounded-[12px] text-[15px] font-semibold">
        {value}
        <Icon name="chevron" size="16" color="#5B6474" />
      </span>
    </label>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  const box =
    'btn-reset w-[34px] h-[34px] rounded-[9px] border border-[#E4E9F0] inline-flex items-center justify-center';
  return (
    <span className="inline-flex items-center gap-[4px]">
      <button
        type="button"
        className={box}
        aria-label={`Fewer ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="minus" size="15" color="#0F172A" />
      </button>
      <span className="min-w-[22px] text-center text-[14px] font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={box}
        aria-label={`More ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="plus" size="15" color="#0F172A" />
      </button>
    </span>
  );
}

function AddOn({ icon, title, text, disabled, children }) {
  return (
    <div className={`flex items-center gap-[11px]${disabled ? ' opacity-[0.55]' : ''}`}>
      <span className="w-[36px] h-[36px] shrink-0 rounded-[10px] bg-[#EEF3FF] text-[#1D4ED8] flex items-center justify-center">
        <Icon name={icon} size="18" color="#1D4ED8" />
      </span>
      <span className="flex flex-col gap-[2px] grow min-w-0">
        <span className="text-[14px] font-bold">{title}</span>
        <span className="text-[11.5px] text-[#5B6474]">{text}</span>
      </span>
      <span className="flex flex-col items-end gap-[6px]">{children}</span>
    </div>
  );
}

function StepDetails({ scooter, helmets, raincoats, setHelmets, setRaincoats, onChangeScooter, onReview }) {
  return (
    <section className="rounded-[20px] bg-white border border-[#E4E9F0] overflow-hidden">
      <SheetHeader id="booking-title" title="Your booking" subtitle="Step 1 of 2 · details" step={1} />
      <RequestNotice />
      <div className="p-[16px_18px] flex flex-col gap-[14px]">
        <div className="flex items-center gap-[12px] p-[12px] rounded-[14px] bg-[#EEF3FF]">
          <span className="w-[46px] shrink-0">
            <PhotoPlaceholder className="h-[40px] rounded-[8px] bg-[#FFFFFF]" label="bike" />
          </span>
          <span className="flex flex-col grow">
            <span className="text-[14.5px] font-bold">{scooter.name}</span>
            <span className="text-[12.5px] text-[#1E40AF]">{scooterMeta(scooter)}</span>
          </span>
          <a
            href="#fleet"
            onClick={onChangeScooter}
            className="min-h-[40px] p-[0_13px] inline-flex items-center rounded-[10px] bg-white border border-[#D6E2FF] text-[13px] font-bold text-[#1E40AF]"
          >
            Change
          </a>
        </div>
        <SelectField label="Pick-up date" value={BOOKING.pickUp} />
        <SelectField label="Return date" value={BOOKING.return} />
        <SelectField label="Delivery area" value={BOOKING.area} />
        <div className="flex flex-col gap-[10px] p-[14px] border border-[#E4E9F0] rounded-[14px]">
          <span className="text-[12.5px] font-extrabold tracking-[1.2px] uppercase text-[#1D4ED8]">Add-ons</span>
          <AddOn icon="helmet" title="Helmet" text="Included with every rental">
            <span className="text-[12px] font-extrabold text-[#1E40AF]">FREE</span>
            <Stepper label="helmets" value={helmets} min={1} max={2} onChange={setHelmets} />
          </AddOn>
          <AddOn icon="shield" title="Raincoat" text="Bali rain comes fast">
            <span className="text-[12px] font-extrabold text-[#1E40AF]">FREE</span>
            <Stepper label="raincoats" value={raincoats} min={0} max={2} onChange={setRaincoats} />
          </AddOn>
          <AddOn icon="scooter" title="Top box (Shad)" text="Lockable · fitting included" disabled>
            <span className="text-[12px] font-extrabold text-[#1E40AF]">Rp 350.000</span>
            <span className="text-[11px] text-[#5B6474]">Monthly only</span>
          </AddOn>
          <AddOn icon="scooter" title="Surf rack" text="Carries one board" disabled>
            <span className="text-[12px] font-extrabold text-[#1E40AF]">Rp 350.000</span>
            <span className="text-[11px] text-[#5B6474]">Monthly only</span>
          </AddOn>
          <span className="flex items-center gap-[7px] text-[11.5px] leading-[1.55] text-[#5B6474]">
            <Icon name="clock" size="14" color="#1D4ED8" /> Top box and surf rack unlock from 28 days.
          </span>
        </div>
        <div className="flex items-center justify-between gap-[12px] p-[14px] rounded-[14px] bg-[#EEF3FF]">
          <span className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-bold text-[#1E40AF]">5 days · weekly rate applied</span>
            <span className="font-display text-[24px] font-bold">{bookingTotal(scooter)}</span>
          </span>
          <Icon name="arrow" size="20" color="#1D4ED8" />
        </div>
        <a
          href="#review"
          onClick={onReview}
          className={`${PRIMARY_BTN} p-[0_22px] box-border w-full justify-center`}
        >
          Review booking <Icon name="arrow" size="17" color="#fff" />
        </a>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-[12px] pb-[10px] border-b border-[#E4E9F0]">
      <span className="text-[13px] text-[#5B6474]">{label}</span>
      <span className="text-[14px] font-semibold text-right">{value}</span>
    </div>
  );
}

function StepReview({ scooter, helmets, raincoats, agreed, setAgreed }) {
  const waUrl = whatsappUrl(bookingMessage({ scooter, helmets, raincoats }));
  return (
    <section className="rounded-[20px] bg-white border border-[#E4E9F0] overflow-hidden">
      <SheetHeader id="booking-title" title="Review & send" subtitle="Step 2 of 2 · confirm" step={2} />
      <RequestNotice />
      <div className="p-[16px_18px] flex flex-col gap-[12px]">
        <SummaryRow label="Scooter" value={scooter.name} />
        <SummaryRow label="Dates" value={BOOKING.dates} />
        <SummaryRow label="Duration" value={BOOKING.duration} />
        <SummaryRow label="Rate" value={BOOKING.rate} />
        <SummaryRow label="Helmets" value={`${helmets} · included`} />
        <SummaryRow label="Delivery" value={`${BOOKING.area} · free`} />
        <div className="flex items-baseline justify-between gap-[12px] p-[4px_0_2px]">
          <span className="text-[14px] font-bold">Total</span>
          <span className="font-display text-[26px] font-bold">{bookingTotal(scooter)}</span>
        </div>
        <div className="flex flex-col gap-[8px] pt-[6px]">
          <span className="flex items-center justify-between gap-[10px]">
            <span className="text-[13px] font-bold">Rental terms</span>
            <span className="text-[11.5px] text-[#5B6474]">scroll to read all</span>
          </span>
          <div className="max-h-[210px] overflow-y-auto border border-[#E4E9F0] rounded-[12px] bg-[#F6F8FB] p-[14px] flex flex-col gap-[10px]">
            {TERMS.map((term, i) => (
              <span key={i} className="flex gap-[9px]">
                <span className="text-[11px] font-bold text-[#1D4ED8] pt-[2px]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[12.5px] leading-[1.6] text-[#475569]">{term}</span>
              </span>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-[10px] p-[12px] rounded-[12px] border border-[#D6E2FF] bg-[#EEF3FF]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-[20px] h-[20px] m-0 accent-[#1D4ED8] shrink-0"
          />
          <span className="text-[12.5px] leading-[1.6] text-[#0F172A] font-semibold">
            I have read and agree to the rental terms above.
          </span>
        </label>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!agreed}
          onClick={(e) => {
            if (!agreed) e.preventDefault();
          }}
          className={`${PRIMARY_BTN} justify-center${agreed ? '' : ' opacity-[0.55]'}`}
        >
          <Icon name="whatsapp" size="19" color="#fff" /> Send on WhatsApp
        </a>
        <span className="text-[12px] text-center text-[#5B6474]">No payment now. Pay on delivery.</span>
      </div>
    </section>
  );
}

export default function BookingSheet({ open, step, scooter, onStepChange, onClose }) {
  const panelRef = useRef(null);
  const [helmets, setHelmets] = useState(2);
  const [raincoats, setRaincoats] = useState(1);
  const [agreed, setAgreed] = useState(true);

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [step]);

  const changeScooter = (e) => {
    e.preventDefault();
    onClose();
    // Pindah ke section armada yang sedang terlihat (HP atau desktop).
    requestAnimationFrame(() => {
      const fleet = [...document.querySelectorAll('[data-fleet]')].find((el) => el.offsetParent !== null);
      fleet?.scrollIntoView();
    });
  };

  return (
    <div
      id="booking"
      className={`fixed inset-0 z-[50] ${open ? 'visible' : 'invisible'}`}
      style={{ transition: open ? 'visibility 0s' : 'visibility 0s 200ms' }}
    >
      <div
        className={`sheet-anim absolute inset-0 bg-[rgba(7,17,36,0.5)] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        tabIndex={-1}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className={`sheet-anim absolute inset-x-0 bottom-0 max-h-[100dvh] overflow-y-auto p-[16px] outline-none transition-[translate,opacity] duration-200 ease-out lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:w-[390px] lg:box-border lg:-translate-x-1/2 lg:-translate-y-1/2 ${open ? 'translate-y-0 lg:opacity-100' : 'translate-y-full lg:opacity-0'}`}
      >
        <button type="button" className="sr-only" onClick={onClose}>
          Close
        </button>
        {step === 1 ? (
          <StepDetails
            scooter={scooter}
            helmets={helmets}
            raincoats={raincoats}
            setHelmets={setHelmets}
            setRaincoats={setRaincoats}
            onChangeScooter={changeScooter}
            onReview={(e) => {
              e.preventDefault();
              onStepChange(2);
            }}
          />
        ) : (
          <StepReview scooter={scooter} helmets={helmets} raincoats={raincoats} agreed={agreed} setAgreed={setAgreed} />
        )}
      </div>
    </div>
  );
}
