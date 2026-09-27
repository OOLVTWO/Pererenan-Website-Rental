/**
 * Isi halaman publik — teks disalin persis dari HTML referensi
 * (termasuk huruf besar-kecil & tanda baca). Jangan diubah tanpa mockup baru.
 */

export const BUSINESS = {
  phoneDisplay: '+62 812-3710-9751',
  phoneE164: '6281237109751',
  mapsUrl: 'https://maps.app.goo.gl/99TuJQd6Ebj2SWY66',
};

/** Link wa.me dengan pesan terisi. */
export function whatsappUrl(message) {
  const base = `https://wa.me/${BUSINESS.phoneE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const WA_GENERAL = whatsappUrl("Hi Boss Rent! I'd like to rent a scooter.");

/** Empat keunggulan (strip di bawah cek harga & "Why us"). */
export const BENEFITS = [
  { icon: 'helmet', title: '2 helmets + raincoat', text: 'always included' },
  { icon: 'pin', title: 'Free delivery', text: 'Canggu · Berawa · Pererenan' },
  { icon: 'wrench', title: 'Serviced monthly', text: 'service log per bike' },
  { icon: 'shield', title: 'Passport stays with you', text: 'photo is enough' },
];

/** Chip filter armada. `match` menentukan motor yang tampil. */
export const FLEET_FILTERS = [
  { label: 'All', match: () => true },
  { label: 'Under 150k', match: (s) => s.daily < 150 },
  { label: '110–125cc', match: (s) => s.cc >= 110 && s.cc <= 125 },
  { label: '155cc+', match: (s) => s.cc >= 155 },
];

/** Armada — urutan, badge, dan harga persis seperti kartu di referensi. */
export const FLEET = [
  { name: 'Fazzio Neo 125', cc: 125, badge: 'Most rented', daily: 100, week: '800rb' },
  { name: 'NMAX Neo 155', cc: 155, badge: 'Best for trips', daily: 200, week: '1,5jt' },
  { name: 'Scoopy 110', cc: 110, badge: 'Easiest ride', daily: 100, week: '600rb' },
  { name: 'Aerox 155', cc: 155, badge: null, daily: 150, week: '900rb' },
  { name: 'PCX 160', cc: 160, badge: 'Most comfort', daily: 250, week: '1,2jt' },
  { name: 'ADV 160', cc: 160, badge: null, daily: 250, week: '1,4jt' },
  { name: 'Fazzio Lux 125', cc: 125, badge: null, daily: 120, week: '750rb' },
];

export function filterFleet(filterIndex) {
  const filter = FLEET_FILTERS[filterIndex] ?? FLEET_FILTERS[0];
  return FLEET.filter(filter.match);
}

export const STEPS = [
  {
    title: 'Pick your dates',
    text: 'Choose a scooter and the days you need it. The best rate is applied automatically.',
  },
  {
    title: 'Confirm on WhatsApp',
    text: 'We reply with availability and the delivery time, usually within minutes.',
  },
  {
    title: 'We deliver, you ride',
    text: 'Bike, helmets and raincoat at your door. We collect it at the end.',
  },
];

export const REVIEWS = [
  {
    initial: 'S',
    name: 'Sarah M.',
    country: 'Australia',
    text: 'Booked at nine in the morning and the scooter was at our villa before lunch. Spotless, with two helmets.',
  },
  {
    initial: 'L',
    name: 'Lukas B.',
    country: 'Germany',
    text: 'Three weeks on an NMAX. Fair monthly price and a same-day swap when a tyre went soft.',
  },
  {
    initial: 'M',
    name: 'Marta K.',
    country: 'Poland',
    text: 'Clear pricing, no passport held, no drama about the deposit. Exactly what we wanted.',
  },
];

export const FAQ = [
  {
    q: 'Do I need an international licence?',
    a: 'An IDP with a motorcycle category is the legal requirement in Bali. We can explain how to get one.',
  },
  {
    q: 'Is a deposit required?',
    a: 'Only for monthly rentals. Daily and weekly bookings need no deposit.',
  },
  {
    q: 'Is fuel included?',
    a: 'The bike comes with some fuel to get you started. After that, fuel is on you.',
  },
  {
    q: 'What if something breaks?',
    a: 'Message us. We repair or swap the bike, usually the same day.',
  },
  {
    q: 'How do I pay?',
    a: 'Cash, bank transfer, QRIS or card. Payment on delivery.',
  },
];

/** Syarat sewa di langkah 2 sheet booking. */
export const TERMS = [
  'Riders must hold a valid motorcycle licence, or an International Driving Permit with a motorcycle category.',
  'Two helmets and a raincoat are included at no cost. Wearing a helmet is required by law in Bali.',
  'Fuel is not included. The scooter arrives with enough fuel to reach the nearest station.',
  'The renter is responsible for traffic fines, and for damage or loss during the rental period.',
  'Report a breakdown or accident to us straight away. We repair or swap the scooter as soon as we can.',
  'No deposit for daily and weekly rentals. Monthly rentals need a deposit, agreed before delivery.',
  'Top box and surf rack are Rp 350.000 each, on rentals of 28 days or more, fitting included.',
  'Payment is due on delivery: cash, bank transfer, QRIS or card. Extensions are charged at the same rate.',
  'The scooter is returned at the agreed date, time and place, in the same condition apart from normal wear.',
];

/**
 * Nilai pemesanan yang tampil di mockup (cek harga & sheet booking).
 * Sengaja statis — belum ada pemilih tanggal / kalkulator tarif.
 */
export const BOOKING = {
  scooter: 'Fazzio Neo 125',
  scooterMeta: '125cc · automatic',
  pickUp: '24 Sep 2026',
  return: '28 Sep 2026',
  dates: '24 – 28 Sep 2026',
  duration: '5 days',
  rate: '1 week package',
  area: 'Pererenan',
  total: 'Rp 500.000',
};

export function bookingMessage({ helmets, raincoats }) {
  return [
    "Hi Boss Rent! I'd like to book a scooter.",
    `Scooter: ${BOOKING.scooter}`,
    `Dates: ${BOOKING.dates} (${BOOKING.duration})`,
    `Rate: ${BOOKING.rate}`,
    `Helmets: ${helmets} · Raincoats: ${raincoats}`,
    `Delivery: ${BOOKING.area}`,
    `Total: ${BOOKING.total}`,
    'I have read and agree to the rental terms.',
  ].join('\n');
}
