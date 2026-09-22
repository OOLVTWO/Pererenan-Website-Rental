import { describe, it, expect } from 'vitest';
import {
  normalizeServiceLogInput,
  buildServiceExpenseTitle,
} from './serviceLog';
import { fitDimensions } from './imageCompressor';

describe('normalizeServiceLogInput', () => {
  it('membersihkan input', () => {
    const out = normalizeServiceLogInput({
      vehicle_id: 'abc', service_date: '2026-09-22', items: ['Ban', ' Ban ', '', 'Aki'],
      workshop: '  Bengkel A ', cost: '85000', notes: ' ok ',
    });
    expect(out).toEqual({
      vehicle_id: 'abc', service_date: '2026-09-22', items: ['Ban', 'Aki'],
      workshop: 'Bengkel A', cost: 85000, notes: 'ok',
    });
  });
  it('menolak tanggal/biaya tidak valid & tidak menyimpan KM', () => {
    const out = normalizeServiceLogInput({ service_date: '22/09/2026', km: '12000', cost: 'abc' });
    expect(out.service_date).toBeNull();
    expect('km' in out).toBe(false);
    expect(out.cost).toBe(0);
    expect(out.vehicle_id).toBeNull();
  });
});

describe('buildServiceExpenseTitle', () => {
  it('menyertakan plat nomor agar terhubung ke motor', () => {
    expect(buildServiceExpenseTitle({ name: 'Vario 125', plate_number: 'DK 1234 AB' }, ['Ganti oli mesin', 'Busi']))
      .toBe('Servis Motor: Vario 125 (DK 1234 AB) - Ganti oli mesin, Busi');
  });
});

describe('fitDimensions (kompresi foto)', () => {
  it('foto portrait kamera HP dibatasi kedua sisi', () => {
    expect(fitDimensions(3000, 4000, 1280, 1280)).toEqual({ width: 960, height: 1280 });
  });
  it('gaya lama hanya membatasi lebar', () => {
    expect(fitDimensions(1600, 1200, 800)).toEqual({ width: 800, height: 600 });
  });
  it('tidak memperbesar gambar kecil', () => {
    expect(fitDimensions(400, 300, 1280, 1280)).toEqual({ width: 400, height: 300 });
  });
});

import { resolveSupabaseConfig } from './supabase/config';

describe('resolveSupabaseConfig', () => {
  const NEW = 'https://fltfzhcvvfmregcsjovm.supabase.co';
  it('pakai default kalau env kosong', () => {
    expect(resolveSupabaseConfig('', '').url).toBe(NEW);
  });
  it('abaikan URL tidak valid (mis. hanya ID project)', () => {
    const r = resolveSupabaseConfig('fltfzhcvvfmregcsjovm', 'sb_publishable_abcdefghijkl');
    expect(r.url).toBe(NEW);
    expect(r.source).toMatch(/diabaikan/);
  });
  it('abaikan project lama yang sudah dipensiunkan', () => {
    expect(resolveSupabaseConfig('https://eedrziblypwrufdzctvd.supabase.co', 'sb_publishable_abcdefghijkl').url).toBe(NEW);
  });
  it('pakai env kalau valid', () => {
    const r = resolveSupabaseConfig('https://abcdefghijklmnop.supabase.co/', 'sb_publishable_abcdefghijkl');
    expect(r).toEqual({ url: 'https://abcdefghijklmnop.supabase.co', key: 'sb_publishable_abcdefghijkl', source: 'env' });
  });
});
