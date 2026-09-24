import { describe, it, expect } from 'vitest';
import { calcRental, calcEquipment, availableEquipment, daysBetween, buildWhatsAppMessage } from './booking';

const price = { daily: 100000, weekly: 800000, monthly: 1900000 };

describe('calcRental', () => {
  it('memakai tarif harian untuk sewa pendek', () => {
    expect(calcRental(price, 3).total).toBe(300000);
  });
  it('memakai tarif mingguan saat 7 hari', () => {
    expect(calcRental(price, 7).total).toBe(800000);
  });
  it('9 hari = 1 minggu + 2 hari', () => {
    expect(calcRental(price, 9).total).toBe(800000 + 200000);
  });
  it('tidak pernah lebih mahal dari menaikkan ke paket berikutnya', () => {
    // 6 hari harian = 600rb, masih lebih murah dari mingguan 800rb
    expect(calcRental(price, 6).total).toBe(600000);
    // 30 hari = tarif bulanan
    expect(calcRental(price, 30).total).toBe(1900000);
  });
});

describe('perlengkapan', () => {
  it('box & surf rack terkunci di bawah 28 hari', () => {
    const short = availableEquipment(5);
    expect(short.find(e => e.id === 'topbox').disabled).toBe(true);
    expect(short.find(e => e.id === 'surfrack').disabled).toBe(true);
    expect(short.find(e => e.id === 'helmet').disabled).toBe(false);
  });
  it('terbuka mulai 28 hari', () => {
    expect(availableEquipment(28).find(e => e.id === 'topbox').disabled).toBe(false);
  });
  it('mengabaikan pilihan terkunci & membatasi jumlah maksimum', () => {
    const r = calcEquipment({ helmet: 5, topbox: 1 }, 5);
    expect(r.selection.helmet).toBe(2);
    expect(r.selection.topbox).toBe(0);
    expect(r.total).toBe(0);
  });
  it('menghitung box saat sewa bulanan', () => {
    const r = calcEquipment({ helmet: 2, topbox: 1 }, 30);
    expect(r.total).toBe(350000);
  });
});

describe('daysBetween & pesan WhatsApp', () => {
  it('menghitung jumlah hari, minimal 1', () => {
    expect(daysBetween('2026-09-25', '2026-09-30')).toBe(5);
    expect(daysBetween('2026-09-25', '2026-09-25')).toBe(1);
  });
  it('pesan memuat motor, tanggal, dan peringatan ketersediaan', () => {
    const msg = buildWhatsAppMessage({
      vehicle: { name: 'Fazzio Neo 125' }, startDate: '2026-09-25', endDate: '2026-09-30',
      days: 5, time: '10:00', address: 'Villa Bamboo', equipment: [], rental: 500000, equipmentTotal: 0,
    });
    expect(msg).toContain('Fazzio Neo 125');
    expect(msg).toContain('25 Sep 2026');
    expect(msg).toContain('Estimated total');
    expect(msg).toContain('confirm');
  });
});
