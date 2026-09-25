/**
 * ════════════════════════════════════════════════════════════════
 * SATU-SATUNYA FILE YANG PERLU DIUBAH UNTUK HALAMAN PUBLIK
 * ════════════════════════════════════════════════════════════════
 * Harga, spesifikasi motor, perlengkapan, ulasan, FAQ, dan info bisnis
 * semuanya di sini. Halaman publik TIDAK menyentuh database sama sekali,
 * jadi tidak ada data admin/transaksi yang bisa bocor ke pengunjung.
 *
 * Foto: taruh di /public/images/landing/ dengan nama yang sama seperti di
 * bawah (format .webp). File yang ada sekarang hanyalah placeholder.
 */

export const BUSINESS = {
  name: 'Boss Rent Pererenan',
  shortName: 'Boss Rent',
  tagline: 'Scooter rental made simple in Bali.',
  intro: '39 automatics, serviced monthly and delivered free to your door in Canggu, Berawa and Pererenan. Helmets on the seat, and your passport stays with you.',
  phoneDisplay: '+62 812-3710-9751',
  phoneE164: '6281237109751',          // dipakai untuk link wa.me
  instagram: '@bossrentpererenan',
  instagramUrl: 'https://instagram.com/bossrentpererenan',
  address: 'Jl. Pantai Pererenan No.119, Mengwi, Badung, Bali 80351',
  mapsUrl: 'https://maps.app.goo.gl/99TuJQd6Ebj2SWY66',
  hours: 'Daily · 08:00 – 20:00',
  deliveryAreas: ['Pererenan', 'Canggu', 'Berawa', 'Seseh', 'Tibubeneng'],
  deliveryNote: 'Outside these areas? Ask us — usually Rp 25–50k.',
};

/** Ringkasan armada untuk pita angka di bawah hero. */
export const STATS = [
  { value: '39', label: 'Scooters ready', note: 'Serviced every month', icon: 'engine' },
  { value: '7', label: 'Models to pick', note: 'From 110cc to 160cc', icon: 'box' },
  { value: '<1h', label: 'Delivery time', note: 'Inside the Canggu area', icon: 'truck' },
  { value: '5.0', label: 'Google rating', note: 'From guests like you', icon: 'star' },
];

/**
 * ARMADA — satu entri per MODEL (bukan per unit).
 * price: harga dalam rupiah penuh. weekly/monthly sudah termasuk diskon.
 * specs ditulis dari spesifikasi umum tiap model — silakan dikoreksi.
 */
export const FLEET = [
  {
    id: 'fazzio-neo-125',
    description: "The Fazzio Neo is the scooter most of our guests end up on. It is light enough to park anywhere along Pantai Pererenan, thrifty on fuel, and easy to handle if you have not ridden in a while. The seat is comfortable for two on short hops to the beach or a cafe.",
    name: 'Fazzio Neo 125',
    photo: '/images/landing/scooter-fazzio.webp',
    tag: 'Most rented',
    riders: '2 riders',
    engine: '125cc · automatic',
    storage: 'Helmet fits under seat',
    blurb: 'Light and thrifty — the easy pick for cafe runs and beach hops around Canggu.',
    price: { daily: 100000, weekly: 800000, monthly: 1900000 },
  },
  {
    id: 'nmax-neo-155',
    description: "The NMAX Neo is the one to take out of Canggu. The longer wheelbase keeps it steady at highway speed, the seat stays comfortable past an hour, and the under-seat space swallows a helmet plus a day bag. A good choice for Uluwatu, Ubud or the east coast.",
    name: 'NMAX Neo 155',
    photo: '/images/landing/scooter-nmax.webp',
    tag: 'Best for long rides',
    riders: '2 riders',
    engine: '155cc · automatic',
    storage: 'Large under-seat storage',
    blurb: 'Stable at speed with a roomy seat. Best for day trips to Uluwatu or Ubud.',
    price: { daily: 200000, weekly: 1500000, monthly: 2600000 },
  },
  {
    id: 'scoopy-110',
    description: "The Scoopy is the smallest and lightest scooter in the fleet, which makes it the easiest first bike in Bali. Low seat height, gentle throttle and simple controls. Best for short rides around Pererenan, Berawa and Canggu rather than long highway runs.",
    name: 'Scoopy 110',
    photo: '/images/landing/scooter-scoopy.webp',
    tag: 'Beginner friendly',
    riders: '2 riders',
    engine: '110cc · automatic',
    storage: 'Small under-seat storage',
    blurb: 'The smallest and lightest we have — great if this is your first scooter.',
    price: { daily: 100000, weekly: 600000, monthly: 1500000 },
  },
  {
    id: 'aerox-155',
    description: "The Aerox is the sporty one: quick off the line, firmer suspension and a riding position that leans forward a little. It rewards confident riders on open roads, and still parks as easily as any other automatic.",
    name: 'Aerox 155',
    photo: '/images/landing/scooter-aerox.webp',
    tag: '',
    riders: '2 riders',
    engine: '155cc · automatic',
    storage: 'Helmet fits under seat',
    blurb: 'Sporty and quick off the line, with a firmer ride than the Fazzio.',
    price: { daily: 150000, weekly: 900000, monthly: 1800000 },
  },
  {
    id: 'pcx-160',
    description: "The PCX has the most comfortable seat we rent, with a smooth engine and a large flat floor for a shopping bag or a backpack. If you plan on long days in the saddle or ride with a passenger often, this is the one to pick.",
    name: 'PCX 160',
    photo: '/images/landing/scooter-pcx.webp',
    tag: 'Most comfortable',
    riders: '2 riders',
    engine: '160cc · automatic',
    storage: 'Large under-seat storage',
    blurb: 'The most comfortable seat in the fleet. Made for longer distances.',
    price: { daily: 250000, weekly: 1200000, monthly: 2300000 },
  },
  {
    id: 'adv-160',
    description: "The ADV sits higher than the rest of the fleet with longer suspension travel, so broken village roads and rainy-season potholes are far less punishing. Useful if you are staying outside the main Canggu strip.",
    name: 'ADV 160',
    photo: '/images/landing/scooter-adv.webp',
    tag: '',
    riders: '2 riders',
    engine: '160cc · automatic',
    storage: 'Large under-seat storage',
    blurb: 'Higher suspension for rough village roads and rainy-season potholes.',
    price: { daily: 250000, weekly: 1400000, monthly: 2500000 },
  },
  {
    id: 'fazzio-lux-125',
    description: "Same easy 125cc ride as the Fazzio Neo, with a smart key, a nicer finish and a slightly softer seat. Pick it if you want the simplest scooter in the fleet with a few extra comforts.",
    name: 'Fazzio Lux 125',
    photo: '/images/landing/scooter-fazzio.webp',
    tag: '',
    riders: '2 riders',
    engine: '125cc · automatic',
    storage: 'Helmet fits under seat',
    blurb: 'Same easy ride as the Neo, with the smart key and a nicer finish.',
    price: { daily: 120000, weekly: 750000, monthly: 1800000 },
  },
];

/** Hari minimum agar dihitung sebagai sewa bulanan (paket harga). */
export const MONTHLY_MIN_DAYS = 28;

/** Hari minimum untuk perlengkapan berbayar (top box & surf rack). */
export const EQUIPMENT_MIN_DAYS = 7;

/**
 * PERLENGKAPAN TAMBAHAN
 * free: ikut gratis, dibatasi max.
 * minDays: hanya bisa dipilih kalau durasi >= jumlah hari tersebut.
 */
export const EQUIPMENT = [
  { id: 'helmet',   name: 'Helmet',        icon: 'helmet', price: 0,      max: 2, free: true,
    note: 'Included with every rental', info: 'Two helmets come free with every scooter.' },
  { id: 'raincoat', name: 'Raincoat',      icon: 'shield', price: 0,      max: 2, free: true,
    note: 'Bali rain comes fast',       info: 'Free, up to two. Wet season runs roughly November to March.' },
  { id: 'topbox',   name: 'Top box (Shad)', icon: 'box',   price: 350000, max: 1, minDays: EQUIPMENT_MIN_DAYS,
    note: 'Lockable box · fitting included',
    info: 'Available from 7 days. Rp 350.000 flat, fitting included.' },
  { id: 'surfrack', name: 'Surf rack',      icon: 'surf',  price: 350000, max: 1, minDays: EQUIPMENT_MIN_DAYS,
    note: 'Carries one board · fitting included',
    info: 'Available from 7 days. Rp 350.000 flat, fitting included.' },
];

export const WHY_US = [
  { icon: 'truck',  title: 'Free delivery', short: 'Canggu · Berawa · Pererenan',
    text: 'We bring the scooter to your villa and collect it again — Canggu, Berawa and Pererenan.' },
  { icon: 'wrench', title: 'Serviced every month', short: 'A service log per bike',
    text: 'Every bike has a service log. No bald tyres, no flat batteries.' },
  { icon: 'helmet', title: 'Helmets & raincoat', short: 'Two helmets, always included',
    text: 'Two helmets and a raincoat with every rental, at no extra cost.' },
  { icon: 'shield', title: 'Your passport stays with you', short: 'A photo is enough',
    text: 'A photo is enough. A deposit is only needed on monthly rentals.' },
];

export const STEPS = [
  { title: 'Choose your scooter', text: 'Pick a model and your dates.' },
  { title: 'Review your booking', text: 'Add-ons, delivery address and total — all on one screen.' },
  { title: 'Send on WhatsApp', text: 'We confirm availability, then deliver to your door.' },
];

/**
 * ⚠️ ULASAN INI MASIH CONTOH (DUMMY) — GANTI SEBELUM DIPUBLIKASIKAN.
 * Ulasan palsu di halaman bisnis menyesatkan calon penyewa dan berisiko untuk
 * reputasi. Cara mengganti: salin 3 ulasan asli dari Google (nama, asal, bulan,
 * isi), lalu set isSample: false.
 */
export const REVIEWS = {
  isSample: false,
  rating: '5.0',
  items: [
    { name: 'Sarah M.', country: 'Australia', date: 'August 2026',
      text: 'Booked on WhatsApp at 9am and the scooter was at our villa before lunch. The bike was spotless and they brought two helmets without us asking.' },
    { name: 'Lukas B.', country: 'Germany', date: 'July 2026',
      text: 'Rented an NMAX for three weeks. Fair monthly price, and when the rear tyre lost air they swapped the bike the same afternoon.' },
    { name: 'Emily R.', country: 'United Kingdom', date: 'September 2026',
      text: 'Easiest rental we had in Bali. No passport held, a clear price, and they picked the scooter up from our hotel on the last day.' },
  ],
};

export const FAQ = [
  { q: 'Do I need an international driving licence?',
    a: 'Officially yes, and police checks do happen around Canggu. If you don’t have one, message us — we can point you to where to get one in Bali.' },
  { q: 'Is a deposit required?',
    a: 'No deposit for rentals under a week. Monthly rentals need a small deposit, returned when you hand the scooter back.' },
  { q: 'Is fuel included?',
    a: 'The scooter arrives with a full tank. Return it however you like — petrol stops are everywhere along the main roads.' },
  { q: 'What if something breaks?',
    a: 'Send us a WhatsApp message. Inside our delivery area we usually swap the bike within the hour.' },
  { q: 'Can you deliver to the airport?',
    a: 'Airport delivery is possible for longer rentals. Ask us on WhatsApp and we’ll confirm the fee.' },
  { q: 'How do I pay?',
    a: 'On delivery — cash, bank transfer or QRIS. Nothing is charged online.' },
];

/**
 * SYARAT & KETENTUAN — ditampilkan sebelum penyewa mengirim permintaan.
 * Ini poin umum rental motor di Bali; sesuaikan dengan aturanmu sendiri.
 */
export const TERMS = [
  'The rider must hold a valid motorcycle licence. An international driving permit is required by Indonesian law and is checked by police.',
  'Helmets must be worn by the rider and passenger at all times. Two helmets are provided free with every rental.',
  'The scooter may only be ridden by the person named in the booking. Lending it to anyone else voids any arrangement we make.',
  'Riding under the influence of alcohol or drugs is strictly forbidden and ends the rental immediately, without refund.',
  'Any damage, loss or theft of the scooter, keys or accessories is the renter’s responsibility. The rental does not include insurance.',
  'A lost key is charged at Rp 500.000; a lost registration document (STNK) is charged at replacement cost.',
  'Fuel is not included. The scooter is delivered with a full tank and may be returned at any level.',
  'Rental is counted per 24 hours from the delivery time. A delay of more than 3 hours is charged as one extra day.',
  'The scooter must not be taken to another island (for example Lombok, Java or Nusa Penida) without our written approval.',
  'A top box or surf rack can be added to rentals of 7 days or more at Rp 350.000 each, fitting included.',
  'Payment is made on delivery in cash, bank transfer or QRIS. Bookings are only confirmed after we reply on WhatsApp.',
];

/** Foto besar (hero & pemisah). Ganti file-nya, nama tetap sama. */
export const IMAGES = {
  hero: '/images/landing/hero.webp',
  divider: '/images/landing/divider.webp',
  map: '/images/landing/map.webp',
};
