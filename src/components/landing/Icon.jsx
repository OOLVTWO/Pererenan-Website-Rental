/**
 * Ikon landing: path disalin dari mockup, dimuat SEKALI sebagai sprite
 * <symbol> lalu dipakai lewat <use> supaya HTML tetap kecil.
 * Bisa dipakai di server component maupun BookingIsland.
 */
const SYMBOLS = {
  scooter: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6l-2.5-7H9"/><path d="M12.5 10H16l2 7"/>',
  menu: '<path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/>',
  whatsapp: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
  arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.4"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  helmet: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="M3.5 15h17v2.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  wrench: '<path d="M15.5 4.5a4.5 4.5 0 0 0-5.9 5.7L4 15.8 6.2 18l5.6-5.6a4.5 4.5 0 0 0 5.8-5.9l-2.6 2.6-2.1-2.1z"/>',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z"/><path d="M9.2 12l2 2 3.6-3.8"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="4.6"/><circle cx="12" cy="12" r="3.4"/><circle cx="17" cy="7" r="0.6" fill="currentColor"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 19a5.5 5.5 0 0 0-2.3-4.5"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4"/><path d="M12 12v8"/>',
  star: '<path d="M12 2.6l2.8 5.9 6.4.9-4.6 4.5 1.1 6.4-5.7-3.1-5.7 3.1 1.1-6.4L2.8 9.4l6.4-.9z"/>',
  home: '<path d="M4 10.5l8-6.5 8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15V15H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
};

const SPRITE = Object.entries(SYMBOLS)
  .map(([id, body]) => `<symbol id="lp-${id}" viewBox="0 0 24 24">${body}</symbol>`)
  .join('');

/** Taruh sekali di setiap halaman landing. */
export function Sprite() {
  return <svg className="lp-sprite" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />;
}

export function Icon({ name, size, color = 'currentColor', sw = '1.8', className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <use href={`#lp-${name}`} />
    </svg>
  );
}

/** Lima bintang #F59E0B. */
export function Stars() {
  const star = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
      <use href="#lp-star" />
    </svg>
  );
  return (
    <span className="lp-stars">
      {star}
      {star}
      {star}
      {star}
      {star}
    </span>
  );
}
