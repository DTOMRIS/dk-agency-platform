import type { MetadataRoute } from 'next';

import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { getApprovedNewsArticles } from '@/lib/repositories/newsRepository';

const BASE_URL = 'https://dkagency.az';
const LOCALES = ['az', 'tr', 'en'] as const;

function absolute(path: string) {
  return `${BASE_URL}${path}`;
}

function withLocales(path: string) {
  return LOCALES.map((locale) => absolute(`/${locale}${path}`));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absolute('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absolute('/blog'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absolute('/haberler'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absolute('/xeberler'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absolute('/kazan-ai'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absolute('/b2b-panel'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const localizedRoutes: MetadataRoute.Sitemap = [
    ...withLocales('/blog').map((url) => ({
      url,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...withLocales('/haberler').map((url) => ({
      url,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
  ];

  const [blogResult, newsResult] = await Promise.all([
    getBlogPostsFromDb({ status: 'published', limit: 1000, offset: 0 }),
    getApprovedNewsArticles({ category: 'all', limit: 1000, offset: 0 }),
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogResult.posts.flatMap((post) => {
    const lastModified = new Date(post.updatedAt || post.publishDate || now);
    return [
      {
        url: absolute(`/blog/${post.slug}`),
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      ...withLocales(`/blog/${post.slug}`).map((url) => ({
        url,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    ];
  });

  const newsEntries: MetadataRoute.Sitemap = newsResult.items.flatMap((item) => {
    const lastModified = new Date(item.publishedAt || now);
    return [
      {
        url: absolute(`/haberler/${item.slug}`),
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      },
      ...withLocales(`/haberler/${item.slug}`).map((url) => ({
        url,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  });

  return [...staticRoutes, ...localizedRoutes, ...blogEntries, ...newsEntries];
}
