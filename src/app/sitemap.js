import { FLEET } from '@/lib/landing/config';

const BASE = 'https://pererenan-website-rental.vercel.app';

export default function sitemap() {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...FLEET.map(f => ({
      url: `${BASE}/scooters/${f.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
