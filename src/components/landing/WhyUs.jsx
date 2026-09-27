import { Icon } from './icons';
import { Eyebrow, PhotoPlaceholder } from './ui';
import { BENEFITS } from '@/lib/landing/content';

export function WhyUsMobile() {
  return (
    <section className="p-[30px_18px] flex flex-col gap-[14px]">
      <Eyebrow>Why us</Eyebrow>
      <h2 className="text-[28px] leading-[1.1]">Rental without the usual traps.</h2>
      <div className="flex flex-col gap-[10px]">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex gap-[13px] p-[15px] border border-[#E4E9F0] rounded-[16px] bg-white">
            <span className="w-[38px] h-[38px] shrink-0 rounded-[11px] bg-[#EEF3FF] text-[#1D4ED8] flex items-center justify-center">
              <Icon name={b.icon} size="19" color="#1D4ED8" />
            </span>
            <span className="flex flex-col gap-[4px]">
              <span className="font-display text-[15.5px] font-bold">{b.title}</span>
              <span className="text-[13px] leading-[1.6] text-[#475569]">{b.text}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-[12.5px] leading-[1.65] text-[#5B6474]">
        Every bike is on a monthly service log, and the same team answers your messages.
      </p>
    </section>
  );
}

export function WhyUsDesktop() {
  return (
    <section className="pb-[62px] px-page">
      <div className="border border-[#E4E9F0] rounded-[26px] bg-white p-[40px] grid grid-cols-[1.05fr_0.95fr] gap-[48px] items-center">
        <div className="flex flex-col gap-[24px]">
          <Eyebrow>Why us</Eyebrow>
          <h2 className="text-[40px] leading-[1.08]">Rental without the usual traps.</h2>
          <div className="grid grid-cols-[1fr_1fr] gap-[24px]">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-[14px]">
                <span className="w-[42px] h-[42px] shrink-0 rounded-[11px] bg-[#EEF3FF] text-[#1D4ED8] flex items-center justify-center">
                  <Icon name={b.icon} size="21" color="#1D4ED8" />
                </span>
                <span className="flex flex-col gap-[5px]">
                  <span className="font-display text-[17px] font-bold">{b.title}</span>
                  <span className="text-[13.5px] leading-[1.65] text-[#475569]">{b.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <PhotoPlaceholder className="h-[380px] rounded-[20px] bg-[#EEF3FF]" label="shop photo" />
      </div>
    </section>
  );
}
