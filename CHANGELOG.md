# Changelog - DK Agency Platform

Bütün dəyişikliklər bu faylda qeyd olunur.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Added
- Russian (`ru`) locale infrastructure, DeepSeek-backed `scripts/translate-ru.mjs`, generated `messages/ru.json`, and a `/ru` Playwright smoke test.

### Changed
- Header/footer locale switcher, locale routing, sitemap alternates, homepage copy, and founder note / B2B sections now recognize `AZ + RU + EN + TR`.

### Added
- TASK-0012: n8n RSS workflow template — `docs/n8n-rss-workflow.json` for scheduled fetch + translate
- TASK-0012: n8n setup guide — `docs/n8n-setup.md` with import, env vars, test, troubleshooting

### Changed
- TASK-0012: new `/api/news/fetch` and `/api/news/translate` endpoints with 60s rate limiting and `Authorization: Bearer <NEWS_API_SECRET>` auth

### Added
- Devir listing-ə 3 yeni field: icarə müddəti (ay), aylıq xalis mənfəət, mülkiyyət tipi — BizBuySell/BusinessesForSale benchmark əsasında.
- Franchise-vermek kateqoriyasına minimum sahə tələbi field-ı.
- Obyekt icarəsi kateqoriyasına icarə müddəti field-ı.
- Input placeholder dəstəyi əlavə sahələr addımında.

### Fixed
- Locale admin leads route now resolves correctly by redirecting `/[locale]/admin/leads` to the existing real DB-backed `/dashboard/kazan-leads` screen instead of returning 404.

### Added
- DK Agency HoReCa sales sprint added to the operating record: 20 Baku target accounts were grouped across restaurant chains, hotel+restaurant properties, cafes/brunch venues and premium/fine-dining restaurants.
- First outreach pack prepared for 10 April 2026 with short Instagram/Web DM scripts for the first 10 targets, plus response handling for demo requests, pricing questions, existing-system objections and opt-outs.
- AEO mini-audit offer added as the primary low-friction entry point for premium restaurants such as Meatadore and Firuze.
- Almila production readiness was documented for sales use: DeepSeek direct model path, lead capture, WhatsApp deep link, objection handling and employer mode are ready for live demos.

### Changed
- Cold outreach wording was softened for first contact: removed early pricing, hard chatbot claims and aggressive enterprise comparisons from the initial DM flow.
- Hotel pitch reframed from Booking.com commission pressure to direct reservation lift and faster guest-response handling.
- Restaurant pitch reframed around WhatsApp/Instagram response capture, menu questions, reservations and lost lead prevention.

### Fixed
- Almila OpenClaw prompt conflict was resolved by updating the workspace-level `SOUL.md`, which was still carrying the old short `wa.me/994517696181` CTA format.
- WhatsApp CTA now uses the full `https://wa.me/...?...text=...` deep link format in the live Almila flow.
- OpenRouter `402` dependency risk was removed from the active Almila path by confirming `deepseek/deepseek-chat` as the direct model route.
- First greeting behavior was corrected so Almila no longer asks for name/phone immediately on a simple greeting.

### Operational Notes
- Gemma 4 VPS inference was parked because the current VPS is CPU-only with limited RAM and is not suitable for production-speed local inference.
- Almila v3.2 is accepted as production-ready for demos; remaining inconsistent name echoing is tracked as a non-blocking model behavior.
- Today’s outreach target is 10 DMs: 5 restaurant targets first, then 5 hotel targets after a short interval.

### Fixed
- Public `/haberler` hero now prefers translated editor picks only and falls back safely when an editor pick is not publishable.
- Admin news approve API now blocks approving articles that do not have Azerbaijani title/summary content.
- News cards now use category-based gradient placeholders instead of generic dark image fallbacks.
- Public news heading copy now uses final `Sektor Nəbzi` wording instead of pipeline/developer phrasing.
- News detail pages now use the simplified article-first layout with a single source CTA and share block.
- Locale news detail route now points at the same redesigned article page.
- Untranslated `editor pick` flags were cleared in the database so public hero selection cannot surface untranslated articles.
- Blog route can now safely render legacy `picsum.photos` cover images because the host was added to the image allowlist.
- Footer resource links were cleaned up to remove duplicate and unclear labels such as `HAP Bilgilər` and `DK Digest`.

## [0.8.0] - 2026-04-05 - Phase 4: RSS News Pipeline

### Added
- POST /api/news/fetch - real RSS fetch (rss-parser, 6 HoReCa source)
- POST /api/news/translate - DeepSeek EN->AZ translate
- lib/news/rss-pipeline.ts - fetch+translate pipeline
- Public /haberler real DB-dən (mock əvəzinə)
- /haberler/[slug] detail page (titleAz, summaryAz, source link)
- Editor Pick hero card
- Category tab filter
- NEWS_API_SECRET security (admin session || API key)
- docs/ENV-SETUP.md

## [0.7.0] - 2026-04-05 - Phase 2: Admin OCAQ Real DB CRUD

### Changed
- Dashboard stats: mock -> real COUNT queries
- /dashboard/ilanlar: mock list -> real DB query + filter + pagination
- /dashboard/ilanlar/[id]: mock detail -> real DB + status update + review insert
- /dashboard/xeberler: mock -> real news_articles DB query
- /dashboard/xeberler/rss: real news_sources toggle
- /dashboard/ayarlar: real site_settings read/write

### Added
- lib/repositories/listingRepository.ts
- lib/repositories/newsRepository.ts
- lib/repositories/settingsRepository.ts
- API: /api/listings (admin query), /api/listings/[id]/reviews
- API: /api/news/admin, /api/news/admin/[id], /api/news/sources/[id]
- API: /api/settings
- /dashboard/blog/yeni alias route

### Planned
- Phase 2: Admin OCAQ real DB CRUD
- Phase 3: Resend email + Cloudinary media env activation
- Phase 4: RSS news pipeline
- Phase 5: KAZAN AI production upgrade

### Added
- `CLAUDE-DESIGN.md` repo kökünə əlavə olundu
- `CHANGELOG.md` repo kökünə əlavə olundu

### Changed
- `KAZAN AI` provider chain `DeepSeek -> Anthropic -> static` olaraq düzəldi
- Chat UI üçün 3 saniyə client throttle, `KAZAN düşünür...` loading state və nümunə sual düzəlişi edildi

## [0.6.0] - 2026-04-04 - Phase 0: CTO Architecture Setup

### Added
- `CLAUDE-DESIGN.md` foundation sənədi
- `CHANGELOG.md` tarix faylı
- Phase 0-5 arxitektura planı
- quality gate qaydaları

## [0.5.0] - 2026-04-03 - PR#12: Blog DB Migration

### Changed
- Blog yazıları Neon PostgreSQL-ə migrate olundu
- Repository pattern və fallback saxlanıldı
- Blog admin axını real DB ilə işləməyə başladı

## [0.4.0] - 2026-04-02 - PR#11: Real Database Connection

### Added
- Neon PostgreSQL real bağlantı
- Drizzle ORM schema push
- Seed data: listings, users, news sources
- Custom member auth üçün bcrypt hash

### Security
- Admin seed password production-da dəyişməlidir

## [0.9.3] - 2026-04-12 - Mobile Triage Addendum

### Fixed
- `NewsPreview` mobil kart spacing, button width və type scale düzəldi
- `app/[locale]/page.tsx` daxilində blog və B2B section spacing mobil üçün rahatlaşdırıldı
- `FloatingKazanWidget` mobil ölçü və alt-sağ yerləşimi content overlap riskini azaltdı

### Notes
- PR#36 üzərinə mobile triage əlavə edildi

## [0.3.0] - 2026-03-30 - PR#9: Mega Sprint

### Added
- `/ilanlar` vitrini və modal axını
- `/ilan-ver` multi-step form
- `listingFieldConfig.ts` single source of truth
- Admin OCAQ panel shell
- Auth flow-ları: register, login, forgot/reset/change password, verify
- `imageUtils.ts` və media degrade axını
- Email template-lər
- Status workflow

### Important
- Admin CRUD bu mərhələdə hələ tam real DB CRUD deyil

## [0.2.0] - 2026-03-29 - PR#5/#6/#7: Infrastructure Fixes

### Fixed
- i18n routing və middleware axını
- Toolkit route normalization
- Register/Login input görünüşü
- ESLint səhvləri

### Changed
- Mega menu trigger dili
- KAZAN AI badge `BETA` oldu
- Header panel linkləri düzəldi

## [0.1.0] - 2026-03-27 - İlkin Launch

### Added
- Blog və toolkit səhifələri
- KAZAN AI teaser page və API route
- `KazanAiChatClient.tsx`
- `knowledge-base.ts` və `system-prompt.ts`
- i18n scaffold
- Drizzle schema
- RSS source xəritəsi
- Homepage section-ları
- Header, Footer, MegaMenu
