/** Halaman publik boleh diindeks; seluruh area admin tidak. */
export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/transactions', '/customers', '/vehicles', '/expenses',
                 '/reports', '/service', '/tracking', '/settings', '/menu', '/login', '/api/'],
    }],
    sitemap: 'https://pererenan-website-rental.vercel.app/sitemap.xml',
  };
}
