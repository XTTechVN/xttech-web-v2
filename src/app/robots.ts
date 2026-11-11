import type { MetadataRoute } from 'next';
import { BASE_SITE_URL, isProductionIndexingAllowed } from '@/config';

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexingAllowed()) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/api/', '/qr/', '/sign/'],
      },
    ],
    sitemap: `${BASE_SITE_URL}/sitemap.xml`,
  };
}
