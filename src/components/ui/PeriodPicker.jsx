'use client';

import { PERIOD_OPTIONS, getPeriodRange, formatTanggal } from '@/lib/period';

/**
 * Pemilih periode yang dipakai bersama Keuangan & Laporan.
 * value: { key, start, end } — "custom" memunculkan dua input tanggal.
 */
export default function PeriodPicker({ value, onChange, className = '' }) {
  const setKey = (key) => {
    const range = getPeriodRange(key, value);
    onChange({ key, start: range.start, end: range.end });
  };

  return (
    <div className={`period-picker ${className}`}>
      <select
        className="form-control"
        aria-label="Pilih periode"
        value={value.key}
        onChange={e => setKey(e.target.value)}
      >
        {PERIOD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>

      {value.key === 'custom' ? (
        <div className="period-custom">
          <label>
            <span className="form-label">Dari</span>
            <input type="date" className="form-control" value={value.start}
              onChange={e => onChange({ ...value, start: e.target.value })} />
          </label>
          <label>
            <span className="form-label">Sampai</span>
            <input type="date" className="form-control" value={value.end} min={value.start}
              onChange={e => onChange({ ...value, end: e.target.value })} />
          </label>
        </div>
      ) : (
        <span className="period-label">{formatTanggal(value.start)} – {formatTanggal(value.end)}</span>
      )}
    </div>
  );
}
