import { describe, expect, it } from 'vitest';
import { activeSection } from './nav';

const sections = [
  { id: 'fleet', top: 900 },
  { id: 'how-it-works', top: 2400 },
  { id: 'reviews', top: 3300 },
  { id: 'faq', top: 4000 },
];
const at = (scroll) => sections.map((s) => ({ ...s, top: s.top - scroll }));

describe('activeSection — penanda seksi di navbar', () => {
  it('di atas halaman belum ada seksi aktif (Home)', () => {
    expect(activeSection(at(0), 300, { fallback: 'top' })).toBe('top');
    expect(activeSection(at(0), 300)).toBe(null);
  });

  it('seksi aktif = seksi terakhir yang melewati garis', () => {
    expect(activeSection(at(700), 300)).toBe('fleet');
    expect(activeSection(at(2200), 300)).toBe('how-it-works');
    expect(activeSection(at(3100), 300)).toBe('reviews');
  });

  it('di dasar halaman seksi terakhir aktif', () => {
    expect(activeSection(at(3500), 300, { atBottom: true })).toBe('faq');
  });

  it('daftar kosong aman', () => {
    expect(activeSection([], 300, { atBottom: true, fallback: 'top' })).toBe('top');
  });
});
