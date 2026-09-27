import { Eyebrow } from './ui';
import { STEPS } from '@/lib/landing/content';

export function HowItWorksMobile() {
  return (
    <section className="p-[30px_18px] flex flex-col gap-[16px]">
      <Eyebrow>How it works</Eyebrow>
      <h2 className="text-[28px] leading-[1.1]">Three steps, no counter queue.</h2>
      <div className="flex flex-col">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-[14px]">
            <span className="flex flex-col items-center gap-[4px] shrink-0">
              <span className="w-[34px] h-[34px] rounded-[999px] bg-[#1D4ED8] text-white flex items-center justify-center text-[14px] font-bold">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && <span className="w-[2px] grow bg-[#D6E2FF]"></span>}
            </span>
            <span className="flex flex-col gap-[5px] pb-[22px]">
              <span className="font-display text-[17px] font-bold">{s.title}</span>
              <span className="text-[13.5px] leading-[1.65] text-[#475569]">{s.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksDesktop() {
  return (
    <section id="how-it-works" className="py-[56px] px-page bg-[#F6F8FB] flex flex-col gap-[26px]">
      <div className="flex items-end justify-between gap-[40px]">
        <div className="flex flex-col gap-[12px]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-[44px] leading-[1.06]">Three steps, no counter queue.</h2>
        </div>
        <p className="text-[14.5px] leading-[1.7] text-[#475569] max-w-[330px]">
          Everything runs over WhatsApp. No account to create, no card to enter, no deposit for daily and weekly
          rentals.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(3,1fr)] gap-[20px]">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="flex flex-col gap-[12px] p-[24px] border border-[#E4E9F0] rounded-[18px] bg-white"
          >
            <span className="w-[42px] h-[42px] rounded-[999px] bg-[#1D4ED8] text-white flex items-center justify-center font-display text-[17px] font-bold">
              {i + 1}
            </span>
            <span className="font-display text-[20px] font-bold">{s.title}</span>
            <span className="text-[14px] leading-[1.7] text-[#475569]">{s.text}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[22px] p-[18px_24px] border border-[#E4E9F0] rounded-[16px] bg-white">
        <span className="text-[13px] font-bold tracking-[1.4px] uppercase text-[#1D4ED8]">Extras</span>
        <span className="w-[1px] h-[26px] bg-[#E4E9F0]"></span>
        <span className="text-[14px] text-[#475569]">
          Top box <strong className="text-[#0F172A]">Rp 350.000</strong>
        </span>
        <span className="text-[14px] text-[#475569]">
          Surf rack <strong className="text-[#0F172A]">Rp 350.000</strong>
        </span>
        <span className="text-[13.5px] text-[#5B6474]">Rentals of 28 days or more · fitting included</span>
        <span className="ml-auto text-[13.5px] text-[#5B6474]">Helmets &amp; raincoat always free</span>
      </div>
    </section>
  );
}
