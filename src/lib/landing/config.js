/**
 * ════════════════════════════════════════════════════════════════
 * SATU-SATUNYA BERKAS DATA HALAMAN PUBLIK (/ dan /scooters/[id])
 * ════════════════════════════════════════════════════════════════
 * Harga, motor, perlengkapan, teks seksi, FAQ, syarat sewa, info bisnis.
 * Halaman publik sepenuhnya statis: tidak ada query database, tidak ada
 * state di server. Teks seksi disalin dari mockup yang sudah disetujui.
 */

export const BUSINESS = {
  name: 'Boss Rent Pererenan',
  shortName: 'Boss Rent',
  place: 'Pererenan',
  siteUrl: 'https://pererenan-website-rental.vercel.app',
  phoneDisplay: '+62 812-3710-9751',
  phoneE164: '6281237109751',
  instagram: '@bossrentpererenan',
  instagramUrl: 'https://instagram.com/bossrentpererenan',
  address: 'Jl. Pantai Pererenan No.119, Mengwi, Badung, Bali 80351',
  mapsUrl: 'https://maps.app.goo.gl/99TuJQd6Ebj2SWY66',
  hours: '08:00 – 20:00',
  areas: ['Pererenan', 'Canggu', 'Berawa'],
  scooters: 39,
  models: 7,
  rating: '5.0',
};

export const IMAGES = {
  hero: '/images/landing/hero.webp',
  shop: '/images/landing/divider.webp',
  map: '/images/landing/map.webp',
};

/** Paket: 1 minggu = 7 hari, 1 bulan = 30 hari. */
export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;

/**
 * ARMADA — satu entri per model. Harga dalam rupiah penuh.
 * Spesifikasi ditulis dari spesifikasi umum tiap model.
 */
export const FLEET = [
  {
    id: 'fazzio-neo-125',
    name: 'Fazzio Neo 125',
    cc: 125,
    badge: 'Most rented',
    photo: '/images/landing/scooter-fazzio.webp',
    price: { daily: 100000, weekly: 800000, monthly: 1900000 },
    storage: 'Helmet fits under the seat',
    blurb: 'Light and thrifty — the easy pick for cafe runs and beach hops around Canggu.',
    description:
      'The Fazzio Neo is the scooter most of our guests end up on. It is light enough to park anywhere along Pantai Pererenan, thrifty on fuel, and easy to handle if you have not ridden in a while. The seat is comfortable for two on short hops to the beach or a cafe.',
  },
  {
    id: 'nmax-neo-155',
    name: 'NMAX Neo 155',
    cc: 155,
    badge: 'Best for trips',
    photo: '/images/landing/scooter-nmax.webp',
    price: { daily: 200000, weekly: 1500000, monthly: 2600000 },
    storage: 'Large under-seat storage',
    blurb: 'Stable at speed with a roomy seat. Best for day trips to Uluwatu or Ubud.',
    description:
      'The NMAX Neo is the one to take out of Canggu. The longer wheelbase keeps it steady at highway speed, the seat stays comfortable past an hour, and the under-seat space swallows a helmet plus a day bag. A good choice for Uluwatu, Ubud or the east coast.',
  },
  {
    id: 'scoopy-110',
    name: 'Scoopy 110',
    cc: 110,
    badge: 'Easiest ride',
    photo: '/images/landing/scooter-scoopy.webp',
    price: { daily: 100000, weekly: 600000, monthly: 1500000 },
    storage: 'Small under-seat storage',
    blurb: 'The smallest and lightest we have — great if this is your first scooter.',
    description:
      'The Scoopy is the smallest and lightest scooter in the fleet, which makes it the easiest first bike in Bali. Low seat height, gentle throttle and simple controls. Best for short rides around Pererenan, Berawa and Canggu rather than long highway runs.',
  },
  {
    id: 'aerox-155',
    name: 'Aerox 155',
    cc: 155,
    badge: null,
    photo: '/images/landing/scooter-aerox.webp',
    price: { daily: 150000, weekly: 900000, monthly: 1800000 },
    storage: 'Helmet fits under the seat',
    blurb: 'Sporty and quick off the line, with a firmer ride than the Fazzio.',
    description:
      'The Aerox is the sporty one: quick off the line, firmer suspension and a riding position that leans forward a little. It rewards confident riders on open roads, and still parks as easily as any other automatic.',
  },
  {
    id: 'pcx-160',
    name: 'PCX 160',
    cc: 160,
    badge: 'Most comfort',
    photo: '/images/landing/scooter-pcx.webp',
    price: { daily: 250000, weekly: 1200000, monthly: 2300000 },
    storage: 'Large under-seat storage',
    blurb: 'The most comfortable seat in the fleet. Made for longer distances.',
    description:
      'The PCX has the most comfortable seat we rent, with a smooth engine and a large flat floor for a shopping bag or a backpack. If you plan on long days in the saddle or ride with a passenger often, this is the one to pick.',
  },
  {
    id: 'adv-160',
    name: 'ADV 160',
    cc: 160,
    badge: null,
    photo: '/images/landing/scooter-adv.webp',
    price: { daily: 250000, weekly: 1400000, monthly: 2500000 },
    storage: 'Large under-seat storage',
    blurb: 'Higher suspension for rough village roads and rainy-season potholes.',
    description:
      'The ADV sits higher than the rest of the fleet with longer suspension travel, so broken village roads and rainy-season potholes are far less punishing. Useful if you are staying outside the main Canggu strip.',
  },
  {
    id: 'fazzio-lux-125',
    name: 'Fazzio Lux 125',
    cc: 125,
    badge: null,
    photo: '/images/landing/scooter-fazzio.webp',
    price: { daily: 120000, weekly: 750000, monthly: 1800000 },
    storage: 'Helmet fits under the seat',
    blurb: 'Same easy ride as the Neo, with the smart key and a nicer finish.',
    description:
      'Same easy 125cc ride as the Fazzio Neo, with a smart key, a nicer finish and a slightly softer seat. Pick it if you want the simplest scooter in the fleet with a few extra comforts.',
  },
];

export const findScooter = (id) => FLEET.find((s) => s.id === id);

/** Chip filter armada. */
export const FLEET_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'under150', label: 'Under 150k' },
  { id: 'small', label: '110–125cc' },
  { id: 'big', label: '155cc+' },
];

export function matchesFilter(scooter, filterId) {
  if (filterId === 'under150') return scooter.price.daily < 150000;
  if (filterId === 'small') return scooter.cc <= 125;
  if (filterId === 'big') return scooter.cc >= 155;
  return true;
}

/** Top box & surf rack hanya untuk sewa 7 hari atau lebih. */
export const PAID_ADDON_MIN_DAYS = 7;

/** PERLENGKAPAN — urutan & teks sesuai sheet booking di mockup. */
export const ADDONS = [
  { id: 'helmet', name: 'Helmet', icon: 'helmet', note: 'Included with every rental', price: 0, max: 2, initial: 2 },
  { id: 'raincoat', name: 'Raincoat', icon: 'shield', note: 'Bali rain comes fast', price: 0, max: 1, initial: 1 },
  { id: 'topbox', name: 'Top box (Shad)', icon: 'scooter', note: 'Lockable · fitting included', price: 350000, max: 1, initial: 0, minDays: PAID_ADDON_MIN_DAYS },
  { id: 'surfrack', name: 'Surf rack', icon: 'scooter', note: 'Carries one board', price: 350000, max: 1, initial: 0, minDays: PAID_ADDON_MIN_DAYS },
];

export const BENEFITS = [
  { icon: 'helmet', title: '2 helmets + raincoat', text: 'always included' },
  { icon: 'pin', title: 'Free delivery', text: 'Canggu · Berawa · Pererenan' },
  { icon: 'wrench', title: 'Serviced monthly', text: 'service log per bike' },
  { icon: 'shield', title: 'Passport stays with you', text: 'photo is enough' },
];

export const STEPS = [
  { title: 'Pick your dates', text: 'Choose a scooter and the days you need it. The best rate is applied automatically.' },
  { title: 'Confirm on WhatsApp', text: 'We reply with availability and the delivery time, usually within minutes.' },
  { title: 'We deliver, you ride', text: 'Bike, helmets and raincoat at your door. We collect it at the end.' },
];

/**
 * ULASAN — masih CONTOH dari mockup (bukan ulasan asli). Selama `sample`
 * true, badge "SAMPLE — replace before launch" tampil seperti di mockup.
 * Setelah diganti ulasan Google asli: ubah isinya lalu set sample: false.
 * `show: false` menyembunyikan seluruh seksi.
 */
export const REVIEWS = {
  show: true,
  sample: true,
  items: [
    { initial: 'S', name: 'Sarah M.', country: 'Australia', text: 'Booked at nine in the morning and the scooter was at our villa before lunch. Spotless, with two helmets.' },
    { initial: 'L', name: 'Lukas B.', country: 'Germany', text: 'Three weeks on an NMAX. Fair monthly price and a same-day swap when a tyre went soft.' },
    { initial: 'M', name: 'Marta K.', country: 'Poland', text: 'Clear pricing, no passport held, no drama about the deposit. Exactly what we wanted.' },
  ],
};

export const FAQ = [
  { q: 'Do I need an international licence?', a: 'An IDP with a motorcycle category is the legal requirement in Bali. We can explain how to get one.' },
  { q: 'Is a deposit required?', a: 'Only for monthly rentals. Daily and weekly bookings need no deposit.' },
  { q: 'Is fuel included?', a: 'The bike comes with some fuel to get you started. After that, fuel is on you.' },
  { q: 'What if something breaks?', a: 'Message us. We repair or swap the bike, usually the same day.' },
  { q: 'How do I pay?', a: 'Cash, bank transfer, QRIS or card. Payment on delivery.' },
];

/** Syarat sewa (langkah 2 sheet booking). */
export const TERMS = [
  'Riders must hold a valid motorcycle licence, or an International Driving Permit with a motorcycle category.',
  'Two helmets and a raincoat are included at no cost. Wearing a helmet is required by law in Bali.',
  'Fuel is not included. The scooter arrives with enough fuel to reach the nearest station.',
  'The renter is responsible for traffic fines, and for damage or loss during the rental period.',
  'Report a breakdown or accident to us straight away. We repair or swap the scooter as soon as we can.',
  'No deposit for daily and weekly rentals. Monthly rentals need a deposit, agreed before delivery.',
  `Top box and surf rack are Rp 350.000 each, on rentals of ${PAID_ADDON_MIN_DAYS} days or more, fitting included.`,
  'Payment is due on delivery: cash, bank transfer, QRIS or card. Extensions are charged at the same rate.',
  'The scooter is returned at the agreed date, time and place, in the same condition apart from normal wear.',
];
