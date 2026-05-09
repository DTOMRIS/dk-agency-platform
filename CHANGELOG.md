# Changelog - DK Agency Platform

Bütün dəyişikliklər bu faylda qeyd olunur.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [2026-05-09] — Marketinq Ocagi Sprint 1: Faza 0 Infrastructure (TASK-0101)

### Added
- **Marketinq Ocagi toolkit infrastructure** — 12 AI-powered marketing tools framework
  - `lib/marketing-tools-config.ts` — single source of truth for all 12 tools (slug, tier, category, AI provider, input schema, run limits)
  - `lib/ai-router.ts` — unified DeepSeek + Claude AI gateway with automatic fallback, cost tracking per token
  - `lib/marketing-gating.ts` — SAGIRD/KALFA/USTA tier-based access control with monthly run limits
  - `marketing_tool_runs` table in DB schema with user/slug/status indexes
- **Dashboard pages** — `/dashboard/marketinq-ocagi` index (12 cards, 4 categories) + `/dashboard/marketinq-ocagi/[slug]` dynamic placeholder
- **OCAQ sidebar entry** — "Marketinq Ocagi" with Sparkles icon, 4-language copy (AZ/EN/TR/RU)
- **i18n keys** — `marketing.ocagi` + `marketing.tools.*` for all 12 tools in `messages/az.json`

### Tool Inventory (all status: planned)
| Pille | Aletler |
|-------|---------|
| SAGIRD (pulsuz) | Gorunurluk Testi, KST Yoxlayici, GBP Qurucu, Marka Kompasi |
| KALFA (49 AZN/ay) | SMM Plan AI, Caption Yazici, Promosyon ROI, Kampaniya Takvimi, Rey Cavab AI |
| USTA (149 AZN/ay) | Reqib Radari, AI Vizyual Studyo, AEO Skoru |

### Notes
- All 12 tools display "Tezlikle" badge — no tool is implemented yet
- AI router tested at build time only, real API calls in Sprint 2
- DB migration needs `drizzle-kit generate` + `drizzle-kit push` to Neon
- Sprint 2 target: Marka Kompasi full implementation

---

## [2026-05-07] — Auth Password Reset + Deployment Docs

### Fixed
- **forgot-password endpoint** — replaced in-memory mock with real Neon/Drizzle DB implementation
  - User lookup via `users` table, token stored in `passwordResetTokens`
  - Email sent via SMTP with locale-aware `passwordReset` template
  - Email enumeration protection: always returns 200
- **reset-password endpoint** — real DB token validation + bcrypt password hash update
  - Token expiry check (1 hour), used-at marking, `users.passwordHash` update

### Added
- Rate limit for reset-password: 5 requests/hour/IP (`RATE_LIMITS.authResetPassword`)
- `docs/DEPLOYMENT.md` — complete deployment guide (Hostinger, env vars, SMTP, DB, pitfalls, smoke tests)

---

## [2026-05-06] — CTO Sprint: i18n 100%, Security, Performance

### Added
- **i18n Phase 1-3 complete — 62/62 pages translated to 4 languages (AZ/RU/EN/TR)**
  - Phase 1: Auth sidebar, Header, MegaMenu (PR #82)
  - Phase 2: Public routes — blog, news, ilanlar, toolkit, pricing (PR #82)
  - Phase 3: Admin dashboard — 9 core pages (PR #89)
  - Phase 4: Full coverage — remaining 32 pages in one batch (PR #93)
- Mobile language switcher in header dropdown — Globe icon + 4 lang with active state (PR #87)
- SEO hreflang alternates for all locale routes with x-default (PR #84)
- Email templates i18n — all 9 templates (verification, welcome, password reset, listing notifications, KAZAN lead admin) now accept locale parameter (PR #86)
- Rate limiting utility (`lib/utils/rate-limit.ts`) — in-memory sliding window, IP-based (PR #91)
  - Auth endpoints: login 5/15min, register 3/1h, forgot-password 3/1h, verify-email 10/1h
  - AI endpoints: kazan-ai 30/1min, invoice-ocr 20/1h
  - 429 response with X-RateLimit-Limit/Remaining/Reset headers
  - Locale-aware error messages
- Lazy loading: CookiesBanner, AdsPreview, StageSelector via next/dynamic ssr:false (PR #92)

### Changed
- Brand color unification — 23 files converted from raw `red-500/600/700` to `dk-red`/`dk-red-strong` CSS tokens (PR #88)
- `brand-red` and `brand-red-hover` tokens added to @theme inline block in globals.css
- xlsx dynamic import in export-utils.ts and excel-parser.ts — no longer loaded at module init (PR #92)
- News API refactored from mock data to real Neon DB (PR #85)
- Mobile design pass — CategoryTabs scroll-snap, article reading ergonomics (PR #83)

### Fixed
- Console.log cleanup — 25+ debug logs deleted, 4 security-sensitive logs removed (token/password/reset-URL leaks), NODE_ENV guard on error logs (PR #90)

### Security
- Security sprint merged (PR #79): demo credentials removed, JWT enforcement, admin guards, password validation
- Rate limiting on all auth + AI endpoints prevents brute force attacks
- Sensitive console.log calls exposing tokens/passwords removed from production

### Removed
- Stale PRs closed: #45 (Resend email — superseded by Hostinger SMTP), #51 (Hostinger migration — completed separately)

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

## [2026-05-09] - TASK-0102 Contact Lead Funnel

### Added
- Contact page lead funnel with KAZAN AI, WhatsApp, and Telegram channel cards.
- `POST /api/leads/track` records contact CTA clicks in `leads` with `source`, `channel`, `locale`, `user_agent`, and `ip_hash`.
- `leads` table mapping and `idx_leads_source_channel` migration.
- 4-language `contact.funnel` namespace in `messages/*.json`.
- Playwright checks for 4 locales and WhatsApp tracking payload.

### Changed
- Removed the visible phone card from contact page. WhatsApp remains available through a localized prefilled redirect.

## [2026-05-09] - TASK-0100 P&L Simulator i18n

### Changed
- P&L Simulator now fully uses i18n across AZ/RU/EN/TR with `Intl.NumberFormat` currency and percent output.
