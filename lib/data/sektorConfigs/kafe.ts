import type { SektorConfig } from './types';

export const kafeConfig: SektorConfig = {
  slug: 'kafe',
  sektorSlug: 'kafe',
  namespace: 'sektorKafe',

  meta: {
    titleKey: 'pageTitle',
    descriptionKey: 'hero.subline',
    ogTitleKey: 'hero.headline',
    ogDescriptionKey: 'hero.subline',
  },

  hero: {
    headlineKey: 'hero.headline',
    sublineKey: 'hero.subline',
    statBadgeKey: 'hero.statBadge',
    primaryCta: { key: 'hero.primaryCtaText', href: '/toolkit/food-cost' },
    secondaryCta: { key: 'hero.secondaryCtaText', href: '#lead-capture' },
    heroImage: '/images/supplier-laptop.png',
  },

  stats: [
    { labelKey: 'stats.stat1Label', valueKey: 'stats.stat1Value', sourceKey: 'stats.stat1Source' },
    { labelKey: 'stats.stat2Label', valueKey: 'stats.stat2Value', sourceKey: 'stats.stat2Source' },
    { labelKey: 'stats.stat3Label', valueKey: 'stats.stat3Value', sourceKey: 'stats.stat3Source' },
  ],

  tools: [
    {
      titleKey: 'tools.tool1Title',
      descKey: 'tools.tool1Desc',
      ctaKey: 'tools.tool1Cta',
      href: '/toolkit/food-cost',
      icon: 'calculator',
      isHero: true,
    },
    {
      titleKey: 'tools.tool2Title',
      descKey: 'tools.tool2Desc',
      ctaKey: 'tools.tool2Cta',
      href: '/toolkit/basabas',
      icon: 'calculator',
    },
    {
      titleKey: 'tools.tool3Title',
      descKey: 'tools.tool3Desc',
      ctaKey: 'tools.tool3Cta',
      href: '/toolkit/menu-matrix',
      icon: 'calculator',
    },
  ],

  blogSlugs: [
    'garson-satis-upsell-salon-gelir',
    'ai-ile-favok-qorumasi',
    'azerbaycan-otel-ulduz-tesniflati',
  ],

  leadCapture: {
    headingKey: 'leadCapture.heading',
    bodyKey: 'leadCapture.body',
    buttonKey: 'leadCapture.buttonText',
    toolSource: 'consulting',
  },

  faqItems: [
    { questionKey: 'faq.q1', answerKey: 'faq.a1' },
    { questionKey: 'faq.q2', answerKey: 'faq.a2' },
    { questionKey: 'faq.q3', answerKey: 'faq.a3' },
    { questionKey: 'faq.q4', answerKey: 'faq.a4' },
    { questionKey: 'faq.q5', answerKey: 'faq.a5' },
  ],

  footerCta: {
    headlineKey: 'footerCta.heading',
    ctaKey: 'footerCta.buttonText',
    href: '/toolkit/food-cost',
  },
};
