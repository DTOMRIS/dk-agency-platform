/**
 * Structured data (JSON-LD) builders for AI search visibility (SEO + AEO + GEO).
 * Emit a single `@graph` script per page combining Article + BreadcrumbList +
 * Organization so ChatGPT / Perplexity / Google AI Overviews can extract and
 * cite the content reliably.
 */

type JsonLd = Record<string, unknown>;

export const SITE_URL = 'https://dkagency.com.tr';
const ORG_NAME = 'DK Agency';
const ORG_LOGO = `${SITE_URL}/icon-512.png`;
const ABOUT_URL = `${SITE_URL}/haqqimizda`;

/** Absolute URL for a path in the given locale (az = no prefix). */
export function localeUrl(locale: string, path: string): string {
  const prefix = locale === 'az' ? '' : `/${locale}`;
  const clean = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${clean}` || SITE_URL;
}

/** Organization entity — establishes brand identity in AI knowledge graphs. */
export function organizationNode(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: ORG_LOGO, width: 512, height: 512 },
  };
}

/** Breadcrumb trail — helps AI understand site structure. */
export function breadcrumbNode(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ArticleNodeInput = {
  headline: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  keywords?: string;
  articleSection?: string;
  wordCount?: number;
  isAccessibleForFree: boolean;
};

/** BlogPosting entity with publisher.logo (required for Article rich results). */
export function articleNode(input: ArticleNodeInput): JsonLd {
  return {
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    url: input.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: { '@type': 'Person', name: input.authorName, url: ABOUT_URL },
    publisher: organizationNode(),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.inLanguage,
    keywords: input.keywords,
    articleSection: input.articleSection,
    wordCount: input.wordCount,
    isAccessibleForFree: input.isAccessibleForFree,
  };
}

/** FAQPage entity — highest immediate impact for answer engines (AEO). */
export function faqNode(items: Array<{ question: string; answer: string }>): JsonLd | null {
  if (!items.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Serialize nodes as a single @graph JSON-LD string. */
export function jsonLdGraph(nodes: Array<JsonLd | null | undefined>): string {
  const graph = nodes.filter((node): node is JsonLd => Boolean(node));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
