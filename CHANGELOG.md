# Changelog - DK Agency Platform

Bütün dəyişikliklər bu faylda qeyd olunur.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Fixed
- Public `/haberler` hero now prefers translated editor picks only and falls back safely when an editor pick is not publishable.
- Admin news approve API now blocks approving articles that do not have Azerbaijani title/summary content.
- News cards now use category-based gradient placeholders instead of generic dark image fallbacks.
- Public news heading copy now uses final `Sektor Nəbzi` wording instead of pipeline/developer phrasing.

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
