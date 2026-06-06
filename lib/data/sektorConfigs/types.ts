/**
 * Sektor landing config types.
 *
 * F2.8: a single config-driven `[slug]` route renders every sektor landing.
 * Each sektor supplies a config; the 7 `Sektor*` components are already
 * namespace-driven (`useTranslations(namespace)`), so a config only needs the
 * i18n namespace + the per-sektor variable bits (hrefs, icons, blog slugs).
 */

export type SektorIcon = 'quiz' | 'calculator' | 'whatsapp';

export interface SektorStatConfig {
  labelKey: string;
  valueKey: string;
  sourceKey: string;
}

export interface SektorToolConfig {
  titleKey: string;
  descKey: string;
  ctaKey: string;
  /** Real toolkit route, e.g. `/toolkit/food-cost` */
  href: string;
  icon: SektorIcon;
  isHero?: boolean;
}

export interface SektorFaqConfig {
  questionKey: string;
  answerKey: string;
}

export interface SektorCtaConfig {
  key: string;
  href: string;
}

/** OpenGraph image fields — kept ASCII/latin to render safely in satori. */
export interface SektorOgConfig {
  title: string;
  subtitle: string;
  badges: string[];
}

export interface SektorConfig {
  /** URL slug, e.g. `qonaq-evi` */
  slug: string;
  /** i18n namespace, e.g. `sektorQonaqEvi` */
  namespace: string;
  /** analytics slug, e.g. `qonaqEvi` */
  sektorSlug: string;
  /** Plain-text meta description (AZ) — avoids touching the qonaqEvi namespace. */
  metaDescription: string;
  hero: {
    headlineKey: string;
    sublineKey: string;
    statBadgeKey: string;
    primaryCta: SektorCtaConfig;
    secondaryCta: SektorCtaConfig;
    heroImage?: string;
  };
  stats: SektorStatConfig[];
  toolsSectionTitleKey: string;
  tools: SektorToolConfig[];
  blogSectionTitleKey: string;
  blogSlugs: string[];
  leadCapture: {
    headingKey: string;
    bodyKey: string;
    buttonKey: string;
    /** Client analytics tag only; the lead API hardcodes its own source. */
    toolSource: string;
  };
  faqSectionTitleKey: string;
  faqItems: SektorFaqConfig[];
  footerCta: {
    headlineKey: string;
    ctaKey: string;
    href: string;
  };
  og: SektorOgConfig;
}
