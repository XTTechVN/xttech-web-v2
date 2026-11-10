import type { MetadataRoute } from 'next';
import {
  BASE_SITE_URL,
  fetchAllPublicArticlesForSitemap,
  isProductionIndexingAllowed,
} from '@/config';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexingAllowed()) {
    return [];
  }

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_SITE_URL}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_SITE_URL}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_SITE_URL}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const articles = await fetchAllPublicArticlesForSitemap();
  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((article) => Boolean(article.slug) && article.status === 'published')
    .map((article) => ({
      url: `${BASE_SITE_URL}/news/${encodeURIComponent(article.slug)}`,
      lastModified: new Date(article.updatedAt || article.createdAt || now),
      changeFrequency: 'weekly',
      priority: article.isFeatured ? 0.85 : 0.75,
    }));

  return [...staticRoutes, ...articleRoutes];
}
