import { describe, expect, it } from 'vitest';
import { matchesQuery, sanitizeFilterQuery } from './search';

describe('matchesQuery — cari nama, HP, motor, plat', () => {
  const scoopy = ['Budi Santoso', '0812-3456-789', 'SCOOPY 110 GREY', 'DK 5770 FAB'];

  it('query kosong cocok dengan semua', () => {
    expect(matchesQuery('', scoopy)).toBe(true);
    expect(matchesQuery('   ', scoopy)).toBe(true);
  });

  it('nama motor & penyewa tanpa peduli huruf besar/kecil', () => {
    expect(matchesQuery('scoopy', scoopy)).toBe(true);
    expect(matchesQuery('budi', scoopy)).toBe(true);
    expect(matchesQuery('vario', scoopy)).toBe(false);
  });

  it('plat boleh diketik tanpa spasi atau sebagian', () => {
    expect(matchesQuery('DK 5770 FAB', scoopy)).toBe(true);
    expect(matchesQuery('dk5770fab', scoopy)).toBe(true);
    expect(matchesQuery('5770 fab', scoopy)).toBe(true);
    expect(matchesQuery('fab', scoopy)).toBe(true);
    expect(matchesQuery('dk 5771', scoopy)).toBe(false);
  });

  it('nomor HP tanpa strip', () => {
    expect(matchesQuery('08123456', scoopy)).toBe(true);
  });

  it('field kosong / null aman', () => {
    expect(matchesQuery('dk', [null, undefined, ''])).toBe(false);
  });
});

describe('sanitizeFilterQuery — aman untuk filter .or() PostgREST', () => {
  it('membuang karakter sintaks filter & wildcard', () => {
    expect(sanitizeFilterQuery('budi,status.eq.cancelled')).toBe('budi status.eq.cancelled');
    expect(sanitizeFilterQuery('a(b)"c\'d\\e%f*g')).toBe('a b c d e f g');
  });

  it('merapikan spasi & membatasi panjang', () => {
    expect(sanitizeFilterQuery('  dk   5770  ')).toBe('dk 5770');
    expect(sanitizeFilterQuery('x'.repeat(100))).toHaveLength(60);
  });
});
