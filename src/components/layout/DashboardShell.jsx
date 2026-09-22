'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { startVisiblePolling } from '@/lib/visiblePolling';
import { updateFavicon } from '@/lib/favicon';
import { pullSettings } from '@/lib/appSettings';

function daysLeft(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - today) / 86400000);
}

/**
 * Kerangka panel: sidebar (desktop) · top bar + bar bawah (HP).
 * Satu tema terang saja (toggle gelap/terang dihapus).
 * Jumlah sewa jatuh tempo/terlambat dihitung SEKALI di sini lalu dibagikan
 * ke sidebar & bar bawah (satu polling, kolom ringan saja).
 */
export default function DashboardShell({ user, children }) {
  const [trackingAlerts, setTrackingAlerts] = useState(0);

  useEffect(() => {
    // Ambil pengaturan terbaru dari database (berlaku di semua perangkat)
    pullSettings(createClient()).then(changed => {
      try {
        const biz = JSON.parse(localStorage.getItem('boss_rent_biz_settings') || '{}');
        if (changed && biz.logoUrl) updateFavicon(biz.logoUrl);
      } catch { /* ignore */ }
    });
    try {
      const saved = JSON.parse(localStorage.getItem('boss_rent_biz_settings') || '{}');
      if (saved.logoUrl) updateFavicon(saved.logoUrl);
      // Bersihkan sisa pengaturan tema lama
      localStorage.removeItem('boss_rent_theme');
      document.documentElement.removeAttribute('data-theme');
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('transactions').select('end_date').eq('status', 'active');
        if (Array.isArray(data)) setTrackingAlerts(data.filter(tx => daysLeft(tx.end_date) <= 0).length);
      } catch { /* ignore */ }
    };
    fetchAlerts();
    return startVisiblePolling(fetchAlerts, 60000);
  }, []);

  return (
    <div className="shell">
      <Sidebar user={user} trackingAlerts={trackingAlerts} />
      <div className="shell-main">
        <Header />
        <main className="page-content">{children}</main>
      </div>
      <BottomNav trackingAlerts={trackingAlerts} />
    </div>
  );
}
