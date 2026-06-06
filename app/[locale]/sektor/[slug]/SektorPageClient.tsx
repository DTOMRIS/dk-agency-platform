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
import type { SektorConfig } from '@/lib/data/sektorConfigs';

interface SektorPageClientProps {
  config: SektorConfig;
}

export default function SektorPageClient({ config }: SektorPageClientProps) {
  useEffect(() => {
    trackSektorEvent({ sektor: config.sektorSlug, action: 'view' });
  }, [config.sektorSlug]);

  return (
    <>
      <SektorHero
        namespace={config.namespace}
        headlineKey={config.hero.headlineKey}
        sublineKey={config.hero.sublineKey}
        statBadgeKey={config.hero.statBadgeKey}
        primaryCta={config.hero.primaryCta}
        secondaryCta={config.hero.secondaryCta}
        heroImage={config.hero.heroImage}
        sektorSlug={config.sektorSlug}
      />

      <SektorStatGrid namespace={config.namespace} stats={config.stats} />

      <SektorToolGrid
        namespace={config.namespace}
        sectionTitleKey="tools.sectionTitle"
        tools={config.tools}
        sektorSlug={config.sektorSlug}
      />

      <SektorBlogTeaserGrid
        namespace={config.namespace}
        sectionTitleKey="blogTeasers.sectionTitle"
        blogSlugs={config.blogSlugs}
      />

      <SektorLeadCapture
        namespace={config.namespace}
        headingKey={config.leadCapture.headingKey}
        bodyKey={config.leadCapture.bodyKey}
        buttonKey={config.leadCapture.buttonKey}
        toolSource={config.leadCapture.toolSource}
        sektorSlug={config.sektorSlug}
      />

      <SektorFaqAccordion
        namespace={config.namespace}
        sectionTitleKey="faq.sectionTitle"
        items={config.faqItems}
        sektorSlug={config.sektorSlug}
      />

      <SektorFooterCta
        namespace={config.namespace}
        headlineKey={config.footerCta.headlineKey}
        ctaKey={config.footerCta.ctaKey}
        href={config.footerCta.href}
        sektorSlug={config.sektorSlug}
      />
    </>
  );
}
