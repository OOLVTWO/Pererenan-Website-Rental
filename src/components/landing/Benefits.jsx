import { Icon } from './icons';
import { BENEFITS } from '@/lib/landing/content';

export function BenefitsMobile() {
  return (
    <section className="p-[26px_18px_6px]">
      {BENEFITS.map((b) => (
        <div key={b.title} className="flex items-center gap-[12px] p-[14px_0] border-b border-[#E4E9F0]">
          <span className="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[#EEF3FF] text-[#1D4ED8] flex items-center justify-center">
            <Icon name={b.icon} size="19" color="#1D4ED8" />
          </span>
          <span className="flex flex-col gap-[1px]">
            <span className="text-[14px] font-bold">{b.title}</span>
            <span className="text-[12.5px] text-[#5B6474]">{b.text}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

export function BenefitsDesktop() {
  return (
    <section className="mt-[44px] mx-page p-[22px_0] border-t border-b border-[#E4E9F0] grid grid-cols-[repeat(4,1fr)]">
      {BENEFITS.map((b) => (
        <div key={b.title} className="flex items-center gap-[12px] p-[0_24px] border-l border-[#E4E9F0]">
          <span className="w-[40px] h-[40px] shrink-0 rounded-[11px] bg-[#EEF3FF] text-[#1D4ED8] flex items-center justify-center">
            <Icon name={b.icon} size="20" color="#1D4ED8" />
          </span>
          <span className="flex flex-col gap-[1px]">
            <span className="text-[14px] font-bold">{b.title}</span>
            <span className="text-[12.5px] text-[#5B6474]">{b.text}</span>
          </span>
        </div>
      ))}
    </section>
  );
}
