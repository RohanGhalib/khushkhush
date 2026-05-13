import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khushkhush.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/', 
        '/account/',
        '/checkout/',
        '/order/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
