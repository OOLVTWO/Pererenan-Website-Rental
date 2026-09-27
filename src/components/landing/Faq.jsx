'use client';

import { useState } from 'react';
import { Icon } from './icons';
import { Eyebrow } from './ui';
import { FAQ, whatsappUrl } from '@/lib/landing/content';

/*
 * FAQ HP berbentuk akordeon. Tampilan item terbuka = item pertama di
 * referensi (latar #EEF3FF, ikon minus); item tertutup = item lainnya.
 */
export function FaqMobile() {
  const [open, setOpen] = useState(0);
  return (
    <section className="p-[30px_18px] flex flex-col gap-[10px]">
      <Eyebrow>FAQ</Eyebrow>
      <h2 className="text-[28px] leading-[1.1] mb-[4px]">Good to know.</h2>
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        const toggle = () => setOpen(isOpen ? -1 : i);
        return isOpen ? (
          <div
            key={item.q}
            className="border border-[#D6E2FF] rounded-[14px] bg-[#EEF3FF] p-[15px] flex flex-col gap-[9px]"
          >
            <button
              type="button"
              aria-expanded="true"
              aria-controls={`faq-m-${i}`}
              onClick={toggle}
              className="btn-reset flex items-start justify-between gap-[12px]"
            >
              <span className="text-[14.5px] font-bold leading-[1.4]">{item.q}</span>
              <Icon name="minus" size="18" color="#1D4ED8" />
            </button>
            <span id={`faq-m-${i}`} className="text-[13.5px] leading-[1.7] text-[#475569]">
              {item.a}
            </span>
          </div>
        ) : (
          <div
            key={item.q}
            className="border border-[#E4E9F0] rounded-[14px] bg-white p-[15px] flex items-center justify-between gap-[12px]"
          >
            <button
              type="button"
              aria-expanded="false"
              onClick={toggle}
              className="btn-reset grow flex items-center justify-between gap-[12px]"
            >
              <span className="text-[14.5px] font-semibold leading-[1.4]">{item.q}</span>
              <Icon name="plus" size="18" color="#1D4ED8" />
            </button>
          </div>
        );
      })}
    </section>
  );
}

export function FaqDesktop() {
  return (
    <section id="faq" className="py-[62px] px-page flex flex-col gap-[26px]">
      <div className="flex items-end justify-between gap-[40px]">
        <div className="flex flex-col gap-[12px]">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-[44px] leading-[1.06]">Good to know before you book.</h2>
        </div>
        <p className="text-[14.5px] leading-[1.7] text-[#475569] max-w-[330px]">
          Everything runs over WhatsApp, and we answer in English and Bahasa Indonesia.
        </p>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-[18px_20px]">
        {FAQ.map((item, i) => (
          <div
            key={item.q}
            className="p-[22px] border border-[#E4E9F0] rounded-[16px] bg-white flex flex-col gap-[9px]"
          >
            <span className="flex items-start gap-[11px]">
              <span className="w-[26px] h-[26px] shrink-0 rounded-[8px] bg-[#EEF3FF] text-[#1E40AF] flex items-center justify-center font-display text-[12.5px] font-bold">
                {i + 1}
              </span>
              <span className="text-[16px] font-bold leading-[1.4]">{item.q}</span>
            </span>
            <span className="text-[14px] leading-[1.7] text-[#475569] pl-[37px]">{item.a}</span>
          </div>
        ))}
        <div className="p-[22px] border border-dashed border-[#D6E2FF] rounded-[16px] bg-[#EEF3FF] flex flex-col gap-[10px] justify-center">
          <span className="w-[40px] h-[40px] rounded-[11px] bg-white text-[#1D4ED8] flex items-center justify-center">
            <Icon name="chat" size="20" color="#1D4ED8" />
          </span>
          <span className="font-display text-[17px] font-bold">Still have a question?</span>
          <span className="text-[14px] leading-[1.65] text-[#475569]">
            Send it over and we reply with a straight answer, usually within minutes.
          </span>
          <a
            href={whatsappUrl('Hi Boss Rent! I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-[9px] min-h-[46px] rounded-[11px] bg-white border border-[#D6E2FF] text-[#1E40AF] text-[14px] font-bold mt-[4px]"
          >
            <Icon name="whatsapp" size="16" color="#1E40AF" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
