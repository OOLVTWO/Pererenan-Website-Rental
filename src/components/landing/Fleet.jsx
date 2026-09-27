'use client';

import { useState } from 'react';
import { Icon } from './icons';
import { Eyebrow, PhotoPlaceholder } from './ui';
import { FLEET_FILTERS, filterFleet, whatsappUrl } from '@/lib/landing/content';

/* Ukuran yang berbeda antara papan HP dan desktop. */
const SIZES = {
  mobile: {
    chip: 'p-[9px_13px] text-[12.5px]',
    photo: 'h-[120px]',
    name: 'text-[16px]',
    price: 'text-[21px]',
    askCard: 'p-[16px]',
    askTitle: 'text-[15px]',
    askText: 'text-[12px]',
  },
  desktop: {
    chip: 'p-[11px_17px] text-[13.5px]',
    photo: 'h-[150px]',
    name: 'text-[19px]',
    price: 'text-[24px]',
    askCard: 'p-[20px]',
    askTitle: 'text-[17px]',
    askText: 'text-[13px]',
  },
};

const ACTION =
  'inline-flex items-center justify-center gap-[8px] min-h-[44px] rounded-[10px] border border-[#D6E2FF] text-[#1E40AF] text-[13.5px] font-bold mt-auto';

/*
 * Chip aktif tidak punya border sehingga diregangkan flex 2px lebih tinggi.
 * <button> memusatkan isinya secara vertikal, <span> di referensi tidak —
 * `flex` membuat teks tombol kembali rata atas seperti referensi.
 * `whitespace-nowrap`: di 1024–1259px (tidak ada mockup) label chip tidak
 * boleh patah jadi dua baris; di lebar mockup tidak mengubah piksel apa pun.
 */
function FilterChips({ size, active, onChange }) {
  return FLEET_FILTERS.map((f, i) => (
    <button
      key={f.label}
      type="button"
      aria-pressed={i === active}
      onClick={() => onChange(i)}
      className={`btn-reset flex whitespace-nowrap ${size.chip} rounded-[999px] font-semibold ${
        i === active ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E4E9F0] text-[#475569]'
      }`}
    >
      {f.label}
    </button>
  ));
}

function ScooterCard({ scooter, size }) {
  return (
    <article className="border border-[#E4E9F0] rounded-[18px] bg-white overflow-hidden flex flex-col">
      <div className="relative p-[12px] bg-[#F6F8FB]">
        <PhotoPlaceholder className={`${size.photo} rounded-[12px] bg-[#EEF3FF]`} label="photo" />
        {scooter.badge && (
          <span className="absolute top-[12px] left-[12px] p-[5px_10px] rounded-[999px] bg-[#1D4ED8] text-white text-[10.5px] font-bold tracking-[0.3px]">
            {scooter.badge}
          </span>
        )}
        <span className="absolute top-[12px] right-[12px] p-[5px_10px] rounded-[999px] bg-white border border-[#E4E9F0] text-[11px] font-bold text-[#475569]">
          {scooter.cc}cc
        </span>
      </div>
      <div className="p-[14px] flex flex-col gap-[12px] grow">
        <h3 className={`${size.name} leading-[1.2]`}>{scooter.name}</h3>
        <span className="flex flex-wrap gap-[6px]">
          <span className="p-[4px_9px] rounded-[7px] bg-[#F6F8FB] text-[11px] font-semibold text-[#475569]">automatic</span>
          <span className="p-[4px_9px] rounded-[7px] bg-[#F6F8FB] text-[11px] font-semibold text-[#475569]">2 riders</span>
        </span>
        <span className="flex items-end justify-between gap-[8px] pt-[4px] border-t border-[#E4E9F0]">
          <span className="flex flex-col gap-[1px] pt-[10px]">
            <span className="text-[11px] text-[#5B6474] font-semibold">From</span>
            <span className={`font-display ${size.price} font-bold tracking-[-0.03em]`}>
              Rp {scooter.daily}k<span className="text-[12px] font-semibold text-[#5B6474]"> /day</span>
            </span>
          </span>
          <span className="text-[11.5px] text-[#5B6474] pt-[10px] text-right">
            week
            <br />
            <strong className="text-[#475569]">{scooter.week}</strong>
          </span>
        </span>
        <a
          href={whatsappUrl(`Hi Boss Rent! I'd like to book the ${scooter.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ACTION} bg-[#EEF3FF]`}
        >
          Book this <Icon name="arrow" size="15" color="#1E40AF" />
        </a>
      </div>
    </article>
  );
}

function AskCard({ size }) {
  return (
    <article
      className={`border border-dashed border-[#D6E2FF] rounded-[18px] bg-[#EEF3FF] ${size.askCard} flex flex-col justify-center gap-[10px]`}
    >
      <span className="w-[40px] h-[40px] rounded-[10px] bg-white text-[#1D4ED8] flex items-center justify-center">
        <Icon name="chat" size="20" color="#1D4ED8" />
      </span>
      <h3 className={size.askTitle}>Not sure which one?</h3>
      <span className={`${size.askText} leading-[1.55] text-[#475569]`}>
        Tell us where you are going and how long. We pick the right scooter.
      </span>
      <a
        href={whatsappUrl("Hi Boss Rent! I'm not sure which scooter to pick. Can you help?")}
        target="_blank"
        rel="noopener noreferrer"
        className={`${ACTION} bg-white`}
      >
        <Icon name="whatsapp" size="15" color="#1E40AF" /> Ask us
      </a>
    </article>
  );
}

export function FleetMobile() {
  const [active, setActive] = useState(0);
  const size = SIZES.mobile;
  return (
    <section data-fleet className="p-[26px_18px] flex flex-col gap-[14px] bg-[#F6F8FB] mt-[12px]">
      <Eyebrow>The fleet</Eyebrow>
      <h2 className="text-[28px] leading-[1.1]">
        Seven models,
        <br />
        39 scooters ready.
      </h2>
      <div className="flex gap-[7px] flex-wrap">
        <FilterChips size={size} active={active} onChange={setActive} />
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-[10px]">
        {filterFleet(active).map((s) => (
          <ScooterCard key={s.name} scooter={s} size={size} />
        ))}
        <AskCard size={size} />
      </div>
      <p className="text-[12.5px] leading-[1.65] text-[#5B6474]">
        Weekly and monthly rates are already discounted and applied automatically. Top box and surf rack: Rp 350.000
        each, on rentals of 28 days or more, fitting included.
      </p>
    </section>
  );
}

export function FleetDesktop() {
  const [active, setActive] = useState(0);
  const size = SIZES.desktop;
  return (
    <section id="fleet" data-fleet className="pt-[64px] pb-[70px] px-page flex flex-col gap-[24px]">
      <div className="flex items-end justify-between gap-[40px]">
        <div className="flex flex-col gap-[12px]">
          <Eyebrow>The fleet</Eyebrow>
          <h2 className="text-[46px] leading-[1.06]">Seven models, 39 scooters ready.</h2>
        </div>
        <div className="flex gap-[8px]">
          <FilterChips size={size} active={active} onChange={setActive} />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[18px]">
        {filterFleet(active).map((s) => (
          <ScooterCard key={s.name} scooter={s} size={size} />
        ))}
        <AskCard size={size} />
      </div>
    </section>
  );
}
