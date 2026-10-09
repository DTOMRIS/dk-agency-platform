/**
 * /blog — v2 inner design (TASK-0514, owner-approved mockup 09.10.2026). Server-rendered list
 * (was a client fetch of /api/blog): featured post, group tabs over the 8 real categories, real
 * cover images and read time computed from the word count. Metadata: app/blog/layout.tsx.
 */
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import {
  BLOG_CATEGORY_MESSAGE,
  BLOG_CATEGORY_TAB,
  normalizeBlogCategory,
} from '@/lib/blog/category-groups';
import { formatInnerDate, readMinutes } from '@/components/inner/InnerParts';
import BlogDirectory, { type BlogCardItem } from '@/components/blog/BlogDirectory';

export default async function BlogGridPage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const fromParams = params ? (await params).locale : undefined;
  const locale = normalizeLocale(fromParams ?? (await getLocale()));
  const tb = await getTranslations({ locale, namespace: 'blogDetail' });

  const { posts } = await getBlogPostsFromDb({ status: 'published' }, locale);

  const items: BlogCardItem[] = posts.map((post) => {
    const cat = normalizeBlogCategory(post.category);
    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      category: cat,
      categoryLabel: cat ? tb(BLOG_CATEGORY_MESSAGE[cat]) : post.category,
      tab: cat ? BLOG_CATEGORY_TAB[cat] : null,
      minutes: readMinutes(post.content || post.summary || ''),
      date: formatInnerDate(post.publishDate, locale),
      author: post.author,
      image: post.coverImage || null,
      imageAlt: post.coverImageAlt || post.title,
    };
  });

  return <BlogDirectory items={items} />;
}
