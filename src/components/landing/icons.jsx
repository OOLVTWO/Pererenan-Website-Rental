/**
 * Ikon SVG inline — path disalin persis dari HTML referensi.
 * Semua ikon garis memakai viewBox 24, stroke-linecap/linejoin round.
 */
const PATHS = {
  scooter: (
    <>
      <circle cx="6" cy="17" r="3"></circle>
      <circle cx="18" cy="17" r="3"></circle>
      <path d="M9 17h6l-2.5-7H9"></path>
      <path d="M12.5 10H16l2 7"></path>
    </>
  ),
  menu: (
    <>
      <path d="M3 7h18"></path>
      <path d="M3 12h18"></path>
      <path d="M3 17h18"></path>
    </>
  ),
  whatsapp: <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z"></path>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"></path>,
  arrow: (
    <>
      <path d="M5 12h14"></path>
      <path d="M13 6l6 6-6 6"></path>
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3.2 2"></path>
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 11v5"></path>
      <path d="M12 7.6v.4"></path>
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6"></path>,
  helmet: (
    <>
      <path d="M4 15a8 8 0 1 1 16 0"></path>
      <path d="M3.5 15h17v2.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"></path>
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"></path>
      <circle cx="12" cy="10" r="2.6"></circle>
    </>
  ),
  wrench: <path d="M15.5 4.5a4.5 4.5 0 0 0-5.9 5.7L4 15.8 6.2 18l5.6-5.6a4.5 4.5 0 0 0 5.8-5.9l-2.6 2.6-2.1-2.1z"></path>,
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z"></path>
      <path d="M9.2 12l2 2 3.6-3.8"></path>
    </>
  ),
  camera: (
    <>
      <path d="M4 7h3l2-2h6l2 2h3v12H4z"></path>
      <circle cx="12" cy="13" r="3.5"></circle>
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect>
      <path d="M3.5 10h17"></path>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.6"></rect>
      <circle cx="12" cy="12" r="3.4"></circle>
      <circle cx="17" cy="7" r="0.6" fill="currentColor"></circle>
    </>
  ),
  minus: <path d="M5 12h14"></path>,
  plus: (
    <>
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </>
  ),
};

export function Icon({ name, size, color, strokeWidth = '1.8' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
      <path d="M12 2.6l2.8 5.9 6.4.9-4.6 4.5 1.1 6.4-5.7-3.1-5.7 3.1 1.1-6.4L2.8 9.4l6.4-.9z"></path>
    </svg>
  );
}

/** Lima bintang: <span style="display: flex; gap: 2px;"> */
export function Stars() {
  return (
    <span className="flex gap-[2px]">
      <Star />
      <Star />
      <Star />
      <Star />
      <Star />
    </span>
  );
}
