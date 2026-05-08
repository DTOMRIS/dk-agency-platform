# i18n Component-Level Audit

**Tarix:** 8 May 2026
**Metod:** Cyrillic character grep + `Record<Locale>` / `useTranslations` istifadə yoxlaması

## Xülasə

| Kateqoriya | Fayllar | Hardcoded sətir |
|------------|---------|-----------------|
| NO i18n (real problem) | 120 | 3012 |
| HAS inline `Record<Locale>` (OK) | 45 | 2081 |
| **CƏMİ** | **165** | **5093** |

## Kritik Tapıntı: Kütləvi Duplikasiya

8 komponent **27 nüsxədə** mövcuddur. Yalnız `components/layout/` versiyaları import olunur, qalanları ölü koddur:

| Komponent | Nüsxə | Aktiv | Ölü |
|-----------|--------|-------|-----|
| Footer | 5 | `layout/Footer.tsx` | `Footer.tsx`, `home/`, `shared/`, `editorial/` |
| Header | 4 | `layout/Header.tsx` | `Header.tsx`, `home/`, `shared/` |
| Hero | 3 | `Hero.tsx` (Record\<Locale\>) | `home/`, `shared/` |
| AdsPreview | 3 | `AdsPreview.tsx` (Record\<Locale\>) | `home/`, `shared/` |
| CTASections | 3 | `CTASections.tsx` (Record\<Locale\>) | `home/`, `shared/` |
| NewsPreview | 3 | `NewsPreview.tsx` (Record\<Locale\>) | `home/`, `shared/` |
| StageSelector | 3 | `StageSelector.tsx` (Record\<Locale\>) | `home/`, `shared/` |
| ToolkitShowcase | 3 | `ToolkitShowcase.tsx` (Record\<Locale\>) | `home/`, `shared/` |

**Tövsiyə:** Ölü nüsxələri silin (19 fayl). Fix etmək deyil — silin.

## Top-Level Layout Komponentləri

### Footer (`components/layout/Footer.tsx`)

- **Status:** `Record<Locale>` var, amma **inline RU hardcoded** — dil dəyişdikdə dəyişir
- Hardcoded sətir: 20 (RU locale data)
- Problem: Bütün link label-ları və section başlıqları RU dilindədir
- Nümunə: `'Инструменты'`, `'P&L калькулятор'`, `'Ресурсы'`, `'Компания'`
- **Tövsiyə:** OK — inline i18n pattern işləyir. Əgər `messages/*.json`-a köçürmək istəsəniz, ayrı task.
- **Effort:** 15 dəq (əgər json-a keçsə)

### Header / MegaMenu (`components/layout/Header.tsx`, `components/layout/MegaMenu.tsx`)

- **Header:** `Record<Locale>` var, 27 cyrillic lines (RU translations)
- **MegaMenu:** HEÇ i18n YOXDUR, 23 cyrillic sətir
- Nümunə: nav link-lər, dropdown label-lar
- **Tövsiyə:** MegaMenu-ya `Record<Locale>` əlavə et
- **Effort:** 30 dəq

### Top Banner (Header-in daxilində)

- "НОВОЕ: KAZAN AI..." — `Header.tsx`-in `Record<Locale>` ru bölməsindədir
- **Status:** OK — dil dəyişdikdə düzgün dəyişir

## Toolkit Calculators (ən böyük problem)

Bu fayllar `Record<Locale>` YOXDUR, `useTranslations` YOXDUR — tam hardcoded:

| Fayl | Sətir | Effort |
|------|-------|--------|
| `app/toolkit/aqta-checklist/page.tsx` | 137 | 45 dəq |
| `app/toolkit/insaat-checklist/page.tsx` | 104 | 45 dəq |
| `app/[locale]/toolkit/food-cost/page.tsx` | 97 | 30 dəq |
| `app/[locale]/toolkit/pnl/page.tsx` | 90 | 30 dəq |
| `app/toolkit/menu-matrix/page.tsx` | 64 | 30 dəq |
| `app/toolkit/delivery-calc/page.tsx` | 62 | 30 dəq |
| `app/toolkit/basabas/page.tsx` | 60 | 30 dəq |

**Cəmi:** 614 sətir, ~4 saat effort

## Dashboard Admin Səhifələri

| Fayl | Sətir | Effort |
|------|-------|--------|
| `app/dashboard/aqta-checklist/page.tsx` | 213 | 45 dəq |
| `app/dashboard/xeberler/page.tsx` | 126 | 30 dəq |
| `app/dashboard/b2b-yonetimi/page.tsx` | 114 | 30 dəq |
| `app/dashboard/kullanicilar/page.tsx` | 86 | 30 dəq |
| `app/dashboard/duyurular/page.tsx` | 82 | 30 dəq |
| `app/dashboard/deal-flow/page.tsx` | 73 | 30 dəq |
| `app/dashboard/etkinlikler/page.tsx` | 67 | 30 dəq |
| `app/dashboard/hero/page.tsx` | 62 | 20 dəq |
| `app/dashboard/ilanlar/page.tsx` | 62 | 20 dəq |
| `app/dashboard/faturalar/[id]/page.tsx` | 55 | 20 dəq |
| Digər dashboard səhifələri (~15) | ~500 | ~4 saat |

**Cəmi:** ~1440 sətir, ~8 saat effort

## KAZAN AI Components

| Fayl | Sətir | Effort |
|------|-------|--------|
| `components/kazan-ai/FloatingKazanWidget.tsx` | 26 | 15 dəq |
| `components/kazan-ai/KazanAiChatClient.tsx` | 23 | 15 dəq |

## Listing Components

| Fayl | Sətir | Effort |
|------|-------|--------|
| `components/listings/CreateListingForm.tsx` | 62 | 30 dəq |
| `components/listings/ListingsShowcasePage.tsx` | 47 (inline i18n var) | 15 dəq |
| `components/listings/ListingSubmissionPage.tsx` | 34 | 20 dəq |
| `components/listings/ListingForm.tsx` | 40 | 20 dəq |
| `components/listings/ListingModal.tsx` | 9 | 10 dəq |
| `components/listings/LeadForm.tsx` | 5 | 5 dəq |

## Blog / News Components

| Fayl | Sətir | Effort |
|------|-------|--------|
| `components/news/SektorNabziTabs.tsx` | 74 | 30 dəq |
| `components/blog/BlogElements.tsx` | 45 | 20 dəq |
| `components/dashboard/BlogEditorForm.tsx` | 41 | 20 dəq |
| `components/blog/MarkdownRenderer.tsx` | 20 | 15 dəq |
| `components/blog/MikroCTA.tsx` | 19 | 15 dəq |
| `components/blog/BlogSidebars.tsx` | 17 | 15 dəq |
| `components/news/BlogContentWrapper.tsx` | 14 | 10 dəq |
| `components/blog/DoganNote.tsx` | 11 | 10 dəq |
| `components/blog/GuruQuoteBox.tsx` | 9 | 10 dəq |

## Settings / Auth

| Fayl | Sətir | Status |
|------|-------|--------|
| `components/auth/ForgotPasswordPageClient.tsx` | 29 | ✅ Record\<Locale\> — OK |
| `components/auth/ResetPasswordPageClient.tsx` | 38 | ✅ Record\<Locale\> — OK |
| `app/auth/register/page.tsx` | 78 | Record\<Locale\> — OK |
| `components/auth/VerifyEmailPageClient.tsx` | 6 | ❌ NO i18n |
| `components/settings/SettingsPageClient.tsx` | 19 | ❌ NO i18n |

## Prioritet Sırası (fix üçün)

1. **P0 — Ölü kod sil** (19 fayl, 30 dəq)
2. **P1 — Public layout:** MegaMenu i18n (30 dəq)
3. **P2 — Toolkit calculators** (7 fayl, ~4 saat)
4. **P3 — Dashboard admin** (~15 fayl, ~8 saat)
5. **P4 — Blog/News components** (9 fayl, ~2.5 saat)
6. **P5 — Listing components** (6 fayl, ~1.5 saat)
7. **P6 — KAZAN AI + Settings + misc** (5 fayl, ~1 saat)

## Ümumi Effort Təxmini

| Prioritet | Fayllar | Təxmini vaxt |
|-----------|---------|-------------|
| P0 (ölü kod) | 19 | 30 dəq |
| P1 (MegaMenu) | 1 | 30 dəq |
| P2 (Toolkit) | 7 | 4 saat |
| P3 (Dashboard) | 15 | 8 saat |
| P4 (Blog/News) | 9 | 2.5 saat |
| P5 (Listings) | 6 | 1.5 saat |
| P6 (Misc) | 5 | 1 saat |
| **CƏMİ** | **62** | **~18 saat** |
