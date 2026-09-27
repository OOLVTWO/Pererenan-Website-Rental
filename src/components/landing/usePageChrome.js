import { useEffect } from 'react';
import { activeSection } from '@/lib/landing/nav';

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Perilaku header halaman utama. HTML-nya statis (Hero.jsx); hook ini dipanggil
 * dari BookingIsland supaya tetap satu client component.
 * - Header menempel jadi putih solid begitu halaman digulir (kalau tetap
 *   transparan, teks hero akan lewat di bawahnya dan bertabrakan).
 * - Menu yang seksinya sedang dilihat diberi .is-active (navbar desktop & laci HP).
 * - Laci menu HP: buka/tutup, kunci scroll, Escape, fokus tetap di dalam laci.
 */
export function usePageChrome(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const head = document.querySelector('.lp-head');
    if (!head) return undefined;
    const drawer = document.getElementById('lp-drawer');
    const opener = document.querySelector('[data-lp-menu-open]');
    const root = document.documentElement;
    const links = [...document.querySelectorAll('[data-lp-nav]')];
    const ids = [...new Set(links.map((a) => a.dataset.lpNav))].filter((id) => id !== 'top');
    const desktop = window.matchMedia('(min-width: 720px)');

    let frame = 0;
    const update = () => {
      frame = 0;
      const headH = head.offsetHeight;
      head.classList.toggle('is-solid', window.scrollY > 4);
      const sections = ids
        .map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top }))
        .filter((s) => s.top !== undefined);
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      const current = activeSection(sections, headH + window.innerHeight * 0.3, { atBottom, fallback: 'top' });
      for (const a of links) {
        const on = a.dataset.lpNav === current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    let menuOpen = false;
    let prevOverflow = '';
    const setMenu = (open, restoreFocus = true) => {
      if (!drawer || open === menuOpen) return;
      menuOpen = open;
      drawer.classList.toggle('is-open', open);
      opener?.setAttribute('aria-expanded', String(open));
      if (open) {
        prevOverflow = root.style.overflow;
        root.style.overflow = 'hidden';
        drawer.querySelector('.lp-drawer-close')?.focus({ preventScroll: true });
      } else {
        root.style.overflow = prevOverflow;
        if (restoreFocus) opener?.focus({ preventScroll: true });
      }
    };

    const onClick = (e) => {
      const t = e.target;
      if (t.closest?.('[data-lp-menu-open]')) setMenu(true);
      else if (t.closest?.('[data-lp-menu-close]')) setMenu(false);
      // Pilih menu: laci ditutup dulu, lalu browser menggulir ke seksinya.
      else if (t.closest?.('#lp-drawer a')) setMenu(false, false);
    };
    const onKey = (e) => {
      if (!menuOpen) return;
      if (e.key === 'Escape') {
        setMenu(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...drawer.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Layar melebar ke tampilan desktop saat laci terbuka: tutup lacinya.
    const onWidth = () => {
      if (desktop.matches) setMenu(false, false);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    desktop.addEventListener('change', onWidth);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      desktop.removeEventListener('change', onWidth);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      if (menuOpen) root.style.overflow = prevOverflow;
    };
  }, [enabled]);
}
