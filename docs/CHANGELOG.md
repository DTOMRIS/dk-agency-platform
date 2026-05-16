# Changelog

Butun ehemiyyetli deyisiklikler bu faylda qeyd olunur.

## [Unreleased]
### Added
- [TASK-0135] feat(admin): role assignment UI + PATCH API endpoint
  - PATCH /api/admin/members/[id] — rol dəyişdirmə (member ↔ admin)
  - Self-role protection: admin öz rolunu dəyişə bilməz (403 + UI disabled)
  - MembersTable: rol sütunu select dropdown ilə (cari admin badge-only)
  - i18n: dashboard.members.roles.* (4 dil — az/en/ru/tr)
  - E2E smoke: PATCH 401 + invalid role + invalid id tests

### Fixed
- [TASK-0134-FIX] fix(admin): resolve validator blocks — spec locale fix + i18n pageCopy
  - E2E spec: locale prefix (`/${locale}/dashboard/users`) silindi, dashboard route-ları locale-independent
  - pageCopy inline obyekti component-dən çıxarıldı, `useTranslations('dashboard.members')` ilə əvəz
  - messages/az.json, en.json, ru.json, tr.json: `dashboard.members.*` namespace (4 dil tam)
  - dk-validator L-004 (inline pageCopy) + E2E locale prefix block-ları həll edildi

### Added
- TASK-0134: Admin İstifadəçilər page → real DB (mock removed)
  - GET /api/admin/members (admin-only, JOIN profiles+subscriptions, pagination, stats)
  - MembersTable component (filter, pagination, plan badges, 4 dil)
  - 4 stat cards: total/verified/KALFA/USTA
- TASK-0131: Dashboard input/textarea/select contrast fix (globals.css systemic)
  - Root cause: body color #eaeaea (landing dark) inherited by dashboard inputs on bg-white
  - Fix: global input/textarea/select { color: var(--dk-ink) } + placeholder { color: var(--dk-ink-soft) }
  - Affects all 11 marketing tools + dashboard forms
- TASK-0130: Reklam Yazıcısı AI tool (Marketinq Ocağı, KALFA tier)
  - 3 variant: attention / informative / sales
  - Platform-specific: Instagram, Facebook, TikTok, Google Ads
  - POST /api/ai/ad-writer (DeepSeek + Claude fallback)
  - 4-language i18n, Playwright smoke tests
- TASK-0128: Şikayət Cavablandırıcı AI tool (Marketinq Ocağı, KALFA tier)
  - 3 component: SikayetCavablandiriciPage, SikayetForm, SikayetCavablari
  - POST /api/ai/complaint-response (DeepSeek primary, Claude fallback)
  - lib/ai/complaint-prompt-builder.ts (Ahilik dəyərləri, few-shot)
  - 4-language i18n (az/ru/en/tr) in messages/*.json
  - Playwright smoke tests (4 locale + API 401 check)
  - 20 responses/day rate limit per user

## [0.9.0] - 2026-05-04
### Added — i18n Phase 2: public route translations (TASK-0049 – TASK-0053)
- [TASK-0049] `app/toolkit/page.tsx`: 4-language copy (az/tr/en/ru) — hero badge, title, subtitle, 10 tool names & descriptions, section headings, CTA label; locale detected from pathname
- [TASK-0050] `components/listings/ListingsShowcasePage.tsx`: 4-language copy — hero, CTA buttons, filter labels, empty state, active count, verified badge
- [TASK-0051] `app/haberler/page.tsx`: 4-language copy — page badge, title, subtitle, category tabs, editor pick label, no-source label, empty state
- [TASK-0052] `app/[locale]/blog/page.tsx`: 4-language copy — hero badge, subtitle, error message, read CTA, reading time label; locale detected from pathname
- [TASK-0053] `app/[locale]/qiymet/page.tsx`: verified already fully translated in Phase 1 — no changes needed

## [0.8.0] - 2026-05-04
### Fixed — Auth redirect / hostname fix package (TASK-0030 – TASK-0034)
- [TASK-0030] next.config.ts: `experimental.trustHostHeader: true` — Hostinger reverse proxy hostname fix
- [TASK-0031] Auth redirects: replaced `request.nextUrl.origin` and raw env var reads with `getBaseUrl()` in confirm, register, and route handlers
- [TASK-0032] New utility: `lib/utils/get-base-url.ts` — single source of truth for public base URL
- [TASK-0033] Deleted duplicate `postcss.config.js` (CJS) — canonical config is `postcss.config.mjs`
- [TASK-0034] Pinned Node.js to >=22 (`package.json` engines + `.nvmrc`)

## [0.7.0] - 2026-04-30
### Added — Restoran Auditor (tam yeni feature)
- DB schema: `restaurant_audits` + `restaurant_audit_actions` (2 tablo, 2 enum, Neon push)
- AI engine: `lib/audit/photo-analyzer.ts` (Gemini Vision + kateqoriya fallback)
- AI engine: `lib/audit/menu-analyzer.ts` (menyu foto → qiymet/kateqoriya)
- AI engine: `lib/audit/social-scraper.ts` (Instagram/Facebook public data)
- AI engine: `lib/audit/full-audit.ts` (DeepSeek SWOT + tovsiye + WhatsApp sablon)
- Repository: `lib/repositories/auditRepository.ts` (CRUD + actions + stats)
- API: `POST/GET /api/audit` (yaratma + siyahi + bulk delete)
- API: `GET/PATCH/DELETE/POST /api/audit/[id]` (detal + status + action log)
- Dashboard: `/dashboard/auditor` — 3 view (list/new/detail), mobile-first, kanban filter
- PDF export: `lib/audit/audit-pdf.ts` (jsPDF, AZ karakter sanitize)
- WhatsApp template: AI auto-generate, clipboard copy
- Sidebar: "Auditor" linki (ClipboardCheck icon)

### Added — Toolkit Food Cost Real Data
- Product lookup API: `/api/food-cost?type=lookup&q=toyuq` (son 90 gun orta qiymet)
- Repository: `lookupProductPrices()` — avg/min/max qiymet, vahid, occurrences
- Toolkit autocomplete: `/toolkit/food-cost` mehsul adina gore fatura qiymetleri onerisi
- Auto-fill: onerini secdikde ad, vahid, qiymet avtomatik doldurulur
- "Fatura qiymetleri aktiv" badge (DB-de data varsa)

## [0.6.0] - 2026-04-30
### Added — Fatura OCR Faza 9-10 (Food Cost + KAZAN AI + Export)
- Food Cost hesablama motoru: `getFoodCostReport()`, `getMonthlyTrend()`, `getSupplierComparison()`, `getTopProducts()`
- Food Cost API: `/api/food-cost?type=report|trend|suppliers|products|all`
- Food Cost Dashboard: `/dashboard/food-cost` (4 KPI, trend chart, 3 tab, ay secici)
- KAZAN AI real data inject: `lib/kazan-ai/food-cost-context.ts` + `isFoodCostIntent()`
- KAZAN AI artiq "Bu ay en cox neye xerclemisem?" sualina real reqemlerle cavab verir
- Sidebar: "Food Cost" linki (CookingPot icon)

### Added — PDF Import (Faza 4)
- PDF parser: `lib/invoice-ocr/pdf-parser.ts` (pdf-parse v2 PDFParse + DeepSeek text parse + regex fallback)
- PDF API: `POST /api/invoice-pdf` (FormData → text extract → AI parse → structured rows)
- Import modal: PDF butonu artiq isleyir (eskiden "tezlikle" yazirdi)

### Changed — CSV/Excel Export Encoding Fix
- CSV separator: virgul (`,`) → noqteli vergul (`;`) — AZ/TR locale-da Excel duzgun acilir
- UTF-8 BOM + CRLF setir sonu
- Status/Menbe etiketleri AZ diline cevirildi
- Food Cost CSV/Excel/PDF export funksiyalari elave edildi
- Excel export: `bookSST: true` (string table optimizasiyasi)

### Dependencies
- `jspdf` (PDF export)
- `pdf-parse` (PDF import)

## [0.5.0] - 2026-04-28
### Added — Fatura OCR Faza 1-8
- DB schema: 5 tablo (invoices, invoice_items, invoice_categories, invoice_imports, invoice_category_rules), 4 enum
- Seed: 12 default kateqoriya + 64 auto-mapping rule
- OCR pipeline: Gemini 2.5 Flash Vision (primary) + DeepSeek Text (fallback)
- Client-side sekil sixilma: browser-image-compression, WebP, 70%+ azalma
- Manual giris: +1/+5/+10 toplu setir elavesi
- Excel/CSV import: SheetJS, AZ/TR/EN/RU sutun tanima
- Detail page: field-by-field inline edit
- Admin: bulk delete, filter, pagination
- Mobil UX: kart view, kamera, bottom bar
- Kateqoriya admin: `/dashboard/fatura-kateqoriyalar`
- Export: CSV (UTF-8 BOM) + Excel (.xlsx)
- Sidebar: "Faturalar" linki
- PR #65 merged to main

## [0.4.0] - 2026-03-26
### Added
- `KAZAN AI` knowledge base (`lib/kazan-ai/knowledge-base.ts`) - 10 yazidan cixarilan formula, range, checklist, praktik addim ve guru sitatlari
- `KAZAN AI` system prompt (`lib/kazan-ai/system-prompt.ts`) - AZ ton, sales layer, toolkit/blog yonlendirmesi
- `POST /api/kazan-ai` Anthropic proxy route - server-side system prompt + knowledge injection
- `/kazan-ai` real chat UI - sample questions, clickable markdown linkler, toolkit enteqrasiyasi
- `/toolkit/insaat-checklist` ve locale wrapper - temiz interactive checklist, upload util istifadəsi
- `lib/utils/image-resize.ts` - client-side image resize/validation util

### Changed
- `components/layout/Footer.tsx` - toolkit ve insaat linkleri yenilendi, encoding temizlendi
- `components/layout/MegaMenu.tsx` - insaat checklist linki elave olundu, encoding temizlendi
- `app/kazan-ai/page.tsx` teaser sehifeden real chat shell-e cevrildi

## [0.3.0] - 2026-03-24
### Added
- i18n altyapisi (next-intl v4, 3 dil: az/tr/en, 168 key)
- Database schema (Drizzle + 6 tablo: blog, ilan, partner, hero, guru, settings)
- Image optimization (sharp + Cloudinary/Unsplash config)
- Design tokens (colors, fonts, shadows, radius — typed)
- Prettier config (.prettierrc)
- /toolkit — index page (3 alet karti)
- /toolkit/food-cost — porsiya maya deyeri hesablayici (interaktiv)
- /toolkit/pnl — ayliq P&L simulyatoru (KPI + editable cedvel)
- /toolkit/checklist — 43 maddelik restoran acilis checklist (7 bolme, progress bar)
- Blog detail: MarkdownRenderer ile zengin formatlama (guru box, dogan notu, warning/tip, cedvel, code block)
- Blog detail: related articles sidebar, tag-lar, xulase paneli
- .claude/CLAUDE.md — proyekt kontekst faylI
- docs/BRAND-GUIDE.md, docs/CODING-STANDARDS.md

### Changed
- Blog list: components/constants -> lib/data/blogArticles (9 yazi duzgun gosterilir)
- Blog detail: ReactMarkdown -> MarkdownRenderer (zengin formatlama)
- Xeberler: basliq + UI AZ diline cevirildi ("En Cox Oxunan", "oxunus")
- StageSelector: /basla/checklist linki -> /toolkit/checklist (404 fix)

### Fixed
- CI: 10 ESLint error hell edildi (unescaped quotes, unused imports, Math.random in render, mojibake)
- verify-encoding.mjs: binary fayllari (PNG/JPG) skip edir, oz-ozunu skip edir
- Butun bos route qovluqlari (toolkit/food-cost, toolkit/pnl) sehifeyle dolduruldu

## [0.2.0] - 2026-03-24
### Added
- Utility bar (KAZAN AI banner)
- MegaMenu (880px, 18 item, TEZLIKLE badge)
- OCAQ Panel mockup (hero section)
- Sedd Rozeti konsepti
- Axeptio stili cookies banner (localStorage consent)
- 5 illustrasiya (hairline stil)
- CTO Durum Raporu
- Development journal sistemi
- Kod standartlari (ESLint, Prettier, design tokens)

### Changed
- Hero: dark -> light tema, "pul itirdiyin" basliq
- Nav: Toolkit/Saglamliq/Xeberler -> Ana sehife/Trendler/Blog/Ocaq
- Footer: dark -> light (#FAFAF8), 5 sutun
- DoganNote: "riyaziyyat" -> Ahilik/Sedd hikayesi
- StageSelector: blue/red/emerald -> red/gold/purple
- ToolkitShowcase: tab layout -> 3 kart grid
- Font: Inter -> DM Sans

### Fixed
- Cift header problemi (light tema ile hell)
- Cookies banner imla xetalari (AZ herfleri)
- PNG encoding hook (binary skip)

## [0.1.0] - 2026-03-22
### Added
- Ilkin sayt qurulusu (52 route)
- 9 blog yazisi (statik TypeScript)
- 14 dashboard admin sehifesi
- B2B Panel (8 toolkit modulu)
- RSS xeber pipeline (6 menbe)
- Auth (localStorage, TEST_USERS)
- WhatsApp floating button

## [0.9.1] - 2026-05-09
### Added - TASK-0102 Contact lead funnel
- Contact page CTA funnel: KAZAN AI primary card, WhatsApp card, Telegram card.
- `POST /api/leads/track` writes contact CTA clicks to `leads` with `source`, `channel`, `locale`, `user_agent`, and `ip_hash`.
- `leads` table mapping and `idx_leads_source_channel` migration.
- 4-language `contact.funnel` namespace in `messages/*.json`.
- Playwright contact funnel checks for 4 locales and WhatsApp tracking payload.

### Changed
- Removed visible phone card from contact page; WhatsApp handoff remains via localized prefilled redirect.
