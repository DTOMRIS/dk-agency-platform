/**
 * buildSektorConfig — produces the standard sektor key structure.
 *
 * The i18n key strings are identical across sektors (only the `namespace`
 * differs), so the builder fills them in once. Each sektor config supplies
 * just the variable bits: namespace, analytics slug, real toolkit hrefs +
 * icons, blog slugs, lead source, footer href, meta description and OG card.
 */
import type { SektorConfig, SektorIcon, SektorOgConfig } from './types';

interface SektorToolInput {
  /** Real toolkit route, e.g. `/toolkit/food-cost` */
  href: string;
  icon: SektorIcon;
  isHero?: boolean;
}

export interface SektorConfigInput {
  slug: string;
  namespace: string;
  sektorSlug: string;
  metaDescription: string;
  primaryCtaHref: string;
  /** 3 tools, rendered in order; keys derive from position (tool1..tool3). */
  tools: SektorToolInput[];
  toolSource: string;
  blogSlugs: string[];
  footerCtaHref: string;
  og: SektorOgConfig;
}

export function buildSektorConfig(input: SektorConfigInput): SektorConfig {
  return {
    slug: input.slug,
    namespace: input.namespace,
    sektorSlug: input.sektorSlug,
    metaDescription: input.metaDescription,
    hero: {
      headlineKey: 'hero.headline',
      sublineKey: 'hero.subline',
      statBadgeKey: 'hero.statBadge',
      primaryCta: { key: 'hero.primaryCtaText', href: input.primaryCtaHref },
      secondaryCta: { key: 'hero.secondaryCtaText', href: '#lead-capture' },
    },
    stats: [1, 2, 3].map((n) => ({
      labelKey: `stats.stat${n}Label`,
      valueKey: `stats.stat${n}Value`,
      sourceKey: `stats.stat${n}Source`,
    })),
    toolsSectionTitleKey: 'tools.sectionTitle',
    tools: input.tools.map((t, i) => ({
      titleKey: `tools.tool${i + 1}Title`,
      descKey: `tools.tool${i + 1}Desc`,
      ctaKey: `tools.tool${i + 1}Cta`,
      href: t.href,
      icon: t.icon,
      isHero: t.isHero,
    })),
    blogSectionTitleKey: 'blogTeasers.sectionTitle',
    blogSlugs: input.blogSlugs,
    leadCapture: {
      headingKey: 'leadCapture.heading',
      bodyKey: 'leadCapture.body',
      buttonKey: 'leadCapture.buttonText',
      toolSource: input.toolSource,
    },
    faqSectionTitleKey: 'faq.sectionTitle',
    faqItems: [1, 2, 3, 4, 5].map((n) => ({
      questionKey: `faq.q${n}`,
      answerKey: `faq.a${n}`,
    })),
    footerCta: {
      headlineKey: 'footerCta.heading',
      ctaKey: 'footerCta.buttonText',
      href: input.footerCtaHref,
    },
    og: input.og,
  };
}
