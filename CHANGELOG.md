# Changelog - DK Agency Platform

Bütün dəyişikliklər bu faylda qeyd olunur.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

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
