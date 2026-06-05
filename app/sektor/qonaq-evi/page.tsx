'use client';

import { useEffect } from 'react';
import {
  SektorHero,
  SektorStatGrid,
  SektorToolGrid,
  SektorBlogTeaserGrid,
  SektorLeadCapture,
  SektorFaqAccordion,
  SektorFooterCta,
} from '@/components/sektor';
import { trackSektorEvent } from '@/lib/analytics/sektorEvents';

const NS = 'sektorQonaqEvi';
const SEKTOR_SLUG = 'qonaqEvi';

const STATS = [
  { labelKey: 'stats.stat1Label', valueKey: 'stats.stat1Value', sourceKey: 'stats.stat1Source' },
  { labelKey: 'stats.stat2Label', valueKey: 'stats.stat2Value', sourceKey: 'stats.stat2Source' },
  { labelKey: 'stats.stat3Label', valueKey: 'stats.stat3Value', sourceKey: 'stats.stat3Source' },
];

const TOOLS = [
  {
    titleKey: 'tools.tool1Title',
    descKey: 'tools.tool1Desc',
    ctaKey: 'tools.tool1Cta',
    href: '/toolkit/ota-hazirlig-testi',
    icon: 'quiz' as const,
  },
  {
    titleKey: 'tools.tool2Title',
    descKey: 'tools.tool2Desc',
    ctaKey: 'tools.tool2Cta',
    href: '/toolkit/qonaq-evi-roi-kalkulyatoru',
    icon: 'calculator' as const,
    isHero: true,
  },
  {
    titleKey: 'tools.tool3Title',
    descKey: 'tools.tool3Desc',
    ctaKey: 'tools.tool3Cta',
    href: '/toolkit/whatsapp-template-paketi',
    icon: 'whatsapp' as const,
  },
];

const BLOG_SLUGS = [
  'ai-ile-favok-qorumasi',
  'garson-satis-upsell-salon-gelir',
  'azerbaycan-otel-ulduz-tesniflati',
];

const FAQ_ITEMS = [
  { questionKey: 'faq.q1', answerKey: 'faq.a1' },
  { questionKey: 'faq.q2', answerKey: 'faq.a2' },
  { questionKey: 'faq.q3', answerKey: 'faq.a3' },
  { questionKey: 'faq.q4', answerKey: 'faq.a4' },
  { questionKey: 'faq.q5', answerKey: 'faq.a5' },
];

export default function QonaqEviSektorPage() {
  useEffect(() => {
    trackSektorEvent({ sektor: SEKTOR_SLUG, action: 'view' });
  }, []);

  return (
    <>
      <SektorHero
        namespace={NS}
        headlineKey="hero.headline"
        sublineKey="hero.subline"
        statBadgeKey="hero.statBadge"
        primaryCta={{ key: 'hero.primaryCtaText', href: '/toolkit/ota-hazirlig-testi' }}
        secondaryCta={{ key: 'hero.secondaryCtaText', href: '#lead-capture' }}
        sektorSlug={SEKTOR_SLUG}
      />

      <SektorStatGrid namespace={NS} stats={STATS} />

      <SektorToolGrid
        namespace={NS}
        sectionTitleKey="tools.sectionTitle"
        tools={TOOLS}
        sektorSlug={SEKTOR_SLUG}
      />

      <SektorBlogTeaserGrid
        namespace={NS}
        sectionTitleKey="blogTeasers.sectionTitle"
        blogSlugs={BLOG_SLUGS}
      />

      <SektorLeadCapture
        namespace={NS}
        headingKey="leadCapture.heading"
        bodyKey="leadCapture.body"
        buttonKey="leadCapture.buttonText"
        toolSource="ota_guide_pdf"
        sektorSlug={SEKTOR_SLUG}
      />

      <SektorFaqAccordion
        namespace={NS}
        sectionTitleKey="faq.sectionTitle"
        items={FAQ_ITEMS}
        sektorSlug={SEKTOR_SLUG}
      />

      <SektorFooterCta
        namespace={NS}
        headlineKey="footerCta.heading"
        ctaKey="footerCta.buttonText"
        href="/toolkit/ota-hazirlig-testi"
        sektorSlug={SEKTOR_SLUG}
      />
    </>
  );
}
