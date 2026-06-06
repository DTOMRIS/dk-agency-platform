import type { SektorConfig } from './types';

export const qonaqEviConfig: SektorConfig = {
  slug: 'qonaq-evi',
  sektorSlug: 'qonaqEvi',
  namespace: 'sektorQonaqEvi',

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
    primaryCta: { key: 'hero.primaryCtaText', href: '/toolkit/ota-hazirlig-testi' },
    secondaryCta: { key: 'hero.secondaryCtaText', href: '#lead-capture' },
    heroImage: '/images/franchise-buyume.png',
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
      href: '/toolkit/ota-hazirlig-testi',
      icon: 'quiz',
    },
    {
      titleKey: 'tools.tool2Title',
      descKey: 'tools.tool2Desc',
      ctaKey: 'tools.tool2Cta',
      href: '/toolkit/qonaq-evi-roi-kalkulyatoru',
      icon: 'calculator',
      isHero: true,
    },
    {
      titleKey: 'tools.tool3Title',
      descKey: 'tools.tool3Desc',
      ctaKey: 'tools.tool3Cta',
      href: '/toolkit/whatsapp-template-paketi',
      icon: 'whatsapp',
    },
  ],

  blogSlugs: [
    'ai-ile-favok-qorumasi',
    'garson-satis-upsell-salon-gelir',
    'azerbaycan-otel-ulduz-tesniflati',
  ],

  leadCapture: {
    headingKey: 'leadCapture.heading',
    bodyKey: 'leadCapture.body',
    buttonKey: 'leadCapture.buttonText',
    toolSource: 'ota_guide_pdf',
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
    href: '/toolkit/ota-hazirlig-testi',
  },
};
