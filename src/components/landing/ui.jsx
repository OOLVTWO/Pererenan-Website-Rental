import { Icon } from './icons';

/** Label kecil biru di atas judul section ("The fleet", "FAQ", ...). */
export function Eyebrow({ children }) {
  return (
    <span className="text-[12px] font-bold tracking-[2px] uppercase text-[#1D4ED8]">{children}</span>
  );
}

/**
 * Placeholder foto bergaris dari mockup. Tinggi, radius, dan warna latar
 * dikirim lewat className (kelas Tailwind harus ditulis utuh).
 */
export function PhotoPlaceholder({ className, label }) {
  return (
    <div className={`overflow-hidden bg-stripes flex items-center justify-center ${className}`}>
      <span className="flex items-center gap-[6px] text-[#7C8DB5] text-[10px] font-semibold tracking-[1.4px] uppercase">
        <Icon name="camera" size="12" color="#7C8DB5" />
        {label}
      </span>
    </div>
  );
}

/** Logo: kotak biru + ikon skuter. */
export function LogoMark({ className, iconSize }) {
  return (
    <span className={`bg-[#1D4ED8] text-white flex items-center justify-center ${className}`}>
      <Icon name="scooter" size={iconSize} color="#fff" />
    </span>
  );
}
