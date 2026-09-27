const BASE = 'https://pererenan-website-rental.vercel.app';

export default function sitemap() {
  return [{ url: BASE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
