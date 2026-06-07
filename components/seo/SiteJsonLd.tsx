import { organizationNode, websiteNode, jsonLdGraph } from '@/lib/seo/structured-data';

/**
 * Site-wide brand entity (Organization + WebSite) JSON-LD.
 * Static data — renders in the initial SSR HTML so crawlers and AI engines
 * pick up the brand entity. Drop into the homepage.
 */
export default function SiteJsonLd() {
  const jsonLd = jsonLdGraph([organizationNode(), websiteNode()]);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
