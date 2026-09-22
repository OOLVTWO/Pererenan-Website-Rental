'use client';

/**
 * Form transaksi (tambah/edit) — dipisah dari halaman Transaksi dan dimuat
 * hanya saat dibuka (next/dynamic), supaya halaman daftar lebih ringan.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import RupiahInput from '@/components/ui/RupiahInput';
import { createClient } from '@/lib/supabase/client';
import { getLocalDateStr } from '@/lib/finance';
import { COUNTRY_CODES, getFlagImageUrl } from '@/lib/countryCodes';
import { getPaymentMethods } from '@/lib/paymentMethods';
import { fetchCustomers } from '@/lib/customers';
import { uploadHandoverPhoto, resolvePhotoSrc, removeHandoverPhoto } from '@/lib/handoverPhoto';


// ===== TRANSACTION MODAL =====
// ===== TRANSACTION MODAL =====
// Ganti seluruh function TransactionModal dari baris 9568 sampai 10170
// (dari "function TransactionModal" sampai "}" penutupnya, sebelum "// ===== MODAL KIRIM INVOICE WHATSAPP =====")

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}


const BRANDS = [
  { key: 'honda',    label: 'Honda',          icon: 'fa-solid fa-motorcycle', color: '#1E3A8A' },
  { key: 'yamaha',   label: 'Yamaha',          icon: 'fa-solid fa-motorcycle', color: '#3B82F6' },
  { key: 'suzuki',   label: 'Suzuki',          icon: 'fa-solid fa-motorcycle', color: '#1E40AF' },
  { key: 'kawasaki', label: 'Kawasaki',        icon: 'fa-solid fa-motorcycle', color: '#1D4ED8' },
  { key: 'vespa',    label: 'Vespa / Piaggio', icon: 'fa-solid fa-person-biking', color: '#1D4ED8' },
  { key: 'other',    label: 'Merek Lain',      icon: 'fa-solid fa-circle-question', color: '#5B6474' },
];

// ===== BRAND-FIRST VEHICLE PICKER =====
function VehicleCombobox({ vehicles, value, onChange }) {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [query, setQuery] = useState('');

  const selected = vehicles.find(v => v.id === value);

  // FIX: Motor tanpa category ditampilkan di bucket 'other' bukan default 'honda',
  // supaya tidak tersembunyi dan user tetap bisa memilihnya.
  const getVehicleCategory = (v) => (v.category && v.category.trim() !== '') ? v.category : 'other';

  // Adjust state saat render (pola resmi React) — menggantikan useEffect
  const [prevSelectedId, setPrevSelectedId] = useState(null);
  const selectedId = selected?.id ?? null;
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    if (selected && !selectedBrand) {
      setSelectedBrand(getVehicleCategory(selected));
    }
  }

  const brandVehicles = selectedBrand
    ? vehicles.filter(v => getVehicleCategory(v) === selectedBrand)
    : [];

  const filteredVehicles = brandVehicles.filter(v => {
    const q = query.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || v.plate_number.toLowerCase().includes(q);
  });

  const brandMeta = (key) => BRANDS.find(b => b.key === key) || BRANDS[BRANDS.length - 1];

  const handleBrandSelect = (key) => {
    setSelectedBrand(key);
    setQuery('');
    if (value) {
      const currentVehicle = vehicles.find(v => v.id === value);
      // FIX: gunakan getVehicleCategory agar konsisten dengan filter di atas
      if (currentVehicle && getVehicleCategory(currentVehicle) !== key) {
        onChange('');
      }
    }
  };

  const handleVehicleSelect = (id) => {
    onChange(id);
    setQuery('');
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Pilih Kendaraan Motor <span className="required">*</span>
      </label>

      {/* STEP 1: Brand Filter Buttons */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
          Langkah 1 — Pilih Merek Motor
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {BRANDS.map(brand => {
            const count = vehicles.filter(v => getVehicleCategory(v) === brand.key).length;
            const isActive = selectedBrand === brand.key;
            return (
              <button
                key={brand.key}
                type="button"
                onClick={() => handleBrandSelect(brand.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  border: `1px solid ${isActive ? brand.color : 'var(--bg-border)'}`,
                  background: isActive ? `${brand.color}22` : 'var(--bg-elevated)',
                  color: isActive ? brand.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon fa={brand.icon} style={{ fontSize: '12px' }} />
                {brand.label}
                {count > 0 && (
                  <span style={{
                    background: isActive ? brand.color : 'var(--bg-hover)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Motor List under selected brand */}
      {selectedBrand && (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
            <Icon fa="fa-solid fa-list" style={{ marginRight: '4px' }} />
            Langkah 2 — Pilih Motor {brandMeta(selectedBrand).label}
            {' '}({brandVehicles.length} unit tersedia)
          </div>

          {brandVehicles.length > 3 && (
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama atau plat nomor..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
              <Icon fa="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '12px' }} />
            </div>
          )}

          {filteredVehicles.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              background: 'var(--bg-elevated)',
              borderRadius: '10px',
              border: '1px dashed var(--bg-border)',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              <Icon fa="fa-solid fa-motorcycle" style={{ fontSize: '24px', display: 'block', marginBottom: '6px', opacity: 0.4 }} />
              {brandVehicles.length === 0
                ? `Belum ada motor ${brandMeta(selectedBrand).label} yang tersedia untuk disewa.`
                : 'Tidak ada motor yang cocok dengan pencarian.'}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {filteredVehicles.map(v => {
                const isSelected = value === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleVehicleSelect(v.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--bg-border)'}`,
                      background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {v.image_url ? (
                        <img src={v.image_url} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <Icon fa="fa-solid fa-motorcycle" style={{ fontSize: '16px', color: 'var(--brand-primary)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--brand-primary-light)', fontWeight: 600 }}>{v.plate_number}</span> • {formatRupiah(v.rate_per_day)}/hr
                      </div>
                    </div>
                    {isSelected && (
                      <Icon fa="fa-solid fa-circle-check" style={{ color: 'var(--brand-primary)', fontSize: '16px', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Show currently selected motor badge if brand not picked yet */}
      {selected && !selectedBrand && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Terpilih: <strong>{selected.name} ({selected.plate_number})</strong>
        </div>
      )}
    </div>
  );
}

// ===== SEARCHABLE COUNTRY CODE PICKER WITH FLAG CDN =====
function CountryCodePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  const filtered = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <div style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-control"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderColor: 'var(--bg-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={getFlagImageUrl(currentCountry.iso)}
            alt={currentCountry.country}
            style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span>{currentCountry.code}</span>
        </div>
        <Icon fa={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '11px', color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '270px',
          maxHeight: '280px',
          background: '#0F172A',
          border: '1px solid var(--brand-primary)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--bg-border)' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari 221 negara / kode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ fontSize: '12px', padding: '6px 10px' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tidak ditemukan
              </div>
            ) : (
              filtered.map(c => {
                const isSelected = c.code === value;
                return (
                  <div
                    key={`${c.iso}-${c.code}`}
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                      color: isSelected ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    <img
                      src={getFlagImageUrl(c.iso)}
                      alt={c.country}
                      style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <strong style={{ minWidth: '42px' }}>{c.code}</strong>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.country}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SEARCHABLE REGISTERED CUSTOMER PICKER COMBOBOX =====
function CustomerPickerCombobox({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const data = await fetchCustomers(supabase);
        setCustomers(data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = customers.filter(c => {
    const q = query.toLowerCase();
    return !q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.id_number && c.id_number.toLowerCase().includes(q));
  });

  const handlePick = (cust) => {
    setSelectedCust(cust);
    onSelectCustomer(cust);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div style={{ marginBottom: '16px', background: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '12px', padding: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary-light)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><Icon fa="fa-solid fa-users" style={{ marginRight: '6px' }} /> Auto-Fill Customer Terdaftar</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{customers.length} customer tersimpan</span>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Cari nama, WA, atau KTP customer pernah menyewa untuk auto-fill..."
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          style={{ fontSize: '13px', paddingLeft: '36px', background: 'var(--bg-elevated)' }}
        />
        <Icon fa="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }} />

        {isOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsOpen(false)}></div>
            <div className="autofill-dropdown-list" style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              maxHeight: '220px', overflowY: 'auto', background: 'var(--bg-card)',
              border: '1.5px solid var(--brand-primary)', borderRadius: '10px',
              zIndex: 999, boxShadow: '0 12px 35px rgba(0,0,0,0.35)', padding: '6px'
            }}>
              {loading ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Memuat data customer...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tidak ada customer cocok. Isi nama manual di bawah untuk customer baru.
                </div>
              ) : (
                filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handlePick(c)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '4px', background: 'var(--bg-elevated)', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.customer_image_url ? (
                          <img src={c.customer_image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Icon fa="fa-solid fa-user" style={{ fontSize: '14px', color: 'var(--brand-primary)' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.name}
                          {(c.total_rentals || 0) > 1 && (
                            <span style={{ fontSize: '9px', background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                              <Icon fa="fa-solid fa-crown" style={{ marginRight: '2px' }} /> Loyal ({c.total_rentals}x)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          WA: <span style={{ color: '#1D4ED8' }}>{c.phone}</span> {c.id_number ? `• KTP: ${c.id_number}` : ''}
                        </div>
                      </div>
                    </div>

                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px 10px' }}>
                      Pilih Auto-Fill
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {selectedCust && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#1D4ED8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><Icon fa="fa-solid fa-circle-check" style={{ marginRight: '6px' }} /> Terpilih: <strong>{selectedCust.name}</strong> ({selectedCust.phone})</span>
          <button type="button" onClick={() => setSelectedCust(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Reset</button>
        </div>
      )}
    </div>
  );
}

export default function TransactionModal({ isOpen, onClose, onSubmit, vehicles, editData }) {
  const [form, setForm] = useState({
    vehicle_id: '',
    renter_name: '',
    renter_phone: '',
    renter_id_number: '',
    renter_address: '',
    start_date: '',
    end_date: '',
    deposit: '',
    discount: '',
    handover_image_url: '',
    payment_method: 'cash',
    payment_status: 'paid',
    status: 'active',
    notes: '',
  });

  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoClient = useMemo(() => createClient(), []);
  const pendingUploadRef = useRef(null);   // foto yang sudah diunggah tapi belum disimpan
  const [photoChanged, setPhotoChanged] = useState(false);
  const [handoverPreview, setHandoverPreview] = useState(null);

  // Ubah nilai kolom foto (referensi Storage / base64 lama) jadi src yang bisa ditampilkan.
  useEffect(() => {
    let cancelled = false;
    const value = form.handover_image_url;
    Promise.resolve().then(async () => {
      if (!value) { if (!cancelled) setHandoverPreview(null); return; }
      try {
        const src = await resolvePhotoSrc(photoClient, value);
        if (!cancelled) setHandoverPreview(src);
      } catch {
        if (!cancelled) setHandoverPreview(null);
      }
    });
    return () => { cancelled = true; };
  }, [form.handover_image_url, photoClient]);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Kalkulasi harga otomatis: pilih kombinasi termurah daily/weekly/monthly ──
  const calcBestPrice = (vehicle, startDate, endDate) => {
    if (!vehicle || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end < start) return 0;

    const days   = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const daily  = Number(vehicle.rate_per_day)   || 0;
    const weekly = Number(vehicle.rate_per_week)  || 0;
    const monthly= Number(vehicle.rate_per_month) || 0;

    let best = days * daily;

    if (weekly > 0) {
      const mix  = Math.floor(days / 7) * weekly + (days % 7) * daily;
      const flat = Math.ceil(days / 7) * weekly;
      best = Math.min(best, mix, flat);
    }

    if (monthly > 0) {
      const months   = Math.floor(days / 30);
      const remDays  = days % 30;
      const effWeek  = weekly > 0 ? weekly : daily * 7;
      const mix2     = months * monthly + Math.floor(remDays / 7) * effWeek + (remDays % 7) * daily;
      const flat2    = Math.ceil(days / 30) * monthly;
      best = Math.min(best, mix2, flat2);
    }

    return best;
  };

  const handleSelectCustomer = (cust) => {
    setForm(prev => ({
      ...prev,
      renter_name: cust.name || prev.renter_name,
      renter_phone: cust.phone || prev.renter_phone,
      renter_id_number: cust.id_number || prev.renter_id_number,
      renter_address: cust.address || prev.renter_address,
    }));

    if (cust.phone) {
      const parts = cust.phone.trim().split(' ');
      if (parts.length > 1 && parts[0].startsWith('+')) {
        setCountryCode(parts[0]);
        setPhoneNumber(parts.slice(1).join(' '));
      } else {
        setCountryCode('+62');
        setPhoneNumber(cust.phone);
      }
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!isOpen) return;
      if (editData) {
        setForm({
          vehicle_id: editData.vehicle_id || '',
          renter_name: editData.renter_name || '',
          renter_phone: editData.renter_phone || '',
          renter_id_number: editData.renter_id_number || '',
          renter_address: editData.renter_address || '',
          start_date: editData.start_date || '',
          end_date: editData.end_date || '',
          deposit: editData.deposit || '',
          discount: editData.discount || '',
          handover_image_url: editData.handover_image_url || '',
          payment_method: editData.payment_method || 'cash',
          payment_status: editData.payment_status || 'paid',
          status: editData.status || 'active',
          notes: editData.notes || '',
        });
        setTotalPrice(editData.total_price || 0);

        if (editData.renter_phone) {
          const parts = editData.renter_phone.trim().split(' ');
          if (parts.length > 1 && parts[0].startsWith('+')) {
            setCountryCode(parts[0]);
            setPhoneNumber(parts.slice(1).join(' '));
          } else {
            setCountryCode('+62');
            setPhoneNumber(editData.renter_phone);
          }
        } else {
          setCountryCode('+62');
          setPhoneNumber('');
        }
      } else {
        setForm({
          vehicle_id: '',
          renter_name: '',
          renter_phone: '+62 ',
          renter_id_number: '',
          renter_address: '',
          start_date: getLocalDateStr(),
          end_date: '',
          deposit: '',
          discount: '',
          handover_image_url: '',
          payment_method: 'cash',
          payment_status: 'paid',
          status: 'active',
          notes: '',
        });
        setCountryCode('+62');
        setPhoneNumber('');
        setTotalPrice(0);
      }
      setPhotoChanged(false);
      pendingUploadRef.current = null;
    });
  }, [editData, isOpen]);

  // ── Recalculate harga saat motor / tanggal / diskon berubah ──
  const priceKey = [form.vehicle_id, form.start_date, form.end_date, form.discount, vehicles.length].join('|');
  const [prevPriceKey, setPrevPriceKey] = useState(null);
  if (priceKey !== prevPriceKey) {
    setPrevPriceKey(priceKey);
    if (form.vehicle_id && form.start_date && form.end_date) {
      const vehicle = vehicles.find(v => v.id === form.vehicle_id);
      if (vehicle) {
        const gross = calcBestPrice(vehicle, form.start_date, form.end_date);
        const disc  = parseFloat(form.discount) || 0;
        setTotalPrice(Math.max(0, gross - disc));

      }
    } else {
      setTotalPrice(0);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Foto serah terima: dikompres lalu langsung diunggah ke Supabase Storage.
  // Kolom hanya menyimpan referensi pendek; file yang diunggah tapi batal
  // disimpan akan dihapus lagi saat modal ditutup.
  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadHandoverPhoto(photoClient, file);
      if (pendingUploadRef.current) removeHandoverPhoto(photoClient, pendingUploadRef.current);
      pendingUploadRef.current = ref;
      setPhotoChanged(true);
      setForm(prev => ({ ...prev, handover_image_url: ref }));
    } catch (err) {
      alert(err.message || 'Gagal memproses gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    if (pendingUploadRef.current) {
      removeHandoverPhoto(photoClient, pendingUploadRef.current);
      pendingUploadRef.current = null;
    }
    setPhotoChanged(true);
    setForm(p => ({ ...p, handover_image_url: '' }));
  };

  const handleClose = () => {
    if (pendingUploadRef.current) {
      removeHandoverPhoto(photoClient, pendingUploadRef.current);
      pendingUploadRef.current = null;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanVehicleId = (form.vehicle_id || '').trim();
    if (!cleanVehicleId) {
      alert('Silakan pilih unit motor terlebih dahulu!');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    const cleanVehicleId = (form.vehicle_id || '').trim();
    setShowConfirm(false);
    setLoading(true);
    // Saat edit, kolom foto hanya dikirim kalau memang diubah (mencegah foto terhapus tanpa sengaja).
    const { handover_image_url, ...rest } = form;
    const payload = { ...rest, vehicle_id: cleanVehicleId, total_price: totalPrice };
    if (!editData || photoChanged) payload.handover_image_url = handover_image_url || null;
    const ok = await onSubmit(payload);
    if (ok !== false) pendingUploadRef.current = null;
    setLoading(false);
  };

  if (!isOpen) return null;

  const availableVehicles = vehicles.filter(v =>
    v.status === 'available' || (editData && v.id === editData.vehicle_id)
  );
  const noVehiclesAvailable = availableVehicles.length === 0;
  const selectedVehicleObj = vehicles.find(v => v.id === form.vehicle_id);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {editData ? (
                <><Icon fa="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }} /> Edit Transaksi</>
              ) : (
                <><Icon fa="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Transaksi Baru</>
              )}
            </div>
            <div className="modal-subtitle">Isi data penyewaan motor & customer</div>
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Auto-fill Customer ── */}
          {!editData && (
            <CustomerPickerCombobox onSelectCustomer={handleSelectCustomer} />
          )}

          {/* ── Pilih Motor ── */}
          {noVehiclesAvailable && !editData ? (
            <div style={{ padding: '16px', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.35)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1E3A8A' }}>
              <Icon fa="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px', flexShrink: 0 }} />
              <div>
                <strong>Semua motor sedang disewa atau dalam perawatan.</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Selesaikan transaksi aktif terlebih dahulu, atau ubah status motor di halaman Kendaraan.
                </div>
              </div>
            </div>
          ) : (
            <VehicleCombobox
              vehicles={availableVehicles}
              value={form.vehicle_id}
              onChange={(id) => setForm(prev => ({ ...prev, vehicle_id: (id || '').trim() }))}
            />
          )}

          {/* ── Nama & No. HP ── */}
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-name">
                Nama Penyewa <span className="required">*</span>
              </label>
              <input id="tx-name" name="renter_name" type="text" className="form-control" placeholder="Nama lengkap penyewa" value={form.renter_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-phone">
                No. WhatsApp <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                <CountryCodePicker
                  value={countryCode}
                  onChange={(newCode) => {
                    setCountryCode(newCode);
                    setForm(prev => ({ ...prev, renter_phone: `${newCode} ${phoneNumber}` }));
                  }}
                />
                <input
                  id="tx-phone"
                  name="phone_number"
                  type="tel"
                  className="form-control"
                  style={{ flex: 1, minWidth: 0 }}
                  placeholder="812345678"
                  value={phoneNumber}
                  onChange={e => {
                    const newNum = e.target.value;
                    setPhoneNumber(newNum);
                    setForm(prev => ({ ...prev, renter_phone: `${countryCode} ${newNum}` }));
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Tanggal Mulai & Selesai ── */}
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-start">
                Tanggal Mulai <span className="required">*</span>
              </label>
              <input id="tx-start" name="start_date" type="date" className="form-control" value={form.start_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-end">
                Tanggal Selesai <span className="required">*</span>
              </label>
              <input id="tx-end" name="end_date" type="date" className="form-control" value={form.end_date} onChange={handleChange} min={form.start_date} required />
            </div>
          </div>

          {/* ── Alamat ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-address">
              Alamat / Villa / Hotel
            </label>
            <input id="tx-address" name="renter_address" type="text" className="form-control" placeholder="e.g. Villa Bamboo, Jl. Pererenan" value={form.renter_address || ''} onChange={handleChange} />
          </div>

               {/* ── Status Pembayaran ── */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              Status Pembayaran <span className="required">*</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setForm(prev => ({ ...prev, payment_status: 'paid' }))}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: `2px solid ${form.payment_status !== 'unpaid' ? '#1D4ED8' : 'var(--bg-border)'}`, background: form.payment_status !== 'unpaid' ? 'rgba(29,78,216,0.15)' : 'var(--bg-elevated)', color: form.payment_status !== 'unpaid' ? '#1D4ED8' : 'var(--text-secondary)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon fa="fa-solid fa-circle-check" /> Lunas / Paid
              </button>
              <button type="button" onClick={() => setForm(prev => ({ ...prev, payment_status: 'unpaid' }))}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: `2px solid ${form.payment_status === 'unpaid' ? '#1E40AF' : 'var(--bg-border)'}`, background: form.payment_status === 'unpaid' ? 'rgba(30,64,175,0.15)' : 'var(--bg-elevated)', color: form.payment_status === 'unpaid' ? '#1E40AF' : 'var(--text-secondary)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon fa="fa-solid fa-clock" /> Belum Bayar
              </button>
            </div>
            {form.payment_status === 'unpaid' && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(30,64,175,0.08)', borderRadius: '8px', border: '1px solid rgba(30,64,175,0.3)', fontSize: '12px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon fa="fa-solid fa-triangle-exclamation" />
                Motor tetap tidak tersedia. Pembayaran <strong>belum masuk</strong> ke laporan pendapatan.
              </div>
            )}
          </div>

          {/* ── Info harga otomatis (muncul setelah motor + tanggal dipilih) ── */}
          {totalPrice > 0 && (
            <div style={{ padding: '12px 16px', background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.25)', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon fa="fa-solid fa-calculator" style={{ color: '#1D4ED8' }} />
                Harga Terbaik Otomatis
                {form.discount > 0 && <span style={{ fontSize: '11px', color: '#1E40AF' }}>(sudah potong diskon)</span>}
              </div>
              <strong style={{ fontSize: '20px', color: '#1D4ED8', letterSpacing: '-0.5px' }}>
                {formatRupiah(totalPrice)}
              </strong>
            </div>
          )}

          {/* ── Diskon | Deposit | Metode Bayar ── */}
          <div className="form-row cols-3">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-discount">
                Diskon (Rp)
              </label>
              <RupiahInput id="tx-discount" value={form.discount} onChange={v => setForm(prev => ({ ...prev, discount: v }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-deposit">
                Deposit (Rp)
              </label>
              <RupiahInput id="tx-deposit" value={form.deposit} onChange={v => setForm(prev => ({ ...prev, deposit: v }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-payment">
                Metode Bayar
              </label>
              <select id="tx-payment" name="payment_method" className="form-control" value={form.payment_method} onChange={handleChange}>
                {getPaymentMethods().filter(m => m.active).map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          
     
          {/* ── Catatan ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-notes">
              Catatan Tambahan
            </label>
            <textarea id="tx-notes" name="notes" className="form-control" rows={2} placeholder="Catatan khusus, permintaan khusus, dll..." value={form.notes} onChange={handleChange} style={{ resize: 'vertical' }} />
          </div>

          {/* ── Identitas & foto serah terima — bagian tetap, tidak wajib diisi ── */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-id-num">
                No. Paspor / KTP / SIM <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(boleh dikosongkan)</span>
              </label>
              <input id="tx-id-num" name="renter_id_number" type="text" className="form-control" placeholder="mis. C1234567 — boleh dikosongkan" value={form.renter_id_number} onChange={handleChange} />
            </div>

            {/* Foto Serah Terima (1 foto: penyewa + motor) — disimpan di Supabase Storage */}
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-primary-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon fa="fa-solid fa-camera-retro" /> Foto Serah Terima
            </div>
            <div className="form-group mb-0">
              <label className="form-label" style={{ fontSize: '12px' }}>
                Foto penyewa + motor saat serah terima (boleh dikosongkan)
              </label>
              {form.handover_image_url ? (
                <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '180px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #3B82F6', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {handoverPreview ? (
                    <img src={handoverPreview} alt="Serah terima" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon fa="fa-solid fa-spinner fa-spin" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <button type="button" onClick={handleRemovePhoto} title="Hapus foto"
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(30,58,138,0.9)', color: '#FFF', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 800, fontSize: '12px' }}>✕</button>
                  <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(15,23,42,0.9)', color: '#3B82F6', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>✓ Foto tersimpan</span>
                </div>
              ) : (
                <div>
                  <input type="file" accept="image/*" id="tx-handover-photo-input" onChange={handleImageFile} style={{ display: 'none' }} disabled={uploading} />
                  <label htmlFor="tx-handover-photo-input" className="custom-file-btn"
                    style={{ height: '100px', maxWidth: '360px', flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #3B82F6', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', padding: '12px', textAlign: 'center' }}>
                    <Icon fa="fa-solid fa-camera" style={{ fontSize: '22px', color: '#3B82F6' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '6px' }}>Ambil / pilih foto serah terima</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Penyewa bersama motor</span>
                  </label>
                </div>
              )}
            </div>

            {uploading && (
              <div style={{ fontSize: '11px', color: 'var(--brand-primary-light)', marginTop: '8px', textAlign: 'center' }}>
                <Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }} /> Mengompres & mengunggah foto...
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {loading ? (
                <><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }} /> Menyimpan...</>
              ) : (
                <><Icon fa="fa-solid fa-floppy-disk" style={{ marginRight: '4px' }} /> Simpan Transaksi</>
              )}
            </button>
          </div>

        </form>

        {/* ── Modal Konfirmasi Simpan ── */}
        {showConfirm && (
          <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowConfirm(false)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--bg-border)', paddingBottom: '16px' }}>
                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 800 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(29,78,216,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon fa="fa-solid fa-floppy-disk" style={{ color: '#1D4ED8', fontSize: '16px' }} />
                  </div>
                  {editData ? 'Konfirmasi Perubahan' : 'Konfirmasi Transaksi Baru'}
                </div>
                <button className="modal-close" onClick={() => setShowConfirm(false)}>✕</button>
              </div>

              <div style={{ padding: '20px 0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--bg-border)', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon fa="fa-solid fa-user" style={{ color: 'var(--brand-primary)', fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{form.renter_name || '—'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Icon fa="fa-solid fa-motorcycle" style={{ marginRight: '5px', fontSize: '11px' }} />
                      {vehicles.find(v => v.id === (form.vehicle_id || '').trim())?.name || '—'}
                      {totalPrice > 0 && (
                        <span style={{ marginLeft: '8px', color: '#1D4ED8', fontWeight: 700 }}>· {formatRupiah(totalPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.25)', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                    {editData ? 'Simpan perubahan data transaksi ini?' : 'Tambahkan transaksi baru ini ke sistem?'}
                  </p>
                </div>

                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon fa="fa-solid fa-circle-info" style={{ fontSize: '11px' }} />
                  Data akan langsung tersimpan ke database.
                </p>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Batal</button>
                <button className="btn btn-primary" onClick={handleConfirmSave}
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon fa="fa-solid fa-floppy-disk" />
                  {editData ? 'Ya, Simpan Perubahan' : 'Ya, Tambah Transaksi'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
