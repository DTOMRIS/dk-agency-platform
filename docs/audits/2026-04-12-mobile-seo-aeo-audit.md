# Mobile + SEO + AEO Audit

Date: 2026-04-12  
Repo: `dk-agency-platform`

## What strong teams audit first

This is the practical order used by strong product and editorial teams:

1. Crawlability and indexability
2. Canonicals, localized variants, and sitemap coverage
3. Rendered mobile UX on real narrow viewports
4. Content readability and interaction clarity
5. Structured data for entities, articles, and actionable content
6. Performance signals that affect UX and search surfaces
7. Editorial quality for citation-based and AI answer surfaces

## Source references

- Google SEO Starter Guide  
  https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google AI features in Search  
  https://developers.google.com/search/docs/appearance/ai-features
- Google localized versions / hreflang guidance  
  https://developers.google.com/search/docs/specialty/international/localized-versions
- Google paywalled content guidance  
  https://developers.google.com/search/docs/appearance/structured-data/paywalled-content
- web.dev responsive design basics  
  https://web.dev/responsive-web-design-basics/
- web.dev optimize CLS  
  https://web.dev/articles/optimize-cls
- web.dev optimize INP  
  https://web.dev/articles/optimize-inp
- Lighthouse CI docs  
  https://github.com/GoogleChrome/lighthouse-ci

## Audit summary

### Fixed in this pass

1. Content contrast regressions on blog/news light surfaces
2. Blog/news detail metadata upgraded with canonical and Open Graph
3. Blog/news detail structured data added
4. Sitemap upgraded from near-static shell to dynamic content coverage
5. Mobile typography and hero heights reduced on several editorial routes

### High-priority gaps still open

1. Localized alternates are not declared
2. Paywalled blog content is not fully marked for Google paywall handling
3. Editorial routes still mix multiple content systems and duplicate route shapes
4. Some editorial UI remains desktop-first in spacing and navigation density
5. Sitemap still does not cover all valuable localized commercial pages

## Repo findings

### 1. Localized routes exist, but alternates are missing

- [`app/[locale]/layout.tsx`](C:/codelar/dk-agency-platform/app/[locale]/layout.tsx) only wraps `NextIntlClientProvider`
- no `alternates.languages`
- no page-level hreflang strategy

Impact:
- Google gets weaker signals about `/az`, `/tr`, `/en` equivalents
- duplicate or competing localized URLs are harder to consolidate

Priority: High

### 2. Sitemap coverage was weak

Before this pass:
- [`app/sitemap.ts`](C:/codelar/dk-agency-platform/app/sitemap.ts) only listed a few static pages
- blog detail pages and approved news articles were missing

Now:
- dynamic published blog entries included
- dynamic approved news entries included
- locale blog/news variants included
- auth URLs removed from sitemap

Priority: Fixed

### 3. Blog detail metadata was too thin

Before this pass:
- [`app/[locale]/blog/[slug]/page.tsx`](C:/codelar/dk-agency-platform/app/[locale]/blog/[slug]/page.tsx) returned only title + description

Now:
- canonical added
- Open Graph article metadata added
- `BlogPosting` schema added

Priority: Fixed

### 4. News detail metadata was too thin

Before this pass:
- [`app/haberler/[slug]/page.tsx`](C:/codelar/dk-agency-platform/app/haberler/[slug]/page.tsx) returned only title + description

Now:
- canonical added
- Open Graph article metadata added
- `NewsArticle` schema added

Priority: Fixed

### 5. Paywalled content markup is incomplete

- [`components/news/BlogContentWrapper.tsx`](C:/codelar/dk-agency-platform/components/news/BlogContentWrapper.tsx) gates content visually
- blog pages do not yet expose paywall selectors / full Google paywalled-content structured data flow

Impact:
- for premium articles, Google guidance is stricter than just clipping content
- AI answer surfaces and search systems benefit from cleaner paywall semantics

Priority: High

### 6. Multiple editorial systems coexist

Examples:
- [`app/haberler/page.tsx`](C:/codelar/dk-agency-platform/app/haberler/page.tsx)
- [`components/editorial/HaberlerPageClient.tsx`](C:/codelar/dk-agency-platform/components/editorial/HaberlerPageClient.tsx)
- [`components/news/SektorNabziTabs.tsx`](C:/codelar/dk-agency-platform/components/news/SektorNabziTabs.tsx)
- [`app/api/news/route.ts`](C:/codelar/dk-agency-platform/app/api/news/route.ts) still references `mockNewsDB`

Impact:
- design drift
- content drift
- mobile inconsistency
- unclear source of truth for indexable news surfaces

Priority: High

### 7. Mobile issues remain mostly editorial-density issues now

Improved in this pass:
- [`app/[locale]/blog/page.tsx`](C:/codelar/dk-agency-platform/app/[locale]/blog/page.tsx) hero title reduced on mobile
- [`app/[locale]/blog/[slug]/page.tsx`](C:/codelar/dk-agency-platform/app/[locale]/blog/[slug]/page.tsx) hero height and title scale improved
- [`app/haberler/[slug]/page.tsx`](C:/codelar/dk-agency-platform/app/haberler/[slug]/page.tsx) article title scale improved
- [`components/news/NewsHero.tsx`](C:/codelar/dk-agency-platform/components/news/NewsHero.tsx) hero height reduced on mobile

Still likely needing a dedicated pass:
- tab density and horizontal overflow in [`components/news/CategoryTabs.tsx`](C:/codelar/dk-agency-platform/components/news/CategoryTabs.tsx)
- editorial density and dark-token reuse inside [`components/news/SektorNabziTabs.tsx`](C:/codelar/dk-agency-platform/components/news/SektorNabziTabs.tsx)
- mobile sidebar behavior and reading ergonomics on long-form content

Priority: Medium-high

### 8. AI-search readiness is partly technical, mostly editorial

What AI-search systems tend to reward:
- explicit facts
- stable entity naming
- strong titles and summaries
- clear bylines
- fresh timestamps
- structured data where appropriate
- pages that are easy to cite and quote

Repo strengths:
- bylines exist on blog and news
- timestamps exist
- summaries exist
- several toolkit pages already use structured data patterns

Repo gaps:
- not enough consistent article schema across editorial surfaces until this pass
- no visible organization-level entity/schema layer on editorial pages
- localized alternates are missing
- some content appears mojibaked in source and must be cleaned before scaling organic traffic

Priority: High

## Recommended next implementation order

### Phase 1

1. Add `alternates.languages` for localized blog/news/commercial routes
2. Add proper paywall structured-data markup for premium blog articles
3. Decide one source of truth for public news content and remove mock-path ambiguity

### Phase 2

1. Run a mobile-first redesign pass on:
   - `components/news/SektorNabziTabs.tsx`
   - `components/news/CategoryTabs.tsx`
   - `components/editorial/HaberlerPageClient.tsx`
2. Add Lighthouse CI thresholds for mobile performance and SEO regression checks

### Phase 3

1. Add organization and website schema centrally
2. Add article breadcrumbs
3. Expand sitemap coverage to high-value localized commercial pages
4. Clean mojibake in editorial content sources before scaling publishing

## Decision

The correct strategy is not “more content first.”  
The correct strategy is:

1. fix crawl + metadata + sitemap + localization signals
2. clean mobile editorial UX
3. then scale blog/news publishing and AEO work

Without that order, traffic quality and AI-search citation quality will stay inconsistent.
