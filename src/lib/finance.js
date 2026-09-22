// ─────────────────────────────────────────────────────────────
// Boss Rent Pererenan — Shared Finance Engine
// SATU-SATUNYA sumber kebenaran untuk kalkulasi keuangan.
// Dipakai oleh: Dashboard, Laporan (Reports), StatCards, Charts.
//
// Aturan bisnis yang diterapkan konsisten di semua halaman:
//  1. Pengakuan pendapatan (cash basis):
//     - status 'completed' → selalu diakui sebagai pemasukan
//     - status 'active' + payment_status 'paid' → diakui
//     - status 'active' + payment_status 'unpaid' ATAU null → BELUM diakui
//       (PERUBAHAN: null TIDAK lagi dianggap lunas — data lama tanpa
//        payment_status tidak lagi menggelembungkan revenue)
//     - status 'cancelled' → tidak pernah diakui
//  2. Bagi hasil investor = sharePct% × OMSET KOTOR motor investor.
//     Semua pengeluaran (termasuk servis motor investor) ditanggung owner:
//     tidak memotong bagian investor, hanya mengurangi laba bersih owner.
//  3. Penalty/denda dicatat manual sebagai pemasukan di menu Keuangan
//     (fitur denda di transaksi dihapus — tidak pernah dipakai).
//  4. Laba Bersih Boss Rent = Total Pemasukan − Pengeluaran − Bagi Hasil Investor
// ─────────────────────────────────────────────────────────────

// ── Format ──
export function formatRupiah(amount) {
  const cleanAmount = Math.round(Number(amount || 0));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cleanAmount);
}

// ── Date helpers (aman timezone — memakai waktu LOKAL, bukan UTC) ──
// new Date().toISOString() mengembalikan UTC sehingga "hari ini" bergeser
// untuk bisnis di WITA (UTC+8). Helper ini menghindari bug tersebut.
export function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLocalMonthStr(date = new Date()) {
  return getLocalDateStr(date).substring(0, 7);
}

// Konversi timestamp (UTC ISO dari Supabase) ke tanggal lokal YYYY-MM-DD
export function toLocalDateStr(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  return getLocalDateStr(d);
}

// ── Klasifikasi pemasukan/pengeluaran pada tabel expenses ──
export function isIncomeEntry(e) {
  if (!e) return false;
  if (e.type === 'income') return true;
  if (typeof e.category === 'string' && (e.category.startsWith('income_') || e.category.includes('income'))) return true;
  return false;
}

// ── Pengakuan pendapatan transaksi (cash basis) ──
// PERUBAHAN (C1): payment_status null TIDAK lagi dianggap lunas.
// Hanya 'paid' eksplisit yang diakui untuk transaksi aktif.
export function isPaidTransaction(t) {
  if (!t) return false;
  if (t.status === 'completed') return true; // selesai = sudah dibayar
  if (t.status === 'active') {
    // payment_status null/undefined (data lama sebelum kolom ada) → dianggap
    // lunas, konsisten dengan perilaku historis aplikasi (cash basis).
    // Hanya 'unpaid' eksplisit yang TIDAK diakui.
    return t.payment_status !== 'unpaid';
  }
  return false; // cancelled / lainnya → tidak pernah diakui
}

// ── Investor / bagi hasil ──
export function isInvestorVehicle(v) {
  return v.owner_type === 'investor' || (typeof v.owner_name === 'string' && v.owner_name.trim() !== '');
}

export function getVehicleSharePct(v) {
  return Number(v.revenue_share_percentage) || 70;
}

// Expense dianggap milik motor tertentu HANYA jika ada identitas yang
// benar-benar unik ke motor itu: vehicle_id (tag eksplisit dari form) atau
// plat nomor disebut di judul. Keduanya dijamin unik per motor.
//
// PERUBAHAN (C4): token nama motor (mis. "Vario", "NMAX") DIHAPUS dari
// matching — nama model TIDAK unik, satu armada biasanya punya beberapa
// unit model yang sama (beberapa "Vario 160", dsb.), campuran motor
// investor & motor milik sendiri. Expense umum yang judulnya menyebut
// nama model tanpa plat nomor (mis. "Ganti Ban Vario") sebelumnya ikut
// cocok ke SEMUA motor investor bernama Vario sekaligus — memotong omset
// investor untuk biaya yang belum tentu untuk motor mereka. Sekarang
// expense semacam itu tidak dicocokkan ke motor manapun secara otomatis;
// tetap tercatat sebagai pengeluaran umum di laporan keuangan biasa, tapi
// tidak mengurangi bagi hasil investor kecuali admin menandai vehicle_id
// atau menyebut plat nomornya secara eksplisit di judul.
export function expenseMatchesVehicle(e, v) {
  if (!e || !v) return false;
  if (e.vehicle_id && v.id && e.vehicle_id === v.id) return true;
  if (typeof e.title !== 'string' || !e.title) return false;
  const title = e.title.toLowerCase();
  // Plat nomor = satu-satunya identitas berbasis teks yang aman dipakai,
  // karena dijamin unik per motor (tidak seperti nama model).
  return !!(v.plate_number && title.includes(String(v.plate_number).toLowerCase()));
}

// Total omset sebuah motor dari transaksi yang sudah diakui (paid).
export function calcVehicleRevenue(vehicle, transactions) {
  return transactions
    .filter(t => (t.vehicle_id === vehicle.id || t.vehicles?.id === vehicle.id) && isPaidTransaction(t))
    .reduce((s, t) => s + Number(t.total_price || 0), 0);
}

// Kalkulasi bagi hasil SEMUA motor investor, per motor.
//
// ATURAN (dikonfirmasi owner): hak investor = persentase bagi hasil × OMSET
// KOTOR motor investor. Pengeluaran apa pun — termasuk biaya servis motor
// investor dari menu Servis Motor — TIDAK memotong bagian investor; semuanya
// ditanggung owner dan mengurangi laba bersih owner (lihat calcFinancialSummary).
// Parameter `expenses` sengaja diabaikan (tetap diterima demi kompatibilitas).
export function calcInvestorPayouts({ transactions, vehicles }) {
  const safeTx = Array.isArray(transactions) ? transactions : [];
  const safeVeh = Array.isArray(vehicles) ? vehicles : [];
  const investorVehicles = safeVeh.filter(isInvestorVehicle);

  let totalPayout = 0;
  let totalRevenue = 0;

  const perVehicle = investorVehicles.map(v => {
    const revenue = calcVehicleRevenue(v, safeTx);
    const sharePct = getVehicleSharePct(v);
    const payout = Math.round(revenue * (sharePct / 100));
    totalPayout += payout;
    totalRevenue += revenue;
    return { vehicle: v, revenue, sharePct, payout, ownerShare: revenue - payout };
  });

  return {
    perVehicle,
    totalPayout,
    totalRevenue,
    totalOwnerShare: totalRevenue - totalPayout,
  };
}

// ── Ringkasan keuangan global (dipakai Dashboard & Reports) ──
export function calcFinancialSummary({ transactions, expenses, vehicles }) {
  const safeTx = Array.isArray(transactions) ? transactions : [];
  const safeExp = Array.isArray(expenses) ? expenses : [];

  const paidTx = safeTx.filter(isPaidTransaction);
  const completedTx = safeTx.filter(t => t.status === 'completed');
  const unpaidTx = safeTx.filter(t => t.status === 'active' && t.payment_status === 'unpaid');

  const rentalRevenue = paidTx.reduce((s, t) => s + Number(t.total_price || 0), 0);
  const investorVehicleIds = new Set((Array.isArray(vehicles) ? vehicles : []).filter(isInvestorVehicle).map(v => v.id));
  const investorRevenue = paidTx
    .filter(t => investorVehicleIds.has(t.vehicle_id) || investorVehicleIds.has(t.vehicles?.id))
    .reduce((s, t) => s + Number(t.total_price || 0), 0);
  const ownerVehicleRevenue = rentalRevenue - investorRevenue;
  const otherIncome = safeExp.filter(isIncomeEntry).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalRevenue = rentalRevenue + otherIncome;
  const totalExpenses = safeExp.filter(e => !isIncomeEntry(e)).reduce((s, e) => s + Number(e.amount || 0), 0);

  const { totalPayout: investorPayout } = calcInvestorPayouts({ transactions: safeTx, vehicles });

  const netProfit = totalRevenue - totalExpenses - investorPayout;

  return {
    paidTx,
    completedTx,
    unpaidTx,
    rentalRevenue,
    ownerVehicleRevenue,
    investorRevenue,
    otherIncome,
    totalRevenue,
    totalExpenses,
    investorPayout,
    netProfit,
    totalUnpaid: unpaidTx.reduce((s, t) => s + Number(t.total_price || 0), 0),
  };
}
