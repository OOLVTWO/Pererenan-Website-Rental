import { describe, expect, it } from 'vitest';
import { FLEET, findScooter, matchesFilter } from './config';
import {
  addonStates,
  buildBookingMessage,
  calcAddons,
  calcRental,
  formatDate,
  formatRange,
  formatRupiah,
  formatShort,
  normalizeAddons,
  rentalDays,
  todayIso,
  updateDates,
  whatsappUrl,
} from './booking';

const price = (id) => findScooter(id).price;

describe('calcRental — kombinasi paket termurah', () => {
  it('5 hari Fazzio = tarif harian', () => {
    const r = calcRental(price('fazzio-neo-125'), 5);
    expect(r.total).toBe(500000);
    expect(r.label).toBe('5 days · daily rate');
    expect(r.breakdown).toBe('Daily rate × 5');
  });

  it('9 hari = 1 minggu + 2 hari (bila mingguan lebih murah dari 7× harian)', () => {
    const r = calcRental(price('aerox-155'), 9); // 900rb + 2 × 150rb
    expect(r.total).toBe(1200000);
    expect(r.breakdown).toBe('1 week + 2 days');
    expect(r.label).toBe('9 days · weekly rate applied');
  });

  it('35 hari = 1 bulan + 5 hari', () => {
    const r = calcRental(price('fazzio-neo-125'), 35); // 1,9jt + 5 × 100rb
    expect(r.total).toBe(2400000);
    expect(r.breakdown).toBe('1 month + 5 days');
    expect(r.label).toBe('35 days · monthly rate applied');
  });

  it('tidak memakai paket mingguan bila justru lebih mahal (Fazzio: 7× harian < mingguan)', () => {
    const r = calcRental(price('fazzio-neo-125'), 9);
    expect(r.total).toBe(900000);
    expect(r.plan).toBe('daily');
  });

  it('paket boleh menutup lebih dari durasi bila lebih murah', () => {
    const adv6 = calcRental(price('adv-160'), 6); // 6 × 250rb = 1,5jt > 1 minggu 1,4jt
    expect(adv6.total).toBe(1400000);
    expect(adv6.breakdown).toBe('1 week');
    const fazzio25 = calcRental(price('fazzio-neo-125'), 25); // 25 × 100rb > 1 bulan 1,9jt
    expect(fazzio25.total).toBe(1900000);
    expect(fazzio25.plan).toBe('monthly');
  });

  it('seri harga: pilih yang menutup hari paling pas', () => {
    const r = calcRental(price('scoopy-110'), 6); // 6 × 100rb = 600rb = 1 minggu
    expect(r.total).toBe(600000);
    expect(r.plan).toBe('daily');
  });

  it('tidak pernah lebih mahal dari tarif harian × jumlah hari', () => {
    for (const s of FLEET) {
      for (let d = 1; d <= 70; d++) {
        expect(calcRental(s.price, d).total).toBeLessThanOrEqual(s.price.daily * d);
      }
    }
  });

  it('1 hari tunggal', () => {
    expect(calcRental(price('pcx-160'), 1).label).toBe('1 day · daily rate');
  });
});

describe('add-on', () => {
  it('top box & surf rack terkunci di bawah 7 hari', () => {
    const locked = addonStates(6).filter((a) => a.locked).map((a) => a.id);
    expect(locked).toEqual(['topbox', 'surfrack']);
    expect(addonStates(7).some((a) => a.locked)).toBe(false);
  });

  it('batas jumlah: helm 2, jas hujan 1, top box & surf rack 1', () => {
    expect(normalizeAddons({ helmet: 5, raincoat: 3, topbox: 4, surfrack: 2 }, 10)).toEqual({
      helmet: 2,
      raincoat: 1,
      topbox: 1,
      surfrack: 1,
    });
  });

  it('add-on terkunci dikosongkan dan tidak ikut dihitung', () => {
    const r = calcAddons({ helmet: 2, raincoat: 1, topbox: 1, surfrack: 1 }, 5);
    expect(r.qty.topbox).toBe(0);
    expect(r.total).toBe(0);
  });

  it('begitu terbuka, ikut dihitung di total', () => {
    const r = calcAddons({ helmet: 2, raincoat: 1, topbox: 1, surfrack: 1 }, 7);
    expect(r.total).toBe(700000);
  });
});

describe('tanggal', () => {
  it('jumlah hari inklusif seperti mockup (24–28 Sep = 5 days)', () => {
    expect(rentalDays('2026-09-24', '2026-09-28')).toBe(5);
    expect(rentalDays('2026-09-24', '2026-09-24')).toBe(1);
  });

  it('mengubah jumlah hari menggeser tanggal kembali', () => {
    const s = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { days: 9 }, '2026-09-20');
    expect(s).toEqual({ pickUp: '2026-09-24', returnDate: '2026-10-02', days: 9 });
  });

  it('mengubah tanggal kembali menyesuaikan jumlah hari', () => {
    const s = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { returnDate: '2026-10-28' }, '2026-09-20');
    expect(s.days).toBe(35);
  });

  it('mengubah tanggal ambil menyesuaikan jumlah hari; tanggal kembali ikut maju bila terlewati', () => {
    const a = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { pickUp: '2026-09-26' }, '2026-09-20');
    expect(a).toEqual({ pickUp: '2026-09-26', returnDate: '2026-09-28', days: 3 });
    const b = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { pickUp: '2026-10-10' }, '2026-09-20');
    expect(b).toEqual({ pickUp: '2026-10-10', returnDate: '2026-10-14', days: 5 });
  });

  it('tanggal ambil tidak boleh sebelum hari ini; tanggal kembali tidak sebelum tanggal ambil', () => {
    const a = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { pickUp: '2026-09-01' }, '2026-09-20');
    expect(a.pickUp).toBe('2026-09-20');
    const b = updateDates({ pickUp: '2026-09-24', returnDate: '2026-09-28' }, { returnDate: '2026-09-10' }, '2026-09-20');
    expect(b).toEqual({ pickUp: '2026-09-24', returnDate: '2026-09-24', days: 1 });
  });

  it('tanggal boleh belum dipilih (bilah mulai kosong)', () => {
    const empty = { pickUp: null, returnDate: null };
    expect(updateDates(empty, {}, '2026-09-20')).toEqual({ pickUp: null, returnDate: null, days: null });
    const a = updateDates(empty, { pickUp: '2026-09-24' }, '2026-09-20');
    expect(a).toEqual({ pickUp: '2026-09-24', returnDate: null, days: null });
    expect(updateDates(a, { returnDate: '2026-09-28' }, '2026-09-20').days).toBe(5);
    // Lama sewa lewat stepper butuh tanggal ambil; tanpa itu tidak berubah.
    expect(updateDates(empty, { days: 5 }, '2026-09-20').returnDate).toBe(null);
    expect(updateDates(a, { days: 3 }, '2026-09-20')).toEqual({ pickUp: '2026-09-24', returnDate: '2026-09-26', days: 3 });
  });

  it('tanggal kembali dipilih duluan lalu terlewati tanggal ambil → dikosongkan', () => {
    const r = updateDates({ pickUp: null, returnDate: '2026-09-25' }, { pickUp: '2026-10-01' }, '2026-09-20');
    expect(r).toEqual({ pickUp: '2026-10-01', returnDate: null, days: null });
  });

  it('format tanggal & rentang', () => {
    expect(formatDate('2026-09-24')).toBe('24 Sep 2026');
    expect(formatRange('2026-09-24', '2026-09-28')).toBe('24 – 28 Sep 2026');
    expect(formatRange('2026-09-30', '2026-10-03')).toBe('30 Sep – 3 Oct 2026');
    expect(formatRange('2026-12-30', '2027-01-02')).toBe('30 Dec 2026 – 2 Jan 2027');
    expect(todayIso(new Date(2026, 8, 27, 23, 30))).toBe('2026-09-27');
  });
});

describe('format harga', () => {
  it('rupiah & ringkas seperti kartu mockup', () => {
    expect(formatRupiah(500000)).toBe('Rp 500.000');
    expect(formatRupiah(12500000)).toBe('Rp 12.500.000');
    expect(formatShort(800000)).toBe('800rb');
    expect(formatShort(1500000)).toBe('1,5jt');
    expect(formatShort(1200000)).toBe('1,2jt');
  });
});

describe('filter armada', () => {
  it('chip filter', () => {
    const names = (id) => FLEET.filter((s) => matchesFilter(s, id)).map((s) => s.name);
    expect(names('all')).toHaveLength(7);
    expect(names('under150')).toEqual(['Fazzio Neo 125', 'Scoopy 110', 'Fazzio Lux 125']);
    expect(names('small')).toEqual(['Fazzio Neo 125', 'Scoopy 110', 'Fazzio Lux 125']);
    expect(names('big')).toEqual(['NMAX Neo 155', 'Aerox 155', 'PCX 160', 'ADV 160']);
  });
});

describe('pesan WhatsApp', () => {
  const msg = buildBookingMessage({
    scooter: findScooter('nmax-neo-155'),
    pickUp: '2026-10-01',
    returnDate: '2026-10-09',
    addons: { helmet: 2, raincoat: 1, topbox: 1, surfrack: 0 },
    area: 'Canggu',
  });

  it('memuat model, tanggal, durasi, paket, add-on, total, area', () => {
    expect(msg).toContain('Scooter: NMAX Neo 155');
    expect(msg).toContain('Pick-up: 1 Oct 2026');
    expect(msg).toContain('Return: 9 Oct 2026');
    expect(msg).toContain('Duration: 9 days');
    expect(msg).toContain('Rate: Daily rate × 9 (daily rate) — Rp 1.800.000');
    expect(msg).toContain('• Helmet × 2 — free');
    expect(msg).toContain('• Raincoat — free');
    expect(msg).toContain('• Top box (Shad) — Rp 350.000');
    expect(msg).not.toContain('Surf rack');
    expect(msg).toContain('Delivery area: Canggu (free)');
    expect(msg).toContain('Total: Rp 2.150.000');
  });

  it('link wa.me ter-encode', () => {
    expect(whatsappUrl('Hi & bye')).toBe('https://wa.me/6281237109751?text=Hi%20%26%20bye');
    expect(whatsappUrl()).toBe('https://wa.me/6281237109751');
  });
});
