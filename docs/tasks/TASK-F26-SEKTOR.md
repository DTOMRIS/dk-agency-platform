# TASK-F26-SEKTOR - /sektor/qonaq-evi Landing Page + Lead Endpoint

- Status: implemented
- Branch: `feat/sektor-qonaqevi-f26`
- Date: 2026-06-05
- Scope: F2.6 — sector landing page (parametric) + OTA guide lead capture endpoint

## Delivered
1. **7 parametric components** in `components/sektor/` — reusable for future /sektor/otel, /sektor/restoran
2. **Landing page** `/sektor/qonaq-evi` — Hero + Stats + Tools + Blog Teasers + Lead Capture + FAQ + Footer CTA
3. **Lead API** `POST /api/lead/ota-guide` — Zod-free validation, rate limit 3/hr, KVKK consent, email notifications
4. **i18n** — sektorQonaqEvi namespace in 4 locales (AZ/EN/RU/TR)

## Components (parametric)
- `SektorHero` — headline, subline, stat badge, dual CTA, optional hero image
- `SektorStatGrid` — 3-stat responsive grid
- `SektorToolGrid` — 3 tool cards with isHero flag (ROI calc = hero)
- `SektorBlogTeaserGrid` — 3 blog article teasers from BLOG_ARTICLES
- `SektorLeadCapture` — name/whatsapp/email form + KVKK consent
- `SektorFaqAccordion` — collapsible FAQ (Booking 15% first = SEO priority)
- `SektorFooterCta` — closing CTA banner

## Files
- `components/sektor/*.tsx` (7 components + index.ts)
- `app/sektor/qonaq-evi/page.tsx` — main client page
- `app/[locale]/sektor/qonaq-evi/page.tsx` — locale wrapper + metadata
- `app/api/lead/ota-guide/route.ts` — lead endpoint
- `messages/{az,en,ru,tr}.json` — sektorQonaqEvi namespace

## Deferred
- Real PDF generation (Puppeteer) — F2.7
- OG cover image — content team
- Yandex Metrica events — next sprint
