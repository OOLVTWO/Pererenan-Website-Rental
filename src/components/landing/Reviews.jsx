import { Stars } from './icons';
import { Eyebrow } from './ui';
import { REVIEWS } from '@/lib/landing/content';

function SampleBadge() {
  return (
    <span className="inline-flex self-start p-[5px_11px] rounded-[999px] bg-[#FEF3C7] text-[#7A4A12] text-[11px] font-bold">
      SAMPLE — replace before launch
    </span>
  );
}

export function ReviewsMobile() {
  return (
    <section className="p-[26px_18px] flex flex-col gap-[14px] bg-[#F6F8FB]">
      <Eyebrow>Guests</Eyebrow>
      <h2 className="text-[28px] leading-[1.1]">What renters say.</h2>
      <SampleBadge />
      {/* Papan HP hanya menampilkan dua ulasan pertama. */}
      {REVIEWS.slice(0, 2).map((r) => (
        <figure
          key={r.name}
          className="m-0 p-[16px] border border-[#E4E9F0] rounded-[16px] bg-white flex flex-col gap-[10px]"
        >
          <Stars />
          <p className="text-[13.5px] leading-[1.65] text-[#475569]">{r.text}</p>
          <figcaption className="text-[12.5px] font-bold">
            {`${r.name} `}
            <span className="font-medium text-[#5B6474]">{`· ${r.country}`}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

export function ReviewsDesktop() {
  return (
    <section id="reviews" className="py-[56px] px-page bg-[#F6F8FB] flex flex-col gap-[24px]">
      <div className="flex items-end justify-between gap-[30px]">
        <div className="flex flex-col gap-[12px]">
          <Eyebrow>Guests</Eyebrow>
          <h2 className="text-[44px] leading-[1.06]">What renters say.</h2>
        </div>
        <SampleBadge />
      </div>
      <div className="grid grid-cols-[repeat(3,1fr)] gap-[20px]">
        {REVIEWS.map((r) => (
          <figure
            key={r.name}
            className="m-0 p-[22px] border border-[#E4E9F0] rounded-[18px] bg-white flex flex-col gap-[12px]"
          >
            <Stars />
            <p className="text-[14.5px] leading-[1.7] text-[#475569]">{r.text}</p>
            <figcaption className="flex items-center gap-[10px] pt-[4px] border-t border-[#E4E9F0]">
              <span className="w-[36px] h-[36px] rounded-[999px] bg-[#EEF3FF] text-[#1E40AF] flex items-center justify-center text-[13px] font-bold mt-[12px]">
                {r.initial}
              </span>
              <span className="flex flex-col mt-[12px]">
                <span className="text-[13.5px] font-bold">{r.name}</span>
                <span className="text-[12.5px] text-[#5B6474]">{r.country}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
