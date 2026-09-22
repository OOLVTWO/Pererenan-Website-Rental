/**
 * Sinkronisasi pengaturan panel ke database (tabel app_settings).
 *
 * Alasan: semua pengaturan (profil bisnis, metode pembayaran, template
 * WhatsApp) dulu hanya tersimpan di localStorage — artinya pengaturan yang
 * diatur di HP tidak terbawa ke laptop. Sekarang localStorage tetap dipakai
 * sebagai cache cepat (semua komponen membacanya secara sinkron), tetapi
 * nilainya diunggah ke database saat disimpan dan diambil lagi saat panel
 * dibuka di perangkat mana pun.
 */
const ROW_KEY = 'admin_ui';

export const SYNCED_KEYS = [
  'boss_rent_biz_settings',
  'boss_rent_payment_methods',
  'boss_rent_wa_template',
  'boss_rent_wa_reminder_template',
];

function readLocal() {
  const out = {};
  SYNCED_KEYS.forEach(k => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) out[k] = v;
    } catch { /* ignore */ }
  });
  return out;
}

/** Simpan pengaturan perangkat ini ke database (dipanggil setelah user menyimpan). */
export async function pushSettings(supabase) {
  try {
    const value = readLocal();
    if (Object.keys(value).length === 0) return { ok: true };
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: ROW_KEY, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    console.warn('Gagal menyimpan pengaturan ke database:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Ambil pengaturan dari database ke localStorage.
 * @returns {Promise<boolean>} true kalau ada nilai yang berubah di perangkat ini.
 */
export async function pullSettings(supabase) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', ROW_KEY)
      .maybeSingle();
    if (error || !data?.value) return false;

    let changed = false;
    SYNCED_KEYS.forEach(k => {
      const remote = data.value[k];
      if (typeof remote !== 'string') return;
      try {
        if (localStorage.getItem(k) !== remote) {
          localStorage.setItem(k, remote);
          changed = true;
        }
      } catch { /* ignore */ }
    });
    return changed;
  } catch (err) {
    console.warn('Gagal memuat pengaturan dari database:', err.message);
    return false;
  }
}
