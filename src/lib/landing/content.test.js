import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCOOTER,
  FAQ,
  FLEET,
  TERMS,
  bookingMessage,
  bookingTotal,
  filterFleet,
  formatRupiah,
  whatsappUrl,
} from './content';

const names = (list) => list.map((s) => s.name);

describe('filterFleet', () => {
  it('All menampilkan 7 motor sesuai urutan mockup', () => {
    expect(names(filterFleet(0))).toEqual(names(FLEET));
    expect(FLEET).toHaveLength(7);
  });

  it('Under 150k = tarif harian di bawah 150k', () => {
    expect(names(filterFleet(1))).toEqual(['Fazzio Neo 125', 'Scoopy 110', 'Fazzio Lux 125']);
  });

  it('110–125cc', () => {
    expect(names(filterFleet(2))).toEqual(['Fazzio Neo 125', 'Scoopy 110', 'Fazzio Lux 125']);
  });

  it('155cc+', () => {
    expect(names(filterFleet(3))).toEqual(['NMAX Neo 155', 'Aerox 155', 'PCX 160', 'ADV 160']);
  });

  it('indeks tidak dikenal kembali ke All', () => {
    expect(filterFleet(99)).toHaveLength(7);
  });
});

describe('whatsappUrl', () => {
  it('tanpa pesan', () => {
    expect(whatsappUrl()).toBe('https://wa.me/6281237109751');
  });

  it('pesan di-encode', () => {
    expect(whatsappUrl("Hi & I'd like")).toBe('https://wa.me/6281237109751?text=Hi%20%26%20I\'d%20like');
  });

  it('pesan booking memuat motor terpilih, jumlah helm & jas hujan', () => {
    const nmax = FLEET.find((s) => s.name === 'NMAX Neo 155');
    const msg = bookingMessage({ scooter: nmax, helmets: 1, raincoats: 2 });
    expect(msg).toContain('Helmets: 1 · Raincoats: 2');
    expect(msg).toContain('Scooter: NMAX Neo 155');
    expect(msg).toContain('Total: Rp 1.000.000');
  });
});

describe('harga booking', () => {
  it('motor bawaan = motor di mockup, total sama dengan mockup', () => {
    expect(DEFAULT_SCOOTER.name).toBe('Fazzio Neo 125');
    expect(bookingTotal(DEFAULT_SCOOTER)).toBe('Rp 500.000');
  });

  it('total = tarif harian × 5 hari', () => {
    const totals = Object.fromEntries(FLEET.map((s) => [s.name, bookingTotal(s)]));
    expect(totals['PCX 160']).toBe('Rp 1.250.000');
    expect(totals['Fazzio Lux 125']).toBe('Rp 600.000');
  });

  it('format rupiah', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(350000)).toBe('Rp 350.000');
    expect(formatRupiah(12500000)).toBe('Rp 12.500.000');
  });
});

describe('isi teks', () => {
  it('5 FAQ dan 9 syarat sewa seperti mockup', () => {
    expect(FAQ).toHaveLength(5);
    expect(TERMS).toHaveLength(9);
  });
});
