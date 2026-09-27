import { Icon, Stars } from './icons';
import { LogoMark } from './ui';
import { BookingLink } from './BookingProvider';
import { WA_GENERAL } from '@/lib/landing/content';

const HERO_PHOTO = 'bg-[url(/images/landing/hero.webp)] bg-cover';

export function HeroMobile() {
  return (
    <section className="relative min-h-[600px] flex flex-col overflow-hidden">
      <div className={`absolute inset-0 ${HERO_PHOTO} bg-position-[68%_50%]`}></div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,36,0.74)_0%,rgba(7,17,36,0.34)_42%,rgba(7,17,36,0.88)_100%)]"></div>

      <header className="relative flex items-center justify-between p-[14px_18px]">
        <span className="flex items-center gap-[9px]">
          <LogoMark className="w-[34px] h-[34px] rounded-[9px]" iconSize="19" />
          <span className="font-display text-[16px] font-bold text-white">Boss Rent</span>
        </span>
        <button
          type="button"
          aria-label="Menu"
          className="w-[44px] h-[44px] rounded-[11px] border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.12)] flex items-center justify-center"
        >
          <Icon name="menu" size="19" color="#fff" />
        </button>
      </header>

      <div className="relative mt-auto p-[0_18px_30px] flex flex-col gap-[15px]">
        <span className="inline-flex items-center gap-[7px] self-start p-[7px_13px] rounded-[999px] bg-[rgba(255,255,255,0.16)] border border-[rgba(255,255,255,0.3)] text-white text-[12px] font-bold tracking-[0.4px]">
          Pererenan · Canggu · Berawa
        </span>
        <h1 className="text-[42px] leading-[1.03] text-white">
          Scooter rental
          <br />
          made simple
          <br />
          in Bali.
        </h1>
        <p className="text-[15px] leading-[1.7] text-[rgba(255,255,255,0.88)]">
          39 automatics, serviced monthly and delivered free to your door. Helmets on the seat, no passport held.
        </p>
        <div className="flex flex-col gap-[10px] pt-[2px]">
          <BookingLink className="inline-flex items-center justify-center gap-[10px] min-h-[56px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold">
            Book a scooter <Icon name="arrow" size="17" color="#fff" />
          </BookingLink>
          <a
            href={WA_GENERAL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-[9px] min-h-[52px] rounded-[12px] bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.34)] text-white text-[14.5px] font-semibold"
          >
            <Icon name="whatsapp" size="17" color="#fff" /> Chat on WhatsApp
          </a>
        </div>
        <div className="flex items-center gap-[10px] pt-[6px]">
          <Stars />
          <span className="text-[12.5px] text-[rgba(255,255,255,0.85)]">
            <strong className="text-white">5.0</strong> · 39 scooters · delivered in 1 hr
          </span>
        </div>
      </div>
    </section>
  );
}

const NAV = [
  { label: 'Fleet', href: '#fleet' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
];

function HeroStat({ value, label }) {
  return (
    <span className="text-[13.5px] text-[rgba(255,255,255,0.85)]">
      <strong className="text-white">{value}</strong> {label}
    </span>
  );
}

export function HeroDesktop() {
  return (
    <section className="relative min-h-[640px] flex flex-col overflow-hidden">
      <div className={`absolute inset-0 ${HERO_PHOTO} bg-center`}></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,36,0.88)_0%,rgba(7,17,36,0.66)_46%,rgba(7,17,36,0.22)_100%)]"></div>

      <header className="relative grid grid-cols-[1fr_auto_1fr] items-center py-[20px] px-page border-b border-[rgba(255,255,255,0.18)]">
        <span className="flex items-center gap-[10px]">
          <LogoMark className="w-[38px] h-[38px] rounded-[10px]" iconSize="21" />
          <span className="font-display text-[18px] font-bold text-white">
            Boss Rent <span className="text-[rgba(255,255,255,0.7)] font-medium">Pererenan</span>
          </span>
        </span>
        <nav className="flex gap-[30px] justify-self-center">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-[14px] font-medium text-[rgba(255,255,255,0.85)]">
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={WA_GENERAL}
          target="_blank"
          rel="noopener noreferrer"
          className="justify-self-end inline-flex items-center gap-[8px] min-h-[44px] p-[0_18px] rounded-[11px] bg-[#1D4ED8] text-white text-[14px] font-bold"
        >
          <Icon name="whatsapp" size="16" color="#fff" /> Chat on WhatsApp
        </a>
      </header>

      <div className="relative mt-auto pb-[74px] px-page flex items-end justify-between gap-[48px]">
        <div className="flex flex-col gap-[20px] max-w-[620px]">
          <span className="inline-flex items-center gap-[7px] self-start p-[8px_14px] rounded-[999px] bg-[rgba(255,255,255,0.16)] border border-[rgba(255,255,255,0.3)] text-white text-[12.5px] font-bold tracking-[0.4px]">
            Pererenan · Canggu · Berawa
          </span>
          <h1 className="text-[66px] leading-[1.02] text-white">Scooter rental made simple in Bali.</h1>
          <p className="text-[17px] leading-[1.7] text-[rgba(255,255,255,0.88)] max-w-[480px]">
            39 automatics, serviced monthly and delivered free to your door in Canggu, Berawa and Pererenan. Helmets on
            the seat, and your passport stays with you.
          </p>
          <div className="flex items-center gap-[12px] pt-[4px]">
            <BookingLink className="inline-flex items-center gap-[10px] min-h-[56px] p-[0_24px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold">
              Book a scooter <Icon name="arrow" size="17" color="#fff" />
            </BookingLink>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[9px] min-h-[56px] p-[0_22px] rounded-[12px] bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.34)] text-white text-[15px] font-semibold"
            >
              <Icon name="whatsapp" size="17" color="#fff" /> Chat on WhatsApp
            </a>
          </div>
          <div className="flex items-center gap-[20px] pt-[8px]">
            <span className="flex items-center gap-[9px]">
              <Stars />
              <HeroStat value="5.0" label="rating" />
            </span>
            <span className="w-[1px] h-[20px] bg-[rgba(255,255,255,0.3)]"></span>
            <HeroStat value="39" label="scooters" />
            <span className="w-[1px] h-[20px] bg-[rgba(255,255,255,0.3)]"></span>
            <HeroStat value="7" label="models" />
          </div>
        </div>
        <div className="flex flex-col gap-[12px] pb-[6px]">
          <div className="p-[14px_16px] rounded-[14px] bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.3)] flex items-center gap-[12px]">
            <span className="w-[40px] h-[40px] rounded-[11px] bg-[rgba(255,255,255,0.18)] text-white flex items-center justify-center">
              <Icon name="clock" size="20" color="#fff" />
            </span>
            <span className="flex flex-col">
              <span className="text-[13.5px] font-bold text-white">Delivered in 1 hour</span>
              <span className="text-[12px] text-[rgba(255,255,255,0.78)]">Open daily 08:00 – 20:00</span>
            </span>
          </div>
          <div className="p-[14px_16px] rounded-[14px] bg-white flex flex-col gap-[1px]">
            <span className="text-[11px] font-semibold text-[#5B6474]">From</span>
            <span className="font-display text-[22px] font-bold">
              Rp 100k<span className="text-[12px] font-semibold text-[#5B6474]"> /day</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
