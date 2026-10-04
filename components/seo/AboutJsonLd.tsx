import { getLocale } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';
import { jsonLdGraph, localeUrl, organizationNode, personNode, FOUNDER_ID } from '@/lib/seo/structured-data';

/**
 * /haqqimizda JSON-LD: AboutPage → Organization + founder Person (TASK-0475).
 * Server component, rendered from the route layouts so it is in the SSR HTML for every locale.
 */
export default async function AboutJsonLd() {
  const locale = normalizeLocale(await getLocale());
  const url = localeUrl(locale, '/haqqimizda');
  const jsonLd = jsonLdGraph([
    {
      '@type': 'AboutPage',
      '@id': `${url}#page`,
      url,
      inLanguage: locale,
      about: { '@id': 'https://dkagency.com.tr/#organization' },
      mainEntity: { '@id': FOUNDER_ID },
    },
    organizationNode(),
    personNode(locale),
  ]);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
