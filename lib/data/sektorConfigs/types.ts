/** Sektor Landing Page — shared type definitions */

export type SektorToolIcon = 'quiz' | 'calculator' | 'whatsapp' | 'checklist';

export interface SektorToolItem {
  titleKey: string;
  descKey: string;
  ctaKey: string;
  href: string;
  icon: SektorToolIcon;
  isHero?: boolean;
}

export interface SektorStatItem {
  labelKey: string;
  valueKey: string;
  sourceKey: string;
}

export interface SektorFaqItem {
  questionKey: string;
  answerKey: string;
}

export interface SektorConfig {
  /** URL slug: 'qonaq-evi', 'otel', 'restoran', 'kafe' */
  slug: string;
  /** Analytics slug (camelCase): 'qonaqEvi', 'otel', 'restoran', 'kafe' */
  sektorSlug: string;
  /** i18n namespace in messages/{locale}.json */
  namespace: string;
  /** Page metadata */
  meta: {
    titleKey: string;
    descriptionKey: string;
    ogTitleKey: string;
    ogDescriptionKey: string;
  };
  /** Hero section keys */
  hero: {
    headlineKey: string;
    sublineKey: string;
    statBadgeKey: string;
    primaryCta: { key: string; href: string };
    secondaryCta: { key: string; href: string };
    heroImage?: string;
  };
  /** Stats grid */
  stats: SektorStatItem[];
  /** Tools grid */
  tools: SektorToolItem[];
  /** Blog teaser slugs */
  blogSlugs: string[];
  /** Lead capture */
  leadCapture: {
    headingKey: string;
    bodyKey: string;
    buttonKey: string;
    toolSource: string;
  };
  /** FAQ items */
  faqItems: SektorFaqItem[];
  /** Footer CTA */
  footerCta: {
    headlineKey: string;
    ctaKey: string;
    href: string;
  };
}
