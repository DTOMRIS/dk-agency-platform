import { useLocale, useTranslations } from 'next-intl';

import {
  jsonLdGraph,
  localeUrl,
  organizationNode,
  serviceCatalogNode,
  websiteNode,
  type ServiceItem,
} from '@/lib/seo/structured-data';

/**
 * Site-wide brand entity (Organization + WebSite) JSON-LD.
 * Static data — renders in the initial SSR HTML so crawlers and AI engines
 * pick up the brand entity. Drop into the homepage.
 *
 * TASK-0513: + OfferCatalog of the homepage services, built only from on-page copy
 * (homeV2.eco list, KAZAN AI beta, «Pulsuz diaqnostika» step). No FAQPage — the homepage has no FAQ.
 */
export default function SiteJsonLd() {
  const locale = useLocale();
  const t = useTranslations('homeV2');

  const services: ServiceItem[] = [
    {
      name: t('ctaDiag'),
      description: t('steps.s1.p'),
      url: localeUrl(locale, '/elaqe'),
      free: true,
    },
    { name: t('eco.list.l1.b'), description: t('eco.list.l1.t'), url: localeUrl(locale, '/toolkit/food-cost') },
    {
      name: t('eco.list.l2.b'),
      description: t('eco.list.l2.t'),
      url: localeUrl(locale, '/toolkit/personel-planlayici'),
    },
    { name: t('eco.list.l3.b'), description: t('eco.list.l3.t'), url: `${localeUrl(locale, '/').replace(/\/?$/, '/')}#ekosistem` },
    { name: t('eco.list.l4.b'), description: t('eco.list.l4.t'), url: localeUrl(locale, '/toolkit/menu-matrix') },
    { name: t('modules.kazan.title'), description: t('modules.kazan.stat'), url: localeUrl(locale, '/kazan-ai') },
  ];

  const jsonLd = jsonLdGraph([
    organizationNode(),
    websiteNode(),
    serviceCatalogNode(t('eco.label'), services),
  ]);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
