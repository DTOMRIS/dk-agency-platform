# DK Agency — Sistem xəritəsi (avtomatik)

> `node scripts/generate-system-map.mjs` · 2026-10-10 · feat/TASK-0523-marketinq-fixes · fe76324
> **Qayda (Doğan 10.10.2026):** səhifəyə toxunmazdan əvvəl bu faylı oxu. Eyni işi görən başqa səhifə / komponent varsa, düzəlişi ORADA və ya ortaq komponentdə et — yeni yamaq yazma. İş bitəndə xəritəni yenidən yarat.

## Xülasə
- Ünvan: **137** (həqiqi səhifə 129, yönləndirmə 6, güzgü 2) · page faylı 252
- Dizayn (həqiqi səhifələr): v2 **24** · köhnə **57** · qarışıq **19** · işarəsiz 29
- Geri düyməsi yoxdur: **58** səhifə
- API: **112** route · qoruma işarəsi yoxdur: **36** (siyahı aşağıda — ictimai olanlar normaldır, qalanı yoxlanmalıdır)
- Sənəd: 59 (+ 362 tapşırıq kartı)

## Eyni işi görən yerlər (dublikat riski)
| İş | Səhifələr | Komponentlər | API |
|---|---|---|---|
| P&L / gəlir-xərc | /marketinq/pl-simulyatoru, /toolkit/pnl-simulator, /toolkit/pnl, /b2b-panel/toolkit/pnl-simulator | 3: marketinq-ocagi/pnl-simulator/PnlForm.tsx, marketinq-ocagi/pnl-simulator/PnlResult.tsx, toolkit/pnl/PnlScenarioPanel.tsx | /api/marketing-tools/pnl-simulator |
| ROI / reklam gəliri | /franchise/roi-kalkulyatoru, /marketinq/reklam-roi, /marketinq/roi-kalkulator, /toolkit/qonaq-evi-roi-kalkulyatoru, /b2b-panel/toolkit/roi-calculator | 7: franchise/RoiCalculator.tsx, marketinq-ocagi/hubs/RoiHub.tsx, marketinq-ocagi/promosyon-roi/PromoROIForm.tsx, marketinq-ocagi/promosyon-roi/PromoROIResult.tsx, marketinq-ocagi/reklam-roi/ReklamRoiPage.tsx, marketinq/ROICalculatorV2.tsx, toolkit/GuesthouseRoiCalculator.tsx | /api/marketing-tools/promosyon-roi |
| Food cost / yemək xərci | /dashboard/food-cost, /toolkit/food-cost | 0:  | /api/food-cost |
| Şikayət | /marketinq/sikayat-analizi | 8: marketinq-ocagi/hubs/SikayetHub.tsx, marketinq-ocagi/sikayet-analitigi/SikayetAnalitiyiPage.tsx, marketinq-ocagi/sikayet-analitigi/SikayetForm.tsx, marketinq-ocagi/sikayet-analitigi/SikayetResult.tsx, marketinq-ocagi/sikayet-cavablandirici/ComplaintReplyPage.tsx, marketinq-ocagi/sikayet-cavablandirici/ComplaintReplyResults.tsx, marketinq-ocagi/sikayet-cavablandirici/SikayetForm.tsx, marketinq/ComplaintAnalysis.tsx | /api/ai/complaint-response, /api/marketing-tools/sikayet-analitigi |
| Menyu analitikası | /marketinq/menyu-analitik, /toolkit/menu-matrix | 4: marketinq-ocagi/menyu-analitigi/MenyuAnalitiyiForm.tsx, marketinq-ocagi/menyu-analitigi/MenyuAnalitiyiPage.tsx, marketinq-ocagi/menyu-analitigi/MenyuResultPanel.tsx, marketinq/MenuAnalytics.tsx | /api/marketing-tools/menyu-analitigi |
| Sezon | /marketinq/sezon-analitikasi | 5: marketinq-ocagi/hubs/SezonHub.tsx, marketinq-ocagi/sezon-analitikasi/SezonAnalitikasiPage.tsx, marketinq-ocagi/sezon-planlama/SezonForm.tsx, marketinq-ocagi/sezon-planlama/SezonPlanlamaPage.tsx, marketinq-ocagi/sezon-planlama/SezonResult.tsx | /api/marketing-tools/sezon-planlama |
| Lokasiya | /marketinq/lokasyon-analiz | 1: marketinq-ocagi/lokasyon-analiz/LokasyonAnalizPage.tsx | — |
| Audit / KST / yoxlama | /dashboard/aqta-checklist, /dashboard/auditor, /marketinq/restoran-audit, /toolkit/aqta-checklist | 4: marketinq-ocagi/kst-yoxlayici/KSTQuestionnaireForm.tsx, marketinq-ocagi/kst-yoxlayici/KSTResultCard.tsx, marketinq-ocagi/kst-yoxlayici/KSTYoxlayiciPage.tsx, marketinq-ocagi/restoran-audit/RestoranAuditPage.tsx | /api/marketing-tools/kst-yoxlayici |
| Elan / listing | /b2b-panel/ilanlarim/[id]/edit, /b2b-panel/ilanlarim/[id], /b2b-panel/ilanlarim, /b2b-panel/yeni-ilan, /dashboard/ilanlar/[id], /dashboard/ilanlar, /dashboard/ilanlar/whatsapp, /ilan-ver, /ilanlar/[slug], /ilanlar, /is-elanlari, /listings, /dashboard/ilanlar/yarat | 10: home/ListingsPreview.tsx, home/ListingsPreviewSection.tsx, listings/CreateListingForm.tsx, listings/LeadForm.tsx, listings/ListingCard.tsx, listings/ListingDetailClient.tsx, listings/ListingForm.tsx, listings/ListingModal.tsx … | /api/listings/[id]/leads, /api/listings/[id]/reviews, /api/listings/[id], /api/listings/[id]/status, /api/listings/admin/whatsapp-import, /api/listings/batch-status, /api/listings |
| Faktura / qaimə | /b2b-panel/faturalar, /dashboard/fatura-kateqoriyalar, /dashboard/faturalar/[id], /dashboard/faturalar | 0:  | /api/invoice-categories, /api/invoice-ocr, /api/invoice-pdf, /api/invoices |
| Giriş / qeydiyyat | /auth/forgot-password, /auth/login, /auth/register, /forgot-password, /reset-password, /verify-email | 4: auth/AuthShell.tsx, auth/ForgotPasswordPageClient.tsx, auth/ResetPasswordPageClient.tsx, auth/VerifyEmailPageClient.tsx | /api/admin/members/[id]/reset-password, /api/auth/change-password, /api/auth/confirm, /api/auth/forgot-password, /api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/register, /api/auth/reset-password, /api/auth/verify-email |
| Başabaş | /toolkit/basabas | 0:  | — |
| Persona | /marketinq/musteri-persona | 4: marketinq-ocagi/musteri-persona/MusteriPersonaPage.tsx, marketinq-ocagi/musteri-persona/PersonaForm.tsx, marketinq-ocagi/musteri-persona/PersonaResult.tsx, marketinq/CustomerPersona.tsx | /api/marketing-tools/musteri-persona |

## Ortaq UI variantları (bir olmalıdır)
- **Logo (DK işarəsi)** (8): `components/auth/AuthShell.tsx`, `components/b2b-panel/B2BSidebar.tsx`, `components/brand/DkMark.tsx`, `components/dashboard/DashboardSidebar.tsx`, `components/layout/Footer.tsx`, `components/layout/Header.tsx`, `app/api/news/card/[id]/route.tsx`, `app/haberler/[slug]/page.tsx`
- **Üst bar / header** (7): `components/HospitalityHeader.tsx`, `components/dashboard/supply/SuppliersTab.tsx`, `components/dashboard/ui/Charts.tsx`, `components/editorial/HospitalityHeader.tsx`, `components/home/HospitalityHeader.tsx`, `components/layout/Header.tsx`, `components/shared/HospitalityHeader.tsx`
- **Geri düyməsi komponenti** (1): `components/inner/InnerParts.tsx`
- **Yan menyu (sidebar)** (2): `components/b2b-panel/B2BSidebar.tsx`, `components/dashboard/DashboardSidebar.tsx`

## Səhifələr — bölmə üzrə
Sütunlar: **Növ** (səhifə / → yönləndirmə / güzgü) · **Dizayn** (v2 = krem + Inter + inner/v2 tokenləri; köhnə = navy/gold/serif/boz fon) · **Giriş** · **Geri** · **AZ** = faylda sabit Azərbaycan mətni (i18n olmalıdır).

### İctimai səhifələr — 27 ünvan (v2 5 · köhnə 7 · qarışıq 1)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/` | səhifə | v2 | — | ✓ |  | ads/AdSlot.tsx, home/v2/HomeV2.tsx, home/v2/homeV2.module.css |
| `/about` | səhifə | — | — | ✗ |  |  |
| `/admin/leads` (yalnız /az-ru…) | güzgü | köhnə | — | ✗ |  |  |
| `/contact` | səhifə | — | — | ✗ |  |  |
| `/cookies` | səhifə | — | — | ✗ |  |  |
| `/elaqe` | səhifə | v2 | — | ✓ |  | contact/ContactFunnel.tsx, home/v2/font.ts |
| `/email-preferences` | səhifə | köhnə | — | ✗ |  |  |
| `/forgot-password` | səhifə | v2 | — | ✓ |  | auth/ForgotPasswordPageClient.tsx |
| `/haqqimizda` | səhifə | qarışıq | — | ✓ | 36 | home/DoganNote.tsx, home/AhilikValues.tsx |
| `/heromotif` (yalnız kök) | səhifə | — | — | ✗ | 2 | HeroMotif/index.ts |
| `/is-elanlari` | səhifə | köhnə | — | ✗ |  |  |
| `/kazan-ai` | səhifə | köhnə | — | ✗ |  | kazan-ai/KazanAiChatClient.tsx |
| `/listings` | səhifə | — | — | ✗ |  |  |
| `/news` | səhifə | — | — | ✗ |  |  |
| `/pricing` | səhifə | köhnə | — | ✗ |  |  |
| `/privacy` | səhifə | — | — | ✗ |  |  |
| `/qiymet` | səhifə | köhnə | — | ✗ | 3 |  |
| `/randevu` | səhifə | — | — | ✗ | 2 |  |
| `/reset-password` | səhifə | v2 | — | ✓ |  | auth/ResetPasswordPageClient.tsx |
| `/sedd-rozeti` | səhifə | köhnə | — | ✗ |  |  |
| `/sektor` | səhifə | — | — | ✗ |  |  |
| `/sektor/[slug]` | səhifə | — | — | ✗ |  |  |
| `/settings` | → /auth/login?next=/settings | köhnə | səhifədə | ✗ |  | settings/SettingsPageClient.tsx |
| `/terefdashlar` | səhifə | köhnə | — | ✓ | 3 | shared/ComingSoon.tsx |
| `/terms` | səhifə | — | — | ✗ |  |  |
| `/uzvluk` | səhifə | — | — | ✗ |  |  |
| `/verify-email` | səhifə | v2 | — | ✓ |  | auth/VerifyEmailPageClient.tsx |

### Giriş / qeydiyyat — 3 ünvan (v2 2 · köhnə 0 · qarışıq 0)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/auth/forgot-password` | səhifə | — | — | ✗ |  |  |
| `/auth/login` | səhifə | v2 | — | ✓ | 25 | auth/AuthShell.tsx |
| `/auth/register` | səhifə | v2 | — | ✓ | 54 | auth/AuthShell.tsx |

### Müştəri paneli (b2b-panel) — 27 ünvan (v2 0 · köhnə 16 · qarışıq 1)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/b2b-panel` | səhifə | — | layout (/b2b-panel) | ✗ | 1 | dashboard/RecommendationWidget.tsx, dashboard/NudgeBanner.tsx |
| `/b2b-panel/[slug]` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ |  |  |
| `/b2b-panel/analizler` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ | 5 |  |
| `/b2b-panel/ayarlar` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ | 28 |  |
| `/b2b-panel/bildirimler` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ | 2 | b2b-panel/useOwnerListings.ts |
| `/b2b-panel/destek` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✗ | 1 |  |
| `/b2b-panel/faturalar` | səhifə | — | layout (/b2b-panel) | ✓ |  | LaunchCampaignBanner.tsx |
| `/b2b-panel/favoriler` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✗ | 2 | listings/ListingCard.tsx, listings/ListingModal.tsx |
| `/b2b-panel/ilanlarim` | səhifə | köhnə | layout (/b2b-panel) | ✗ | 46 |  |
| `/b2b-panel/ilanlarim/[id]` | səhifə | köhnə | layout (/b2b-panel) | ✓ | 31 |  |
| `/b2b-panel/ilanlarim/[id]/edit` | səhifə | köhnə | layout (/b2b-panel) | ✓ | 19 | listings/ListingForm.tsx |
| `/b2b-panel/marketinq-ocagi` | səhifə | köhnə | layout (/b2b-panel) | ✗ | 100 |  |
| `/b2b-panel/marketinq-ocagi/[slug]` | səhifə | qarışıq | layout (/b2b-panel) | ✓ | 112 | marketinq-ocagi/sosial-metrik/SosialMetrikPage.tsx, marketinq-ocagi/marka-kompasi/MarkaKompasiPage.tsx, marketinq-ocagi/hubs/RoiHub.tsx |
| `/b2b-panel/mesajlar` | səhifə | köhnə | layout (/b2b-panel) | ✓ | 23 |  |
| `/b2b-panel/profil` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ | 40 |  |
| `/b2b-panel/teklifler` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✗ | 1 | b2b-panel/useOwnerListings.ts |
| `/b2b-panel/toolkit` | → /toolkit | — | layout (/b2b-panel) | ✗ |  |  |
| `/b2b-panel/toolkit/financial-health` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 3 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/franchise-readiness` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 3 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/inventory` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 3 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/lsm-planner` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 3 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/operational-audit` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 2 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/pnl-simulator` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 2 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/roi-calculator` (yalnız kök) | səhifə | — | layout (/b2b-panel) | ✓ | 15 |  |
| `/b2b-panel/toolkit/talent-up` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 2 | shared/ComingSoon.tsx |
| `/b2b-panel/toolkit/workforce` (yalnız kök) | səhifə | köhnə | layout (/b2b-panel) | ✓ | 3 | shared/ComingSoon.tsx |
| `/b2b-panel/yeni-ilan` | səhifə | köhnə | layout (/b2b-panel) | ✓ | 21 | listings/ListingForm.tsx |

### Bloq / xəbərlər — 6 ünvan (v2 4 · köhnə 0 · qarışıq 1)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/blog` | səhifə | v2 | — | ✓ |  | inner/InnerParts.tsx, blog/BlogDirectory.tsx |
| `/blog/[slug]` | səhifə | v2 | — | ✓ |  |  |
| `/haberler` | səhifə | v2 | — | ✓ | 2 | ads/AdSlot.tsx, news/MansetVitrin.tsx, home/v2/homeV2.module.css |
| `/haberler/[slug]` | səhifə | qarışıq | — | ✓ |  | news/BlogContentWrapper.tsx, ads/AdSlot.tsx, blog/index.ts |
| `/xeberler` | səhifə | — | — | ✗ |  |  |
| `/xeberler/[slug]` (yalnız kök) | səhifə | v2 | — | ✓ |  |  |

### Admin (dashboard) — 34 ünvan (v2 0 · köhnə 25 · qarışıq 0)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/dashboard` | səhifə | köhnə | səhifədə | ✗ | 51 | dashboard/ui/Charts.tsx |
| `/dashboard/aqta-checklist` | səhifə | köhnə | layout (/dashboard) | ✗ | 139 |  |
| `/dashboard/audit-logs` | səhifə | köhnə | layout (/dashboard) | ✓ |  |  |
| `/dashboard/auditor` | səhifə | köhnə | layout (/dashboard) | ✓ | 3 |  |
| `/dashboard/ayarlar` | səhifə | köhnə | layout (/dashboard) | ✗ | 5 |  |
| `/dashboard/blog` | səhifə | köhnə | layout (/dashboard) | ✗ | 11 |  |
| `/dashboard/blog/[slug]` | səhifə | köhnə | səhifədə | ✗ | 2 | dashboard/BlogEditorForm.tsx |
| `/dashboard/blog/new` | səhifə | köhnə | layout (/dashboard) | ✗ | 1 | dashboard/BlogEditorForm.tsx |
| `/dashboard/blog/translation-status` | səhifə | — | səhifədə | ✗ | 12 | dashboard/TranslateAllButton.tsx, dashboard/MigrateStructureButtons.tsx |
| `/dashboard/blog/yeni` | güzgü | — | layout (/dashboard) | ✗ |  |  |
| `/dashboard/contact-tracking` | səhifə | köhnə | səhifədə | ✗ | 8 |  |
| `/dashboard/fatura-kateqoriyalar` | səhifə | — | layout (/dashboard) | ✓ | 13 |  |
| `/dashboard/faturalar` | səhifə | — | layout (/dashboard) | ✓ | 4 |  |
| `/dashboard/faturalar/[id]` | səhifə | — | layout (/dashboard) | ✓ | 16 |  |
| `/dashboard/food-cost` | səhifə | köhnə | layout (/dashboard) | ✓ |  |  |
| `/dashboard/franchise-leads` | səhifə | köhnə | səhifədə | ✗ | 7 |  |
| `/dashboard/funnel` | → /auth/login | köhnə | səhifədə | ✗ |  | dashboard/ActivationFunnelWidget.tsx |
| `/dashboard/ilanlar` | səhifə | köhnə | layout (/dashboard) | ✓ | 49 |  |
| `/dashboard/ilanlar/[id]` | səhifə | köhnə | layout (/dashboard) | ✓ | 16 |  |
| `/dashboard/ilanlar/whatsapp` | səhifə | köhnə | layout (/dashboard) | ✓ | 72 |  |
| `/dashboard/ilanlar/yarat` (yalnız kök) | səhifə | köhnə | layout (/dashboard) | ✓ |  | listings/CreateListingForm.tsx |
| `/dashboard/kazan-leads` | səhifə | köhnə | səhifədə | ✗ |  | dashboard/KazanLeadStatusActions.tsx |
| `/dashboard/marketinq-ocagi` | → /b2b-panel/marketinq-ocagi | — | layout (/dashboard) | ✗ |  |  |
| `/dashboard/marketinq-ocagi/[slug]` | → /b2b-panel/marketinq-ocagi/${encodeURIComponent(slug)} | — | layout (/dashboard) | ✗ |  |  |
| `/dashboard/muracietler` | səhifə | köhnə | səhifədə | ✗ |  |  |
| `/dashboard/profil-onay` (yalnız kök) | səhifə | köhnə | layout (/dashboard) | ✗ | 20 |  |
| `/dashboard/reklamlar` | səhifə | — | layout (/dashboard) | ✗ | 12 |  |
| `/dashboard/techizatcilar` | səhifə | köhnə | səhifədə | ✗ |  | dashboard/supply/SupplyBoard.tsx |
| `/dashboard/users` | səhifə | köhnə | layout (/dashboard) | ✓ |  | dashboard/MembersTable.tsx, dashboard/AddMemberModal.tsx |
| `/dashboard/users/[id]` | səhifə | köhnə | layout (/dashboard) | ✓ | 2 |  |
| `/dashboard/xeberler` | səhifə | köhnə | layout (/dashboard) | ✗ | 105 |  |
| `/dashboard/xeberler/[id]` | səhifə | köhnə | səhifədə | ✗ | 1 | dashboard/NewsEditorForm.tsx |
| `/dashboard/xeberler/rss` | səhifə | köhnə | layout (/dashboard) | ✗ |  |  |
| `/dashboard/xeberler/yeni` | səhifə | köhnə | layout (/dashboard) | ✗ | 1 | dashboard/NewsEditorForm.tsx |

### Franchise — 6 ünvan (v2 0 · köhnə 6 · qarışıq 0)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/franchise` | səhifə | köhnə | — | ✗ |  |  |
| `/franchise/alici-cheklisti` | səhifə | köhnə | — | ✗ |  | franchise/BuyerChecklist.tsx |
| `/franchise/francbuk-generatoru` | səhifə | köhnə | — | ✗ |  | franchise/FranchbookGenerator.tsx |
| `/franchise/hazirliq-testi` | səhifə | köhnə | — | ✗ |  | franchise/ReadinessQuiz.tsx |
| `/franchise/radar` | səhifə | köhnə | — | ✗ |  |  |
| `/franchise/roi-kalkulyatoru` | səhifə | köhnə | — | ✗ |  | franchise/RoiCalculator.tsx, franchise/LeadForm.tsx |

### Elanlar — 3 ünvan (v2 0 · köhnə 3 · qarışıq 0)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/ilan-ver` | səhifə | köhnə | səhifədə | ✗ | 1 | listings/CreateListingForm.tsx |
| `/ilanlar` | səhifə | köhnə | — | ✗ | 2 | listings/ListingsShowcasePage.tsx |
| `/ilanlar/[slug]` | səhifə | köhnə | — | ✓ |  |  |

### Marketinq (ictimai) — 12 ünvan (v2 0 · köhnə 0 · qarışıq 10)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/marketinq` | səhifə | — | — | ✗ | 14 |  |
| `/marketinq/lokasyon-analiz` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/lokasyon-analiz/LokasyonAnalizPage.tsx |
| `/marketinq/menyu-analitik` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq/MenuAnalytics.tsx |
| `/marketinq/musteri-persona` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq/CustomerPersona.tsx |
| `/marketinq/pl-simulyatoru` | → /toolkit/pnl | — | — | ✗ |  |  |
| `/marketinq/reklam-roi` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/hubs/RoiHub.tsx |
| `/marketinq/restoran-audit` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/hubs/AuditHub.tsx |
| `/marketinq/roi-kalkulator` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/hubs/RoiHub.tsx |
| `/marketinq/sezon-analitikasi` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/hubs/SezonHub.tsx |
| `/marketinq/sikayat-analizi` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/hubs/SikayetHub.tsx, marketinq-ocagi/sikayet-cavablandirici/ComplaintReplyPage.tsx |
| `/marketinq/sosial-metrik` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/sosial-metrik/SosialMetrikPage.tsx |
| `/marketinq/trend-analiz` | səhifə | qarışıq | səhifədə | ✓ |  | marketinq-ocagi/trend-analiz/TrendAnalizPage.tsx |

### Toolkit — 19 ünvan (v2 13 · köhnə 0 · qarışıq 6)
| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |
|---|---|---|---|---|---|---|
| `/toolkit` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitDirectory.tsx |
| `/toolkit/addim-xerci` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/DecimalInput.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/aqta-checklist` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/basabas` | səhifə | qarışıq | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/DecimalInput.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/branding-guide` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/checklist` | səhifə | v2 | — | ✓ | 2 |  |
| `/toolkit/delivery-calc` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/DecimalInput.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/food-cost` | səhifə | v2 | — | ✓ | 2 |  |
| `/toolkit/insaat-checklist` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/ToolResetControls.tsx, toolkit/AssumptionsPanel.tsx |
| `/toolkit/menu-matrix` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/ToolResetControls.tsx, toolkit/DecimalInput.tsx |
| `/toolkit/metbex-istasyon` | səhifə | v2 | — | ✓ | 2 | marketinq-ocagi/metbex-istasyon/MetbexIstasyonPage.tsx |
| `/toolkit/ota-hazirlig-testi` | səhifə | qarışıq | — | ✓ |  | toolkit/OtaReadinessQuiz.tsx, toolkit/ToolPageShell.tsx |
| `/toolkit/otel-hazirlig-testi` | səhifə | qarışıq | — | ✓ |  | toolkit/HotelReadinessQuiz.tsx, toolkit/ToolPageShell.tsx |
| `/toolkit/personel-planlayici` | səhifə | v2 | — | ✓ | 2 | marketinq-ocagi/personel-planlayici/PersonelPlanlayiciPage.tsx |
| `/toolkit/pnl` | səhifə | qarışıq | — | ✓ | 2 |  |
| `/toolkit/pnl-simulator` | səhifə | qarışıq | — | ✓ | 2 |  |
| `/toolkit/qonaq-evi-roi-kalkulyatoru` | səhifə | v2 | — | ✓ |  | toolkit/GuesthouseRoiCalculator.tsx, toolkit/ToolPageShell.tsx |
| `/toolkit/staff-retention` | səhifə | v2 | — | ✓ |  | toolkit/ToolkitStudioLayout.tsx, toolkit/DecimalInput.tsx, toolkit/ToolResetControls.tsx |
| `/toolkit/whatsapp-template-paketi` | səhifə | qarışıq | — | ✓ |  | toolkit/WhatsappTemplatesPanel.tsx, toolkit/ToolPageShell.tsx |

## API — qoruma işarəsi olmayan route-lar
İctimai (lead forması, ictimai elan siyahısı, tracking, cron-un özü və s.) normaldır. Admin/üzv datası qaytaran varsa — dərhal düzəlt.
| Route | Metod | Fayl |
|---|---|---|
| `/api/ads/[id]/click` | GET | app/api/ads/[id]/click/route.ts |
| `/api/ads/[id]/impression` | POST | app/api/ads/[id]/impression/route.ts |
| `/api/analytics/track` | POST | app/api/analytics/track/route.ts |
| `/api/auth/confirm` | GET | app/api/auth/confirm/route.ts |
| `/api/auth/forgot-password` | POST | app/api/auth/forgot-password/route.ts |
| `/api/auth/login` | POST | app/api/auth/login/route.ts |
| `/api/auth/logout` | POST | app/api/auth/logout/route.ts |
| `/api/auth/me` | GET | app/api/auth/me/route.ts |
| `/api/auth/register` | POST | app/api/auth/register/route.ts |
| `/api/auth/reset-password` | POST | app/api/auth/reset-password/route.ts |
| `/api/auth` | POST, GET | app/api/auth/route.ts |
| `/api/auth/verify-email` | POST | app/api/auth/verify-email/route.ts |
| `/api/email/preferences` | GET, POST | app/api/email/preferences/route.ts |
| `/api/email/unsubscribe` | GET, POST | app/api/email/unsubscribe/route.ts |
| `/api/franchise/readiness-report` | POST | app/api/franchise/readiness-report/route.ts |
| `/api/franchise/result-card` | GET | app/api/franchise/result-card/route.tsx |
| `/api/health` | GET | app/api/health/route.ts |
| `/api/kazan-ai` | POST | app/api/kazan-ai/route.ts |
| `/api/lead/franchise-radar` | POST | app/api/lead/franchise-radar/route.ts |
| `/api/lead/ota-guide` | POST | app/api/lead/ota-guide/route.ts |
| `/api/leads/track` | POST | app/api/leads/track/route.ts |
| `/api/leads/whatsapp` | GET | app/api/leads/whatsapp/route.ts |
| `/api/member/auth` | POST | app/api/member/auth/route.ts |
| `/api/member/checkout` | POST | app/api/member/checkout/route.ts |
| `/api/member/lead` | POST | app/api/member/lead/route.ts |
| `/api/member/webhook` | POST | app/api/member/webhook/route.ts |
| `/api/news/[slug]` | GET | app/api/news/[slug]/route.ts |
| `/api/news/card/[id]` | GET | app/api/news/card/[id]/route.tsx |
| `/api/news/fetch` | POST | app/api/news/fetch/route.ts |
| `/api/news` | GET | app/api/news/route.ts |
| `/api/news/translate` | POST | app/api/news/translate/route.ts |
| `/api/newsletter/digest` | GET | app/api/newsletter/digest/route.ts |
| `/api/newsletter/subscribe` | POST | app/api/newsletter/subscribe/route.ts |
| `/api/rss/haberler` | GET | app/api/rss/haberler/route.ts |
| `/api/rss/xeberler/[locale]` | GET | app/api/rss/xeberler/[locale]/route.ts |
| `/api/rss/xeberler` | GET | app/api/rss/xeberler/route.ts |

## Sənədlər, araşdırmalar, qərarlar — işə başlamazdan əvvəl oxu
| Fayl | Başlıq | Son dəyişiklik | Sətir |
|---|---|---|---|
| `docs/ADR/0001-nextjs-app-router.md` | ADR-001: Next.js + App Router | 2026-05-27 | 29 |
| `docs/ADR/0002-custom-auth.md` | ADR-0002: Custom JWT Auth Instead of NextAuth | 2026-05-27 | 27 |
| `docs/ADR/0003-drizzle-orm.md` | ADR-0003: Drizzle ORM Over Prisma | 2026-05-27 | 27 |
| `docs/ADR/0004-neon-postgresql.md` | ADR-0004: Neon Serverless PostgreSQL | 2026-05-27 | 27 |
| `docs/ADR/0005-hostinger-deploy.md` | ADR-0005: Hostinger Over Vercel for Deployment | 2026-05-27 | 26 |
| `docs/ADR/0006-four-languages.md` | ADR-0006: Four-Locale i18n Strategy | 2026-05-27 | 28 |
| `docs/ADR/0007-ahilik-tier.md` | ADR-0007: Ahilik Guild Naming for Membership Tiers | 2026-05-27 | 27 |
| `docs/ADR/0008-i18n-pattern-a.md` | ADR-0008: i18n Pattern Hierarchy | 2026-05-27 | 28 |
| `docs/ADR/0009-deepseek-primary.md` | ADR-0009: DeepSeek as Primary AI Model with Claude Fallback | 2026-05-27 | 28 |
| `docs/ADR/0010-yandex-metrica-kvkk.md` | ADR-0010: Yandex Metrica with KVKK Consent Gating | 2026-05-27 | 28 |
| `docs/ADR/0011-kazan-context-injection.md` | ADR-0011: URL Query Param Context Injection for KAZAN AI | 2026-05-27 | 29 |
| `docs/ADR/0012-metro-3-block.md` | ADR-0012: Metro 3-Block Tool Description Format | 2026-05-27 | 29 |
| `docs/ADR/0013-dk-validator.md` | ADR-0013: DK Validator Agent as Pre-Merge Quality Gate | 2026-05-27 | 32 |
| `docs/ADR/0014-task-card-system.md` | ADR-0014: Task Card System for Work Tracking | 2026-05-27 | 29 |
| `docs/ADR/0015-auto-approve-mode.md` | ADR-0015: Claude Code Auto-Approve Mode | 2026-05-27 | 28 |
| `docs/ADR/0016-dashboard-route-pruning.md` | ADR-0016: Dashboard route təmizliyi — saxta səhifələr silinir, real olanlar menyuya, sideb | 2026-09-13 | 39 |
| `docs/ADR/0017-landing-v2-identity-and-channels.md` | ADR-0017: Landing v2 — HoReCa food-cost kimliyi, Kutlerri/R365 dizayn dili, sahib kanallar | 2026-10-09 | 37 |
| `docs/ADR/README.md` | Architecture Decision Records (ADR) | 2026-10-08 | 37 |
| `docs/ADR/_TEMPLATE.md` | ADR-NNNN: {Başlıq} | 2026-05-27 | 25 |
| `docs/API-MAP.md` | API Map — DK Agency Platform | 2026-05-27 | 167 |
| `docs/ARCHITECTURE/SYSTEM-MAP.md` | DK Agency — Sistem xəritəsi (avtomatik) | 2026-10-10 | 315 |
| `docs/BLOG-CITATION-AUDIT.md` | Blog Atıf (Citation) Auditi — Tiered | 2026-06-06 | 73 |
| `docs/BRAND-GUIDE.md` | DK Agency -- Marka Qaydalari | 2026-03-24 | 47 |
| `docs/CHANGELOG.md` | CHANGELOG | 2026-10-06 | 658 |
| `docs/CLAUDE-DESIGN.md` | CLAUDE DESIGN | 2026-06-03 | 11 |
| `docs/CODING-STANDARDS.md` | DK Agency -- Kod Yazma Qaydalari | 2026-03-24 | 35 |
| `docs/DATA-MODEL.md` | DK Agency Data Model | 2026-05-27 | 147 |
| `docs/DECISIONS.md` | DECISIONS | 2026-05-27 | 6 |
| `docs/DELIVERY-SYSTEM.md` | Delivery System (No-Regression Mode) | 2026-02-22 | 51 |
| `docs/DEPLOYMENT.md` | DK Agency Deployment Guide | 2026-09-13 | 132 |
| `docs/DEVLOG.md` | DK Agency Platform — Dev Log | 2026-09-30 | 1144 |
| `docs/ENV-SETUP.md` | Environment Setup | 2026-04-24 | 23 |
| `docs/FATURA-OCR-MASTERPLAN.md` | FATURA OCR MASTERPLAN — DK Agency | 2026-04-29 | 802 |
| `docs/HANDOFF-11-IYUN-2026.md` | HANDOFF — 11 İyun 2026 Sessiyası | 2026-06-11 | 129 |
| `docs/HANDOFF.md` | HANDOFF | 2026-10-08 | 580 |
| `docs/I18N-AUDIT.md` | i18n Component-Level Audit | 2026-05-08 | 153 |
| `docs/LESSONS.md` | DK Agency — Acı Dərslər (yeni task-dan əvvəl oxu) | 2026-10-04 | 397 |
| `docs/MARKETINQ_OCAGI_SPEC.md` | Marketinq Ocagi — Texniki Spec | 2026-05-11 | 238 |
| `docs/ONBOARDING.md` | DK Agency Onboarding — 5 Dəqiqəlik Başlangıc | 2026-05-27 | 88 |
| `docs/PLATFORM-STANDARDS.md` | Platform Standards (SEO + Security + Mobile + PWA) | 2026-02-22 | 48 |
| `docs/PROTECTED.md` | Protected Files — Toxunulmaz | 2026-05-28 | 35 |
| `docs/README.md` | DK Agency Documentation | 2026-05-27 | 55 |
| `docs/REPO-GOVERNANCE.md` | REPO GOVERNANCE | 2026-10-04 | 29 |
| `docs/RSS-SOURCES.md` | RSS Mənbələri — Xəbər Aqreqasiyası | 2026-03-26 | 40 |
| `docs/RUNBOOK.md` | RUNBOOK | 2026-09-13 | 67 |
| `docs/SESSION-JOURNAL.md` | Session Journal | 2026-06-09 | 65 |
| `docs/SKILL-MATRIX.md` | DK Agency Skill Matrix (v1) | 2026-06-07 | 80 |
| `docs/STATE.md` | STATE | 2026-10-05 | 359 |
| `docs/SYSTEM-AUDIT.md` | DK Agency — System Audit (CANLI) | 2026-10-08 | 76 |
| `docs/TASK-CARD-TEMPLATE.md` | Task Card Template | 2026-03-26 | 15 |
| `docs/TECH_DEBT.md` | Tech Debt Registry — DK Agency Platform | 2026-09-29 | 281 |
| `docs/XEBER-TERCUME-SISTEMI.md` | Xəbər Tərcümə Sistemi — Texniki Sənəd | 2026-03-26 | 142 |
| `docs/devir-satis-spec.md` | DK Agency Devir & Satis Feature Spec | 2026-03-28 | 874 |
| `docs/handoff/TASK-0157C-CONTINUATION.md` | TASK-0157C Continuation — Dashboard i18n Remaining 5 Files | 2026-05-22 | 111 |
| `docs/kazan-kb-v2.md` | KAZAN AI Knowledge Base v2 | 2026-04-27 | 61 |
| `docs/member-env-checklist.md` | Member Env Checklist | 2026-03-26 | 58 |
| `docs/n8n/SETUP.md` | n8n RSS Auto-Fetch — Setup Rehberi | 2026-04-27 | 93 |
| `docs/reports/2026-06-10-news-editor-deploy.md` | 2026-06-10 — Manuel Haber Editörü Deploy + Hotfix Raporu | 2026-06-10 | 348 |
| `docs/reports/2026-10-09-marketinq-ocagi-audit.md` | Marketinq Ocağı (24 alət) — audit + dünya araşdırması (09.10.2026) | 2026-10-09 | 36 |
