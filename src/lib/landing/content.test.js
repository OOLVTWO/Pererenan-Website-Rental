import { describe, expect, it } from 'vitest';
import { FAQ, FLEET, TERMS, bookingMessage, filterFleet, whatsappUrl } from './content';

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

  it('pesan booking memuat jumlah helm & jas hujan', () => {
    const msg = bookingMessage({ helmets: 1, raincoats: 2 });
    expect(msg).toContain('Helmets: 1 · Raincoats: 2');
    expect(msg).toContain('Scooter: Fazzio Neo 125');
  });
});

describe('isi teks', () => {
  it('5 FAQ dan 9 syarat sewa seperti mockup', () => {
    expect(FAQ).toHaveLength(5);
    expect(TERMS).toHaveLength(9);
  });
});
