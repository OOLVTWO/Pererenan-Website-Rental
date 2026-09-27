import { Icon } from './icons';
import { BookingLink } from './BookingProvider';
import { BOOKING } from '@/lib/landing/content';

function MobileField({ icon, label, value }) {
  return (
    <label className="flex items-center justify-between gap-[10px] min-h-[52px] p-[0_14px] border border-[#E4E9F0] rounded-[12px] bg-white">
      <span className="flex items-center gap-[10px]">
        <Icon name={icon} size="17" color="#1D4ED8" />
        <span className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#5B6474]">{label}</span>
          <span className="text-[14.5px] font-semibold">{value}</span>
        </span>
      </span>
      <Icon name="chevron" size="16" color="#5B6474" />
    </label>
  );
}

export function CheckPriceMobile() {
  return (
    <section className="m-[-26px_18px_0] relative z-[2] p-[16px] border border-[#E4E9F0] rounded-[18px] bg-white shadow-[0_10px_26px_rgba(11,31,58,0.07)] flex flex-col gap-[12px]">
      <span className="flex items-center justify-between">
        <span className="font-display text-[16px] font-bold">Check price &amp; availability</span>
      </span>
      <MobileField icon="scooter" label="Scooter" value={BOOKING.scooter} />
      <MobileField icon="calendar" label="Pick-up" value={BOOKING.pickUp} />
      <MobileField icon="calendar" label="Return" value={BOOKING.return} />
      <div className="flex items-center justify-between gap-[12px] p-[12px_14px] rounded-[12px] bg-[#EEF3FF]">
        <span className="flex flex-col gap-[2px]">
          <span className="text-[11.5px] font-semibold text-[#1E40AF]">5 days · weekly rate applied</span>
          <span className="font-display text-[24px] font-bold">{BOOKING.total}</span>
        </span>
        <span className="text-[11.5px] text-[#1E40AF] text-right">
          best
          <br />
          price
        </span>
      </div>
      <BookingLink className="inline-flex items-center gap-[10px] min-h-[56px] p-[0_22px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold box-border w-full justify-center">
        Continue on WhatsApp <Icon name="arrow" size="17" color="#fff" />
      </BookingLink>
    </section>
  );
}

function DesktopField({ label, value }) {
  return (
    <label className="flex flex-col gap-[6px] p-[0_22px] border-l border-[#E4E9F0]">
      <span className="text-[11.5px] font-bold tracking-[0.4px] uppercase text-[#5B6474]">{label}</span>
      <span className="flex items-center justify-between gap-[10px] text-[16px] font-semibold">
        {value}
        <Icon name="chevron" size="16" color="#5B6474" />
      </span>
    </label>
  );
}

export function CheckPriceDesktop() {
  return (
    <section className="mt-[-42px] mx-page relative z-[2] p-[20px_8px] border border-[#E4E9F0] rounded-[20px] bg-white shadow-[0_14px_34px_rgba(11,31,58,0.08)] grid grid-cols-[1.15fr_1fr_1fr_1.1fr_auto] gap-0 items-center">
      <div className="flex flex-col gap-[4px] p-[0_22px]">
        <span className="font-display text-[17px] font-bold">Check price</span>
        <span className="text-[12.5px] text-[#5B6474]">Weekly &amp; monthly rates applied automatically</span>
      </div>
      <DesktopField label="Scooter" value={BOOKING.scooter} />
      <DesktopField label="Pick-up" value={BOOKING.pickUp} />
      <DesktopField label="Return" value={BOOKING.return} />
      <div className="flex items-center gap-[18px] p-[0_22px] border-l border-[#E4E9F0]">
        <span className="flex flex-col gap-[2px]">
          <span className="text-[11.5px] font-bold text-[#1E40AF]">5 days · weekly rate</span>
          <span className="font-display text-[26px] font-bold leading-[1]">{BOOKING.total}</span>
        </span>
        <BookingLink className="inline-flex items-center gap-[10px] min-h-[56px] p-[0_22px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold box-border">
          Continue <Icon name="arrow" size="17" color="#fff" />
        </BookingLink>
      </div>
    </section>
  );
}
