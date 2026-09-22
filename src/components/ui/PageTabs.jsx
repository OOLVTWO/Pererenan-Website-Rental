'use client';

/**
 * Tab di dalam halaman (pengganti dropdown sidebar).
 * Pilihan ikut disimpan di URL (?tab=… atau parameter lain) supaya bisa
 * di-bookmark / tetap setelah refresh.
 *
 * tabs: [{ key, label, count? }]
 */
export default function PageTabs({ tabs, value, onChange, param = 'tab', ariaLabel = 'Pilihan tampilan', resetParams = [] }) {
  const select = (key) => {
    onChange(key);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(param, key);
      resetParams.forEach(p => url.searchParams.delete(p));
      window.history.replaceState(window.history.state, '', url.toString());
    } catch { /* ignore */ }
  };

  return (
    <div className="page-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map(t => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`page-tab${active ? ' active' : ''}`}
            onClick={() => select(t.key)}
          >
            {t.label}
            {t.count !== undefined && t.count !== null && <span className="page-tab-count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
