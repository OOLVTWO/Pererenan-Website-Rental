import { Icon } from './icons';
import { LogoMark, PhotoPlaceholder } from './ui';
import { BUSINESS, WA_GENERAL } from '@/lib/landing/content';

function InfoLine({ icon, iconSize, className, children }) {
  return (
    <span className={`flex items-start gap-[11px] text-[#475569] ${className}`}>
      <Icon name={icon} size={iconSize} color="#1D4ED8" />
      <span>{children}</span>
    </span>
  );
}

export function FooterMobile() {
  const line = 'text-[13.5px] leading-[1.6]';
  return (
    <footer className="bg-white border-t border-[#E4E9F0] p-[26px_18px_96px] flex flex-col gap-[18px]">
      <a
        href={WA_GENERAL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-[10px] min-h-[56px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold"
      >
        <Icon name="whatsapp" size="19" color="#fff" /> {BUSINESS.phoneDisplay}
      </a>
      <PhotoPlaceholder className="h-[150px] rounded-[16px] bg-[#EEF3FF]" label="map" />
      <div className="flex flex-col gap-[12px] pt-[16px] border-t border-[#E4E9F0]">
        <InfoLine icon="pin" iconSize="17" className={line}>
          Jl. Pantai Pererenan No.119, Mengwi,
          <br />
          Badung, Bali 80351
        </InfoLine>
        <InfoLine icon="clock" iconSize="17" className={line}>
          Open daily 08:00 – 20:00
        </InfoLine>
        <InfoLine icon="instagram" iconSize="17" className={line}>
          @bossrentpererenan
        </InfoLine>
        <span className="text-[12px] text-[#5B6474] pt-[6px]">© 2026 Boss Rent Pererenan</span>
      </div>
    </footer>
  );
}

export function FooterDesktop() {
  const line = 'text-[14px] leading-[1.65]';
  return (
    <footer className="bg-[#F6F8FB] border-t border-[#E4E9F0] pt-[54px] pb-[34px] px-page flex flex-col gap-[34px]">
      <div className="grid grid-cols-[1.15fr_0.85fr] gap-[56px] items-center">
        <div className="flex flex-col gap-[18px]">
          <span className="flex items-center gap-[10px]">
            <LogoMark className="w-[38px] h-[38px] rounded-[10px]" iconSize="21" />
            <span className="font-display text-[18px] font-bold">
              Boss Rent <span className="text-[#5B6474] font-medium">Pererenan</span>
            </span>
          </span>
          <p className="text-[15px] leading-[1.7] text-[#475569] max-w-[400px]">
            Send us your dates and we reply with availability and a delivery time.
          </p>
          <div className="flex gap-[12px]">
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[10px] min-h-[56px] p-[0_24px] rounded-[12px] bg-[#1D4ED8] text-white text-[15.5px] font-bold"
            >
              <Icon name="whatsapp" size="19" color="#fff" /> {BUSINESS.phoneDisplay}
            </a>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[10px] min-h-[56px] p-[0_24px] rounded-[12px] bg-white border border-[#E4E9F0] text-[#0F172A] text-[15.5px] font-semibold"
            >
              <Icon name="pin" size="18" color="#1D4ED8" /> Get directions
            </a>
          </div>
        </div>
        <PhotoPlaceholder className="h-[260px] rounded-[18px] bg-[#EEF3FF]" label="map" />
      </div>
      <div className="grid grid-cols-[repeat(3,1fr)] gap-[30px] pt-[26px] border-t border-[#E4E9F0]">
        <InfoLine icon="pin" iconSize="18" className={line}>
          Jl. Pantai Pererenan No.119
          <br />
          Mengwi, Badung, Bali 80351
        </InfoLine>
        <InfoLine icon="clock" iconSize="18" className={line}>
          Open daily
          <br />
          08:00 – 20:00
        </InfoLine>
        <InfoLine icon="instagram" iconSize="18" className={line}>
          @bossrentpererenan
          <br />
          {BUSINESS.phoneDisplay}
        </InfoLine>
      </div>
    </footer>
  );
}

/** Tombol WhatsApp melayang (sticky) di akhir papan HP. */
export function WhatsAppFab() {
  return (
    <div className="sticky bottom-[20px] z-[9] h-0 flex justify-end p-[0_18px]">
      <a
        href={WA_GENERAL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-[60px] h-[60px] rounded-[999px] bg-[#1D4ED8] text-white flex items-center justify-center shadow-[0_10px_26px_rgba(29,78,216,0.38)] border-[3px] border-white [transform:translateY(-100%)] box-border"
      >
        <Icon name="whatsapp" size="26" color="#fff" strokeWidth="2" />
      </a>
    </div>
  );
}
