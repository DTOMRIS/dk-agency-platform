# DK Agency - CTO Durum Raporu / Aprel 2026

Audit tarixi: 10 Aprel 2026  
Branch: `main`  
Son sync: `git pull origin main` fast-forward `54ae675..31818ed`

## 0. Qısa Nəticə

- Kritik blok: public route-lar dev serverdə redirect loop verir. `GET /`, `/ilanlar`, `/haberler`, `/az`, `/az/ilanlar`, `/az/haberler` hamısı `307 Location: eyni path` davranışı göstərdi. Dashboard route-ları middleware xaricində qaldığı üçün 200 dönür.
- Admin əsas real DB işləri mövcuddur: dashboard stats, ilanlar, xəbər review paneli, blog CRUD və ayarlar API/repository ilə yazılıb.
- DB aktivdir: `.env.local` içində `DATABASE_URL` var və Neon query-ləri işləyir.
- DB sayları: 12 listing, 60 news article, 18 public approved/translated xəbər, 13 blog post, 12 news source, 0 site setting row.
- Header nav-da hələ `Trendlər` yazır. Public `/haberler` və Footer artıq `Sektor Nəbzi` sözünü istifadə edir.
- Design sistemdə əsas rənglər var, amma `app/globals.css` body default olaraq dark token-lara bağlıdır və çox sayda public/toolkit/blog blokunda `bg-slate-950` / `bg-slate-900` istifadə olunur. CLAUDE-DESIGN light-only qaydası tam qorunmur.
- Font importu `app/layout.tsx` içində DM Sans + Playfair Display ilə var. Amma Tailwind v4 `@theme` içində `--font-sans: var(--font-geist-sans)` qalır və `--font-display` theme token kimi tanımlı deyil. Buna görə `font-display` utility-lərinin real Playfair tətbiqi ayrıca yoxlanmalıdır.

## 1. Route Audit

Qeyd: aşağıdakı status kod strukturu kod səviyyəsində verilib. Runtime səviyyəsində public route-lar hazırda middleware redirect loop səbəbi ilə açılmır; ona görə public route-lar üçün ayrıca kritik qeyd var.

| Page file | Status |
|---|---|
| `app/[locale]/about/page.tsx` | İŞLƏYİR, amma public runtime redirect loop altındadır |
| `app/[locale]/blog/[slug]/page.tsx` | İŞLƏYİR, DB blog detail |
| `app/[locale]/blog/page.tsx` | İŞLƏYİR, `/api/blog` + static fallback |
| `app/[locale]/contact/page.tsx` | İŞLƏYİR |
| `app/[locale]/cookies/page.tsx` | PLACEHOLDER |
| `app/[locale]/dashboard/ilanlar/[id]/page.tsx` | İŞLƏYİR |
| `app/[locale]/dashboard/ilanlar/page.tsx` | İŞLƏYİR |
| `app/[locale]/elaqe/page.tsx` | PLACEHOLDER |
| `app/[locale]/forgot-password/page.tsx` | İŞLƏYİR |
| `app/[locale]/haberler/[slug]/page.tsx` | İŞLƏYİR, locale wrapper |
| `app/[locale]/haberler/page.tsx` | İŞLƏYİR, locale wrapper |
| `app/[locale]/haqqimizda/page.tsx` | PLACEHOLDER |
| `app/[locale]/ilanlar/page.tsx` | İŞLƏYİR, wrapper |
| `app/[locale]/ilan-ver/page.tsx` | İŞLƏYİR, wrapper |
| `app/[locale]/kazan-ai/page.tsx` | İŞLƏYİR, wrapper |
| `app/[locale]/page.tsx` | İŞLƏYİR kod var, amma runtime redirect loop |
| `app/[locale]/privacy/page.tsx` | PLACEHOLDER |
| `app/[locale]/randevu/page.tsx` | PLACEHOLDER |
| `app/[locale]/reset-password/page.tsx` | İŞLƏYİR |
| `app/[locale]/settings/page.tsx` | İŞLƏYİR |
| `app/[locale]/terefdashlar/page.tsx` | PLACEHOLDER |
| `app/[locale]/terms/page.tsx` | PLACEHOLDER |
| `app/[locale]/toolkit/aqta-checklist/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/basabas/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/branding-guide/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/checklist/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/delivery-calc/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/food-cost/page.tsx` | İŞLƏYİR, bəzi placeholder/local state elementləri var |
| `app/[locale]/toolkit/insaat-checklist/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/menu-matrix/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/pnl/page.tsx` | İŞLƏYİR |
| `app/[locale]/toolkit/staff-retention/page.tsx` | İŞLƏYİR |
| `app/[locale]/uzvluk/page.tsx` | İŞLƏYİR |
| `app/[locale]/verify-email/page.tsx` | İŞLƏYİR |
| `app/auth/forgot-password/page.tsx` | İŞLƏYİR |
| `app/auth/login/page.tsx` | MOCK/PLACEHOLDER auth flow elementləri var |
| `app/auth/register/page.tsx` | MOCK/PLACEHOLDER auth flow elementləri var |
| `app/b2b-panel/[slug]/page.tsx` | PLACEHOLDER |
| `app/b2b-panel/ilanlarim/page.tsx` | MOCK |
| `app/b2b-panel/mesajlar/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/page.tsx` | İŞLƏYİR |
| `app/b2b-panel/toolkit/financial-health/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/franchise-readiness/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/inventory/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/lsm-planner/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/operational-audit/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/page.tsx` | İŞLƏYİR |
| `app/b2b-panel/toolkit/pnl-simulator/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/roi-calculator/page.tsx` | İŞLƏYİR |
| `app/b2b-panel/toolkit/talent-up/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/toolkit/workforce/page.tsx` | PLACEHOLDER/MOCK |
| `app/b2b-panel/yeni-ilan/page.tsx` | İŞLƏYİR |
| `app/dashboard/aqta-checklist/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/ayarlar/page.tsx` | İŞLƏYİR, real settings API/repository, DB boş olduğu üçün default |
| `app/dashboard/b2b-yonetimi/page.tsx` | MOCK |
| `app/dashboard/blog/[slug]/page.tsx` | İŞLƏYİR, real DB blog detail/edit |
| `app/dashboard/blog/new/page.tsx` | İŞLƏYİR |
| `app/dashboard/blog/page.tsx` | İŞLƏYİR, real DB |
| `app/dashboard/blog/yeni/page.tsx` | İŞLƏYİR, alias |
| `app/dashboard/deal-flow/page.tsx` | İŞLƏYİR kod var, data source tam real deyil |
| `app/dashboard/duyurular/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/etkinlikler/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/haberler/page.tsx` | MOCK, köhnə mock news panel |
| `app/dashboard/hero/page.tsx` | MOCK/local state |
| `app/dashboard/ilanlar/[id]/page.tsx` | İŞLƏYİR, real DB + mock fallback |
| `app/dashboard/ilanlar/page.tsx` | İŞLƏYİR, real DB + mock fallback |
| `app/dashboard/ilan-onaylari/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/kullanicilar/page.tsx` | MOCK |
| `app/dashboard/loglar/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/mesajlar/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/page.tsx` | İŞLƏYİR, real DB + fallback |
| `app/dashboard/pipeline/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/raporlar/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/roller/page.tsx` | PLACEHOLDER/MOCK |
| `app/dashboard/settings/page.tsx` | İŞLƏYİR, sadə statik page |
| `app/dashboard/site/page.tsx` | MOCK/local state |
| `app/dashboard/toolkit/page.tsx` | MOCK/local state |
| `app/dashboard/trends/page.tsx` | MOCK |
| `app/dashboard/users/page.tsx` | MOCK |
| `app/dashboard/xeberler/page.tsx` | İŞLƏYİR, real DB news admin + editor, amma client console log-ları qalır |
| `app/dashboard/xeberler/rss/page.tsx` | İŞLƏYİR, real DB news sources |
| `app/docs/member-env-checklist/page.tsx` | İŞLƏYİR |
| `app/forgot-password/page.tsx` | İŞLƏYİR |
| `app/haberler/[slug]/page.tsx` | İŞLƏYİR, real DB public detail |
| `app/haberler/page.tsx` | İŞLƏYİR kod var, runtime redirect loop |
| `app/ilanlar/page.tsx` | İŞLƏYİR kod var, runtime redirect loop |
| `app/ilan-ver/page.tsx` | İŞLƏYİR |
| `app/kazan-ai/page.tsx` | İŞLƏYİR kod var, runtime redirect loop |
| `app/news/page.tsx` | MOCK/köhnə static news page |
| `app/reset-password/page.tsx` | İŞLƏYİR |
| `app/settings/page.tsx` | MOCK auth state istifadə edir |
| `app/toolkit/aqta-checklist/page.tsx` | İŞLƏYİR |
| `app/toolkit/basabas/page.tsx` | İŞLƏYİR |
| `app/toolkit/branding-guide/page.tsx` | İŞLƏYİR |
| `app/toolkit/checklist/page.tsx` | İŞLƏYİR |
| `app/toolkit/delivery-calc/page.tsx` | İŞLƏYİR |
| `app/toolkit/food-cost/page.tsx` | İŞLƏYİR |
| `app/toolkit/insaat-checklist/page.tsx` | İŞLƏYİR, bəzi placeholder/local state blokları var |
| `app/toolkit/menu-matrix/page.tsx` | İŞLƏYİR, bəzi placeholder/local state blokları var |
| `app/toolkit/page.tsx` | İŞLƏYİR kod var, runtime redirect loop |
| `app/toolkit/pnl/page.tsx` | İŞLƏYİR |
| `app/toolkit/staff-retention/page.tsx` | İŞLƏYİR |
| `app/uzvluk/page.tsx` | PLACEHOLDER checkout flow |
| `app/verify-email/page.tsx` | İŞLƏYİR |
| `app/xeberler/[slug]/page.tsx` | İŞLƏYİR wrapper |
| `app/xeberler/page.tsx` | İŞLƏYİR wrapper |

Əlavə YOX: `app/page.tsx` yoxdur. `/` route-u `next-intl` middleware ilə idarə olunmalı idi, amma hazırda 307 self-redirect loop verir.

## 2. Admin Panel Audit

### `/dashboard`

- Real stats var: `getDashboardListingMetrics()` listing və lead count-ları DB-dən oxuyur.
- Member count və blog count DB-dən oxunur.
- DB yoxdursa fallback var: `adminUsers.length`, `MOCK_LISTINGS`.
- Dev serverdə 200 render verdi.

### `/dashboard/ilanlar`

- Real DB: `/api/listings?scope=admin` -> `getAdminListings()`.
- Filter, search, pagination var.
- Catch fallback `MOCK_LISTINGS`.
- DB say: 12 listing.

### `/dashboard/xeberler`

- Real DB: `/api/news/admin` -> `getAdminNewsArticles()` -> `news_articles` + `news_sources`.
- Admin editor modalı var: AZ title/summary edit, image upload, status update, editor pick.
- DB say: 60 xəbər.
- Dev serverdə 200 render verdi.
- Problem: çoxlu `console.log` / `console.error` debug log-ları client kodunda qalır.

### `/dashboard/blog`

- Real DB: `getBlogPostsFromDb({ status: 'all' })`.
- Detail/edit və new/yeni route-ları DB repository ilə bağlıdır.
- DB say: 13 blog post.
- Public blog list `/api/blog` ilə `published` status oxuyur.

### `/dashboard/ayarlar`

- Real API/repository var: `/api/settings` -> `site_settings`.
- Amma DB-də `site_settings` row sayı 0. Ekran default settings ilə dolur.
- API admin session tələb edir; real istifadə üçün admin session lazımdır.

### Hero / Toolkit / Sayt / İstifadəçilər

- `/dashboard/hero`: mock/local state. Save/publish sadəcə `console.log`.
- `/dashboard/toolkit`: mock/local state. `adminToolkitCards` istifadə edir, save sadəcə `console.log`.
- `/dashboard/site`: mock/local state. Səhifənin öz mətni də `mock CRUD` deyir. Partner/logo upload local preview.
- `/dashboard/users`: mock/local state. `adminUsers` array.
- `/dashboard/kullanicilar`: ayrıca köhnə/mock istifadəçi paneli də var.

## 3. Public Səhifələr Audit

### `/` homepage

Kod səviyyəsində `app/[locale]/page.tsx` section-ları:

- `Hero`
- `PartnersCarousel`
- `ToolkitShowcase`
- `Necə işləyir?`
- `StageSelector`
- `Bloq & Analizlər`
- `NewsPreview`
- `HORECA B2B Elanlar`
- `AdsPreview`
- `DoganNote`
- `JoinCTA`
- `CookiesBanner`

Runtime: açılmır. Dev serverdə `/` 307 ilə yenə `/` location verir və redirect loop olur.

### `/ilanlar`

- Kod: `ListingsShowcasePage`, `/api/listings?showcase=true`.
- DB public showcase count: 6.
- Runtime: public route redirect loop səbəbi ilə açılmır.

### `/haberler`

- Kod: real DB public news list.
- Public approved/translated xəbər sayı: 18.
- Başlıq: `Sektor Nəbzi` var.
- Runtime: public route redirect loop səbəbi ilə açılmır.

### `/blog`

- Kök `app/blog/page.tsx` yoxdur.
- Locale route `app/[locale]/blog/page.tsx` var və `/api/blog` istifadə edir.
- Published blog count: 13.
- Detail route `app/[locale]/blog/[slug]/page.tsx` DB detail açır.
- Runtime: `/az/blog` də redirect loop verir.

### `/kazan-ai`

- UI: `KazanAiChatClient`.
- API provider chain: `DEEPSEEK_API_KEY` -> `ANTHROPIC_API_KEY`/`CLAUDE_API_KEY` -> static fallback.
- `.env.local` içində AI key yoxdur, ona görə real AI yox, static fallback işləyər.
- Runtime: public route redirect loop səbəbi ilə səhifə açılmır.

### `/toolkit`

- Toolkit ana səhifədə 10 alət linki var:
  1. Açılış Checklist
  2. İnşaat Checklist
  3. AQTA Hazırlıq
  4. Markalaşma Guide
  5. Başabaş Nöqtəsi
  6. Food Cost Kalkulyator
  7. P&L Simulyator
  8. Menyu Matrisi
  9. İşçi Saxlama
  10. Delivery Kalkulyator
- Hər birinin `app/toolkit/.../page.tsx` file-ı var.
- Runtime: `/toolkit` public route redirect loop səbəbi ilə açılmır.

## 4. Dizayn Audit

### Header

- Nav item-lar: `Ana səhifə`, `Alətlər`, `İlanlar`, `Trendlər`, `Bloq`, `İdarə Paneli`.
- Problem: `Trendlər` hələ qalır. Tələb olunan final copy `Sektor Nəbzi` olmalıdır.
- Header utility bar dark navy-dir; bu CLAUDE-DESIGN istisnasına uyğundur.

### Footer

- Footer resource linkləri təmizlənib.
- `HAP Bilgilər` və `DK Digest` yoxdur.
- `Sektor Nəbzi` linki var.
- PR#28 changelog fix-i kodda görünür.

### Rənglər

- Token-lar mövcuddur: navy `#1A1A2E`, gold `#C5A022`, red `#E94560`, paper/white bg.
- `app/globals.css` içində əlavə dark token-lar da var: `--dk-night`, `--dk-surface-dark`, `--background: var(--bg-deepest)`.
- `body` root layout-da `bg-white` olsa da CSS body background dark token-a bağlıdır. Bu dizayn qaydası ilə risklidir.

### Font

- `app/layout.tsx`: `DM_Sans` və `Playfair_Display` import olunub.
- Body `font-sans` alır, amma `app/globals.css` Tailwind theme-də `--font-sans: var(--font-geist-sans)` qalır. Bu token səhv görünür.
- `font-display` class-ları çox yerdə istifadə olunur, amma Tailwind theme-də `--font-display` tanımı yoxdur. Playfair-in həqiqətən tətbiq olunması üçün generated CSS/browser yoxlaması lazımdır.

### Dark Tema

- CLAUDE-DESIGN: dark tema qadağandır, yalnız utility bar + KAZAN widget istisna.
- Kodda dark bg çoxdur: blog hero, toolkit hero-lar, CTA section-lar, news köhnə page, auth login panel, bəzi calculator result box-ları.
- Bu qayda pozuntusudur. Public redirect loop düzələndən sonra vizual sweep edilməlidir.

### Mobile

- Kodda responsive class-lar geniş istifadə olunur (`sm`, `md`, `lg`, grid breakpoints).
- Amma runtime public route-lar açılmadığı üçün mobile vizual təsdiq edilə bilmədi.
- Dashboard 200 render verdi; mobile browser console/screenshot yoxlaması repoda Playwright/Puppeteer olmadığı üçün edilmədi.

## 5. Console / Dev Server Check

Komanda:

```bash
npm run dev -- -H 127.0.0.1 -p 3011
```

Nəticə:

- `/dashboard`: 200
- `/dashboard/xeberler`: 200
- `/`, `/az`, `/ilanlar`, `/az/ilanlar`, `/haberler`, `/az/haberler`, `/az/blog`, `/az/kazan-ai`, `/az/toolkit`: redirect loop

Dev stderr warning-ləri:

- `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- Node warning: `DEP0060 util._extend API is deprecated. Please use Object.assign() instead.`

Public redirect header yoxlaması:

```text
/          -> 307 Location: /
/az        -> 307 Location: /
/ilanlar   -> 307 Location: /ilanlar
/az/ilanlar -> 307 Location: /ilanlar
/haberler  -> 307 Location: /haberler
/az/haberler -> 307 Location: /haberler
```

Bu self-redirect döngüsü public səhifələrin real açılmasını bloklayır.

## 6. Env Check

`.env.local` içində olan key adları:

```text
DATABASE_URL
```

AI, media, email key-ləri yoxdur:

- `DEEPSEEK_API_KEY` yoxdur
- `ANTHROPIC_API_KEY` / `CLAUDE_API_KEY` yoxdur
- `CLOUDINARY_*` yoxdur
- `RESEND_*` yoxdur

## 7. Changelog-da Son Görünən Maddələr

`CHANGELOG.md` hazırda iş ağacında əlavə lokal dəyişiklik kimi görünür. Bu dəyişikliklər istifadəçinin dediyi maddələrlə uyğun gəlir və bu audit tərəfindən dəyişdirilməyib.

Yeni görünən `Unreleased` maddələri:

- VPS/Gemma 4: CPU-only və məhdud RAM səbəbi ilə local inference production üçün park edilib.
- OpenClaw/Almila: OpenRouter 402 riski aradan qaldırılıb, DeepSeek direct model route təsdiqlənib.
- Almila v3.2: lead capture, WhatsApp deep link, objection handling və employer mode demo üçün hazır kimi qeyd olunub.
- Workspace-level `SOUL.md` köhnə CTA formatı problemi düzəldilib.
- WhatsApp CTA tam `https://wa.me/...?...text=...` deep link formatına keçirilib.
- İlk greeting davranışı yumşaldılıb; sadə salamda dərhal ad/telefon istəmir.
- DK Agency HoReCa sales sprint: 20 Bakı target account və 10 Aprel 2026 outreach pack qeyd olunub.
- AEO mini-audit premium restoranlar üçün low-friction entry offer kimi əlavə olunub.

Əvvəlki `Unreleased` fix-ləri:

- Public `/haberler` editor pick fallback düzəlişi.
- Admin news approve API Azərbaycan title/summary olmayan xəbəri approve etməyi bloklayır.
- News cards category gradient placeholder istifadə edir.
- Public news heading `Sektor Nəbzi` wording alıb.
- News detail page sadələşdirilib.
- Locale news detail redesign-a yönlənir.
- Untranslated editor pick flag-ləri DB-də təmizlənib.
- `picsum.photos` image allowlist-ə əlavə olunub.
- Footer resource linkləri təmizlənib.

## 8. Prioritet Risklər

1. Public route redirect loop - production üçün blokerdir.
2. Header copy: `Trendlər` -> `Sektor Nəbzi`.
3. Light-only dizayn qaydası pozulur: çox dark section var.
4. Font theme token-ları qarışıqdır: DM Sans/Playfair import var, amma Tailwind token-lar Geist/undefined display göstərir.
5. Admin mock sahələri qalır: Hero, Toolkit, Site, Users, b2b/trends/duyurular/mesajlar/raporlar/roller.
6. KAZAN AI real deyil: `.env.local` AI key yoxdur, static fallback qalır.
7. `site_settings` DB row sayı 0, ayarlar default-dan gəlir.
