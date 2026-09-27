import { BUSINESS, FLEET } from '@/lib/landing/config';

/** Beranda + tujuh halaman motor. Area admin tidak dimasukkan. */
export default function sitemap() {
  const now = new Date();
  return [
    { url: BUSINESS.siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...FLEET.map((s) => ({
      url: `${BUSINESS.siteUrl}/scooters/${s.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
