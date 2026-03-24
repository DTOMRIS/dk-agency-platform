# CTO DURUM RAPORU
Tarix: 24 Mart 2026
Hazirlayan: Claude Opus 4.6 (3 paralel agent ile tam audit)

---

## 1. BLOG YAZILARI

### Saxlama yeri:
- **Mock data** (statik TypeScript dosyalari) — database YOXDUR
- `lib/data/blogArticles.ts` — 9 esas meqale (tam icerik, Markdown format)
- `lib/data/editorialBlogArticles.ts` — 3 editorial qisa meqale
- `components/constants.ts` — BLOG_POSTS referanslari

### Blog yazilari siyahisi (9 eded):

| # | Slug | Bashliq |
|---|------|---------|
| 1 | `1-porsiya-food-cost-hesablama` | 1 Porsiya Sene Neceye Basha Gelir? Food Cost-un Qanli Heqiqeti |
| 2 | `pnl-oxuya-bilmirsen` | P&L Oxuya Bilmirsen? O Zaman Restoran Sahibi Deyilsen |
| 3 | `isci-saxlama-7-strategiya` | Ishcin Getdi? Problem Onda Deyil, Sende — 7 Saxlama Sistemi |
| 4 | `menyu-muhendisliyi-satis` | Menyu Muhendisliyi: Hansi Yemek Sene Pul Qazandirir, Hansini Oldur |
| 5 | `aqta-cerime-checklist` | AQTA Geldi, Cerime Yazdi — Sen Hazir Deyildin. Tam Checklist |
| 6 | `wolt-bolt-komissiyon` | Wolt/Bolt/Yango Senin Pulunu Yeyir? Komissiyanin Gizli Riyaziyyati |
| 7 | `kurumsal-kitabca` | Kurumsal Kitabca Olmadan Restoran Idare Etmek = Xaos |
| 8 | `insaatdan-acilisa-checklist` | Inshaatdan Acilisha: 52 Maddelik Heyat Qurtaran Checklist |
| 9 | `restoran-markasi` | Restoran Markasi = Loqo Deyil. Hissler, Dil, Medeniyyet |

### Editorial meqaleler (3 eded):
1. P&L Hesabati nedir ve niye vacibdir?
2. Food Cost nece hesablanir? (Addim-addim beledci)
3. Restoran acarkern edilen 12 boyuk sehv

### Ana sehifede gosterilir? BELI
- `app/page.tsx` icerisinde "Blog & Analizler" inline section — `NEWS_ITEMS`-dan 2 meqale karti gosterir
- Sehifeler: `/blog` (grid), `/blog/[slug]` (detay), `/haberler` (editorial hub), `/haberler/[slug]` (detay)

---

## 2. TOOLKITLER

### Toolkit ana sehifesi:
- `app/b2b-panel/toolkit/page.tsx` — 8 modul siyahisi

### Modul durumu:

| # | Modul | Route | Durum |
|---|-------|-------|-------|
| 1 | ROI Hesaplayici | `/b2b-panel/toolkit/roi-calculator` | **ISHLIYIR** (tam funksional) |
| 2 | P&L Simulyatoru | `/b2b-panel/toolkit/pnl-simulator` | COMING SOON (placeholder) |
| 3 | Operasyonel Audit | `/b2b-panel/toolkit/operational-audit` | COMING SOON |
| 4 | Ishci Heyeti & Vardiya | `/b2b-panel/toolkit/workforce` | COMING SOON |
| 5 | LSM Planlayici | `/b2b-panel/toolkit/lsm-planner` | COMING SOON |
| 6 | Maliyye Saglamliq | `/b2b-panel/toolkit/financial-health` | COMING SOON |
| 7 | Talent-Up | `/b2b-panel/toolkit/talent-up` | COMING SOON |
| 8 | Inventar Nezareti | `/b2b-panel/toolkit/inventory` | COMING SOON |

### Netice:
- **Yalniz 1 toolkit ishliyir** (ROI Calculator)
- Qalanlar `ComingSoon` komponenti gosterir
- Food Cost, Bashabash, Menyu Matrisi, Bazar Qiymetleri — **MOVCUD DEYIL** (ne komponent, ne route)
- Komut paketindeki "9 pulsuz alet" hedelinden cox uzaqdayiq

---

## 3. ILANLAR

### Saxlama: Mock data (database YOXDUR)
- `lib/data/listingCategories.ts` — 7 kateqoriya
- `components/constants.ts` — 4 numune ilan (AD_ITEMS)

### Kateqoriyalar:
1. devir — Ishletme Devri
2. franchise-vermek — Franchise Vermek
3. franchise-almak — Franchise Almak
4. ortak-tapmaq — Ortaq Bulmaq
5. yeni-investisiya — Yeni Yatirim
6. obyekt-icaresi — Mekan Kiralama
7. horeca-ekipman — HORECA Ekipman

### Sehifeler:
- `/b2b-panel/ilanlarim` — Istifadeci ilanlari (5 mock ilan)
- `/b2b-panel/yeni-ilan` — Yeni ilan formu (7 kateqoriya secimi)
- `/dashboard/ilan-onaylari` — Admin onay kuyrugu
- Ana sehifede `AdsPreview` komponenti ile 4 numune gosterilir

### Ilanlar ishliyir? QISMEN
- Form var, mock data var, admin onay sehifesi var
- Real database yoxdur — submit etsen hele hec yere yazilmir

---

## 4. XEBERLER

### Xeberler 3 qatli arxitekturadadir:

**A. Melumat menbeyeri:**
1. **RSS Feeds** (xarici) — `scripts/fetch-news.mjs` ile cekilir
   - Turizmplus.az, Turizm Media, HORECA TREND (TR), Hospitality Net (EN)
   - Tercume: DeepSeek/Gemini API
   - Saxlanir: `lib/data/pendingNews.json` (gozleme), `lib/data/curatedNews.json` (tesdiq edilmish)

2. **Mock Database** — Statik data fayllarinda
   - `lib/data/mockNewsDB.ts` — 5 meqale
   - `lib/data/newsroomFeed.ts` — 5 coxdilli meqale (az/en/ru/tr)
   - `lib/data/editorialContent.ts` — Birleshdirmish editorial

3. **Blog Articles** — `lib/data/blogArticles.ts`

**B. RSS feed URL-leri:**
- Turizmplus.az, Turizm Media, HORECA TREND, Hospitality Net (Global/MEA/Europe)

**C. Cixish RSS-leri:**
- `GET /api/rss/haberler` — Blog meqaleleri
- `GET /api/rss/xeberler?locale=az|en|ru|tr` — Coxdilli xeberler

**D. Xeber detay sehifesi:**
- `/haberler/[slug]` — ISHLIYIR (3 sutun premium layout, Markdown render)
- `/news/[slug]` — Route var ama **detay sehife fayili YOXDUR**

**E. Admin pipeline:**
```
RSS Fetch -> pendingNews.json -> Admin tesdiq -> curatedNews.json -> Sehifelere gosterilir
```

---

## 5. ROUTE STRUKTURU

```
app/
  page.tsx                          ISHLIYIR (ana sehife, 10 section)
  layout.tsx                        ISHLIYIR (Header + Footer + KazanAIBot)

  az/page.tsx                       ISHLIYIR (lokalize)
  en/page.tsx                       ISHLIYIR (lokalize)
  tr/page.tsx                       ISHLIYIR (lokalize)

  blog/page.tsx                     ISHLIYIR (blog grid)
  blog/[slug]/page.tsx              ISHLIYIR (blog detay)
  haberler/page.tsx                 ISHLIYIR (editorial hub)
  haberler/[slug]/page.tsx          ISHLIYIR (SSG, 10 meqale)
  news/page.tsx                     ISHLIYIR (EN xeberler)
  xeberler/page.tsx                 ISHLIYIR (coxdilli newsroom)

  kazan-ai/page.tsx                 ISHLIYIR (P&L estimation tool)
  randevu/page.tsx                  PLACEHOLDER

  auth/login/page.tsx               ISHLIYIR (localStorage, TEST_USERS hardcoded)
  auth/register/page.tsx            ISHLIYIR (form)
  auth/forgot-password/page.tsx     PLACEHOLDER

  about/page.tsx                    REDIRECT -> /haqqimizda
  contact/page.tsx                  REDIRECT -> /elaqe
  haqqimizda/page.tsx               COMING SOON
  terefdashlar/page.tsx             COMING SOON
  elaqe/page.tsx                    COMING SOON

  cookies/page.tsx                  ISHLIYIR (huquqi metn)
  privacy/page.tsx                  ISHLIYIR (huquqi metn)
  terms/page.tsx                    ISHLIYIR (huquqi metn)

  dashboard/page.tsx                ISHLIYIR (God Mode admin panel)
  dashboard/ayarlar/                ISHLIYIR (5 tab)
  dashboard/b2b-yonetimi/           ISHLIYIR
  dashboard/deal-flow/              ISHLIYIR
  dashboard/duyurular/              ISHLIYIR
  dashboard/etkinlikler/            ISHLIYIR
  dashboard/haberler/               ISHLIYIR
  dashboard/ilan-onaylari/          ISHLIYIR
  dashboard/kullanicilar/           ISHLIYIR
  dashboard/loglar/                 ISHLIYIR
  dashboard/mesajlar/               ISHLIYIR
  dashboard/pipeline/               ISHLIYIR
  dashboard/raporlar/               ISHLIYIR
  dashboard/roller/                 ISHLIYIR
  dashboard/trends/                 ISHLIYIR

  b2b-panel/page.tsx                ISHLIYIR (dashboard)
  b2b-panel/ilanlarim/              ISHLIYIR
  b2b-panel/mesajlar/               ISHLIYIR
  b2b-panel/yeni-ilan/              ISHLIYIR
  b2b-panel/toolkit/                ISHLIYIR (8 modul listesi)
  b2b-panel/toolkit/roi-calculator/ ISHLIYIR (tek ishleyen toolkit)
  b2b-panel/toolkit/pnl-simulator/  COMING SOON
  b2b-panel/toolkit/financial-health/ COMING SOON
  b2b-panel/toolkit/franchise-readiness/ COMING SOON
  b2b-panel/toolkit/inventory/      COMING SOON
  b2b-panel/toolkit/lsm-planner/    COMING SOON
  b2b-panel/toolkit/operational-audit/ COMING SOON
  b2b-panel/toolkit/talent-up/      COMING SOON
  b2b-panel/toolkit/workforce/      COMING SOON

  API Routes:
  api/auth/                         ISHLIYIR
  api/health/                       ISHLIYIR
  api/news/                         ISHLIYIR (CORS, pagination, premium)
  api/news/[slug]/                  ISHLIYIR
  api/newsletter/digest/            ISHLIYIR
  api/orchestrator/                 ISHLIYIR
  api/rss/haberler/                 ISHLIYIR
  api/rss/xeberler/                 ISHLIYIR
  api/rss/xeberler/[locale]/        ISHLIYIR
  api/telegram/post/                ISHLIYIR
  api/admin/news/pending/           ISHLIYIR
  api/admin/news/approve/           ISHLIYIR
  api/admin/news/reject/            ISHLIYIR
```

### Ozet:
| Kateqoriya | Say |
|------------|-----|
| Ishliyir (gercek icerik) | 37 |
| Coming Soon / Placeholder | 11 |
| Redirect | 2 |
| API Routes | 13 |
| **TOPLAM** | **63** |

---

## 6. KOMPONENTLER

### ISTIFADE EDILEN (25+):

| Komponent | Harada istifade edilir |
|-----------|----------------------|
| Header.tsx (layout) | Butun sehifeler |
| Footer.tsx (layout) | Butun sehifeler |
| KazanAIBot (Footer-den export) | Butun sehifeler (floating chat) |
| MobileBottomNav.tsx | Mobil goruntu |
| Hero.tsx (home) | Ana sehife (dark variant) |
| PartnersCarousel.tsx | Ana sehife |
| StageSelector.tsx | Ana sehife |
| ToolkitShowcase.tsx | Ana sehife |
| NewsPreview.tsx | Ana sehife |
| AdsPreview.tsx | Ana sehife |
| CTASections.tsx (DoganNote + JoinCTA) | Ana sehife |
| HaberlerPageClient.tsx | /haberler |
| LocalizedHomeContent.tsx | /az, /en, /tr |
| B2BSidebar.tsx | B2B panel layout |
| DashboardSidebar.tsx | Admin dashboard |
| ListingForm.tsx | /b2b-panel/yeni-ilan |
| MarkdownRenderer.tsx | Blog detay sehifeleri |
| DoganNote.tsx (blog) | Blog sidebar |
| MikroCTA.tsx | Blog CTA |
| BlogContentWrapper.tsx | Blog content |
| BlogElements.tsx | Blog metadata |
| ComingSoon.tsx | Placeholder sehifeler |
| WhatsAppButton.tsx | Butun sehifeler |
| NewsGrid.tsx, NewsHero.tsx, NewsCard.tsx | Xeber sehifeleri |
| PaywallOverlay.tsx | Premium meqaleler |
| AttributionCapture.tsx | Marketing |

### ISTIFADE EDILMEYEN / SHUBHELI:

| Komponent | Qeyd |
|-----------|------|
| Hero.tsx (root — light variant) | Ana sehifede dark variant istifade olunur |
| components/home/ (56 fayl) | Boyuk hisse alternativ/dublikat |
| DoctorCard.tsx | Hec bir route-da istifade olunmur |
| PackageCard.tsx | Hec bir route-da istifade olunmur |
| ServiceCard.tsx | Hec bir route-da istifade olunmur |
| SektorNabziTabs.tsx (29KB) | Istifade belirsiz |
| ReadingProgress.tsx | Hec bir yerde import olunmur |
| PromoCard.tsx | Istifade belirsiz |
| GuruQuoteBox.tsx | Istifade belirsiz |
| GuruBox.tsx (ui) | Istifade belirsiz |

---

## 7. DATABASE

### Drizzle / ORM: **YOXDUR**
- Hec bir schema.ts, drizzle.config.ts, prisma.schema movcud deyil
- Hec bir migration fayili yoxdur

### Database baglantisi: **YOXDUR**
- `.env.local` icerisinde yalniz: `DEEPSEEK_API_KEY` ve `NODE_OPTIONS`
- `DATABASE_URL` yoxdur
- Supabase, PostgreSQL, MySQL — hec biri konfiqurasiya olunmayib

### Data saxlama: TAMAMEN STATIK
| Data tipi | Fayl | Format |
|-----------|------|--------|
| Blog meqaleleri | lib/data/blogArticles.ts | TypeScript array |
| Editorial blog | lib/data/editorialBlogArticles.ts | TypeScript array |
| Xeberler (mock) | lib/data/mockNewsDB.ts | TypeScript array |
| Newsroom feed | lib/data/newsroomFeed.ts | TypeScript array |
| Gozleyen xeberler | lib/data/pendingNews.json | JSON |
| Tesdiq olunmush | lib/data/curatedNews.json | JSON |
| Ilan kateqoriyalari | lib/data/listingCategories.ts | TypeScript array |
| Numune ilanlar | components/constants.ts | TypeScript array |
| Partner listesi | components/constants.ts | TypeScript array |

### Seed data: Mock data ozudur seed data

---

## 8. GIT TARIXCESI

```
ad12c85 feat: stabilize local start, wp5.1 consent cookies, wp6 growth hooks, and home design patch
38d2d24 feat: add whatsapp global CTA and route-safe link targets
6c2c6d2 Initial commit from Create Next App
```

- **Toplam: 3 commit**
- Butun kod tek initial commit ile push edilib, sonra 2 patch geldi
- Sayt hec vaxt pozulmayib — butun icerik hemin 3 commit ile geldiyinden "evvel ishliyirdi, indi pozuldu" senariosu yoxdur

---

## 9. EVVEL ISHLIYEN, INDI POZULAN

| Sehife | Durum | Qeyd |
|--------|-------|------|
| Blog sehifesi (/blog) | ISHLIYIR | Grid gosterir |
| Blog yazi detay (/blog/[slug]) | ISHLIYIR | Markdown render |
| Xeberler sehifesi (/haberler) | ISHLIYIR | Editorial hub |
| Xeber detay (/haberler/[slug]) | ISHLIYIR | SSG, 10 meqale |
| Toolkit sehifesi | ISHLIYIR | 8 modul listesi |
| P&L kalkulyator | MOVCUD DEYIL | Route yoxdur, komponent yoxdur |
| Bashabash hesablayici | MOVCUD DEYIL | Route yoxdur |
| Ilanlar sehifesi | QISMEN | Mock data, real CRUD yoxdur |
| Ilan detay | MOVCUD DEYIL | Ayrica detay sehifesi yoxdur |
| Admin panel | ISHLIYIR | 14 sehife, mock data |
| Dashboard | ISHLIYIR | God Mode panel |

**Netice:** Hech ne "pozulmayib" — eksik olan sheyler HEVAXT MOVCUD OLMAYIB.

---

## 10. npm run build

```
BUILD UGHURLU
```

- 0 xeta, 0 xeberdarliq
- 52 route uğurla render edildi
- SSG: /haberler/[slug] (10 meqale statik generate)
- Dynamic: 13 API route
- Static: 39 sehife

---

## UMUMI QIYMETLENDIRME

### Guclu terefler:
- 52 route, 37-si gercek icerikle dolu
- 14 sehifelik admin panel (God Mode)
- 9 keyfiyyetli blog meqalesi (tam icerik)
- RSS pipeline (fetch -> translate -> approve -> publish)
- Multi-lang desteki (az/en/ru/tr)
- Build xetasiz kecir

### Zeyif terefler:
- **Database YOXDUR** — butun data statik fayillarda
- **Auth localStorage-dadir** — real auth sistemi yoxdur
- **Toolkitlerden yalniz 1-i ishliyir** (ROI Calculator)
- **Dublikat komponentler** — eyni shey 2-3 yerde var
- **Cift header** problemi (ana sehifede)
- **Dark tema** — komut paketi LIGHT tema telebi edir
- **Font** — Inter/Playfair var, hedef DM Sans

### Kritik eksikler (komut paketine gore):
1. MegaMenu — MOVCUD DEYIL
2. OCAQ Panel mockup — MOVCUD DEYIL
3. Dogan Notu (Ahilik versiya) — FARKLI (hazirda dark, "riyaziyyat" sitati)
4. Food Cost kalkulyator — MOVCUD DEYIL
5. Bashabash analizi — MOVCUD DEYIL
6. Menyu Matrisi — MOVCUD DEYIL
7. Shedd Rozeti konsepti — MOVCUD DEYIL
8. Utility bar — MOVCUD DEYIL
