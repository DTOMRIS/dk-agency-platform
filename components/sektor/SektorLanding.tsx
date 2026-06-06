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

interface SektorLandingProps {
  config: SektorConfig;
}

/**
 * Config-driven sektor landing. Receives a serialisable {@link SektorConfig}
 * from the server `[slug]` page and renders the shared, namespace-driven
 * sektor sections. Fires the `view` analytics event once per sektor.
 */
export default function SektorLanding({ config }: SektorLandingProps) {
  const ns = config.namespace;

  useEffect(() => {
    trackSektorEvent({ sektor: config.sektorSlug, action: 'view' });
  }, [config.sektorSlug]);

  return (
    <>
      <SektorHero
        namespace={ns}
        headlineKey={config.hero.headlineKey}
        sublineKey={config.hero.sublineKey}
        statBadgeKey={config.hero.statBadgeKey}
        primaryCta={config.hero.primaryCta}
        secondaryCta={config.hero.secondaryCta}
        heroImage={config.hero.heroImage}
        sektorSlug={config.sektorSlug}
      />

      <SektorStatGrid namespace={ns} stats={config.stats} />

      <SektorToolGrid
        namespace={ns}
        sectionTitleKey={config.toolsSectionTitleKey}
        tools={config.tools}
        sektorSlug={config.sektorSlug}
      />

      <SektorBlogTeaserGrid
        namespace={ns}
        sectionTitleKey={config.blogSectionTitleKey}
        blogSlugs={config.blogSlugs}
      />

      <SektorLeadCapture
        namespace={ns}
        headingKey={config.leadCapture.headingKey}
        bodyKey={config.leadCapture.bodyKey}
        buttonKey={config.leadCapture.buttonKey}
        toolSource={config.leadCapture.toolSource}
        sektorSlug={config.sektorSlug}
      />

      <SektorFaqAccordion
        namespace={ns}
        sectionTitleKey={config.faqSectionTitleKey}
        items={config.faqItems}
        sektorSlug={config.sektorSlug}
      />

      <SektorFooterCta
        namespace={ns}
        headlineKey={config.footerCta.headlineKey}
        ctaKey={config.footerCta.ctaKey}
        href={config.footerCta.href}
        sektorSlug={config.sektorSlug}
      />
    </>
  );
}
