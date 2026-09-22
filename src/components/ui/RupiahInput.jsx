'use client';

/**
 * Input nominal rupiah: menampilkan pemisah ribuan otomatis saat mengetik
 * (100000 → 100.000) dan membuka keyboard angka di HP.
 * Nilai yang dikirim ke induk tetap angka polos (string tanpa titik).
 */
export default function RupiahInput({ value, onChange, id, placeholder = '0', className = 'form-control', ...rest }) {
  const digits = String(value ?? '').replace(/\D/g, '');
  const display = digits ? Number(digits).toLocaleString('id-ID') : '';

  return (
    <div className="rupiah-input">
      <span className="rupiah-prefix" aria-hidden="true">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={className}
        placeholder={placeholder}
        value={display}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        {...rest}
      />
    </div>
  );
}
