/**
 * Ikon SVG inline untuk halaman publik — hanya ikon yang benar-benar dipakai,
 * digambar langsung tanpa dependency apa pun (tidak memuat lucide-react
 * yang dipakai panel admin).
 */
const PATHS = {
  wa: <><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z" /></>,
  arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  pin: <><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  star: <><path d="M12 4l2.3 4.9 5.2.7-3.8 3.6 1 5.2-4.7-2.6L7.3 18.4l1-5.2L4.5 9.6l5.2-.7z" /></>,
  check: <><path d="M20 6L9 17l-5-5" /></>,
  truck: <><path d="M3 16V6h11v10" /><path d="M14 9h4l3 3v4h-7" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>,
  helmet: <><path d="M3 14a9 9 0 0 1 18 0" /><path d="M3 14h18v4H3z" /></>,
  wrench: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  down: <><path d="M6 9l6 6 6-6" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  insta: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" /></>,
  shield: <><path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-3.4 3.7-5.2 7-5.2s6 1.8 7 5.2" /></>,
  engine: <><rect x="4" y="9" width="13" height="8" rx="2" /><path d="M17 12h3v4h-3" /><path d="M8 9V6h4v3" /></>,
  box: <><path d="M4 8l8-4 8 4-8 4z" /><path d="M4 8v8l8 4 8-4V8" /></>,
  surf: <><path d="M12 3c4 3 6 7 6 11a6 6 0 0 1-12 0c0-4 2-8 6-11z" /><path d="M12 6v14" /></>,
  x: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
};

export function LIcon({ name, size = 18, strokeWidth = 1.8, className }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true" focusable="false">
      {path}
    </svg>
  );
}

export default LIcon;
