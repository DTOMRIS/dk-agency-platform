# STATE

Auto-generated. Do not edit manually.

## Snapshot
- GeneratedAt: 2026-04-24T18:58:36.730Z
- BuildStatus: PASS

## Routes (117)
- /[locale]
- /[locale]/about
- /[locale]/admin/leads
- /[locale]/b2b-panel
- /[locale]/b2b-panel/ilanlarim
- /[locale]/b2b-panel/mesajlar
- /[locale]/b2b-panel/toolkit
- /[locale]/b2b-panel/yeni-ilan
- /[locale]/blog
- /[locale]/blog/[slug]
- /[locale]/contact
- /[locale]/cookies
- /[locale]/dashboard/ilanlar
- /[locale]/dashboard/ilanlar/[id]
- /[locale]/elaqe
- /[locale]/forgot-password
- /[locale]/haberler
- /[locale]/haberler/[slug]
- /[locale]/haqqimizda
- /[locale]/ilan-ver
- /[locale]/ilanlar
- /[locale]/kazan-ai
- /[locale]/privacy
- /[locale]/randevu
- /[locale]/reset-password
- /[locale]/sedd-rozeti
- /[locale]/settings
- /[locale]/terefdashlar
- /[locale]/terms
- /[locale]/toolkit
- /[locale]/toolkit/aqta-checklist
- /[locale]/toolkit/basabas
- /[locale]/toolkit/branding-guide
- /[locale]/toolkit/checklist
- /[locale]/toolkit/delivery-calc
- /[locale]/toolkit/food-cost
- /[locale]/toolkit/insaat-checklist
- /[locale]/toolkit/menu-matrix
- /[locale]/toolkit/pnl
- /[locale]/toolkit/staff-retention
- /[locale]/uzvluk
- /[locale]/verify-email
- /auth/forgot-password
- /auth/login
- /auth/register
- /b2b-panel
- /b2b-panel/[slug]
- /b2b-panel/ilanlarim
- /b2b-panel/mesajlar
- /b2b-panel/toolkit
- /b2b-panel/toolkit/financial-health
- /b2b-panel/toolkit/franchise-readiness
- /b2b-panel/toolkit/inventory
- /b2b-panel/toolkit/lsm-planner
- /b2b-panel/toolkit/operational-audit
- /b2b-panel/toolkit/pnl-simulator
- /b2b-panel/toolkit/roi-calculator
- /b2b-panel/toolkit/talent-up
- /b2b-panel/toolkit/workforce
- /b2b-panel/yeni-ilan
- /blog
- /dashboard
- /dashboard/aqta-checklist
- /dashboard/ayarlar
- /dashboard/b2b-yonetimi
- /dashboard/blog
- /dashboard/blog/[slug]
- /dashboard/blog/new
- /dashboard/blog/yeni
- /dashboard/deal-flow
- /dashboard/duyurular
- /dashboard/etkinlikler
- /dashboard/haberler
- /dashboard/hero
- /dashboard/ilan-onaylari
- /dashboard/ilanlar
- /dashboard/ilanlar/[id]
- /dashboard/kazan-leads
- /dashboard/kullanicilar
- /dashboard/loglar
- /dashboard/mesajlar
- /dashboard/pipeline
- /dashboard/raporlar
- /dashboard/roller
- /dashboard/settings
- /dashboard/site
- /dashboard/toolkit
- /dashboard/trends
- /dashboard/users
- /dashboard/xeberler
- /dashboard/xeberler/rss
- /docs/member-env-checklist
- /forgot-password
- /haberler
- /haberler/[slug]
- /ilan-ver
- /ilanlar
- /kazan-ai
- /news
- /reset-password
- /sedd-rozeti
- /settings
- /toolkit
- /toolkit/aqta-checklist
- /toolkit/basabas
- /toolkit/branding-guide
- /toolkit/checklist
- /toolkit/delivery-calc
- /toolkit/food-cost
- /toolkit/insaat-checklist
- /toolkit/menu-matrix
- /toolkit/pnl
- /toolkit/staff-retention
- /uzvluk
- /verify-email
- /xeberler
- /xeberler/[slug]

## API Routes (39)
- /api/admin/news/approve
- /api/admin/news/pending
- /api/admin/news/reject
- /api/auth
- /api/auth/change-password
- /api/auth/forgot-password
- /api/auth/reset-password
- /api/auth/verify-email
- /api/blog
- /api/blog/[slug]
- /api/health
- /api/kazan-ai
- /api/kazan-ai/leads
- /api/listings
- /api/listings/[id]
- /api/listings/[id]/leads
- /api/listings/[id]/reviews
- /api/listings/[id]/status
- /api/member/auth
- /api/member/checkout
- /api/member/session
- /api/member/webhook
- /api/news
- /api/news-pipeline/fetch
- /api/news-pipeline/translate
- /api/news/[slug]
- /api/news/admin
- /api/news/admin/[id]
- /api/news/fetch
- /api/news/sources/[id]
- /api/news/translate
- /api/newsletter/digest
- /api/orchestrator
- /api/rss/haberler
- /api/rss/xeberler
- /api/rss/xeberler/[locale]
- /api/settings
- /api/telegram/post
- /api/upload

## i18n Namespaces (0)
- none detected

## Manual Status (son yenilənmə: 2026-04-12)

### Aktiv Branch-lar
- main (production)

### Son 5 PR
| # | Başlıq | Tarix | Status |
|---|--------|-------|--------|
| #40 | docs: TASK-0005 prod verification + STATE update | 2026-04-12 | merged |
| #39 | fix(production): triage + devir field gap (TASK 1-5) | 2026-04-12 | merged |
| #38 | fix(production): mobile triage + content contrast + editorial audit | 2026-04-12 | merged |
| #37 | fix: admin leads route 404 -> existing KAZAN leads screen | 2026-04-12 | merged |
| #36 | fix: production triage — lead form contrast + cookies banner | 2026-04-12 | merged |

### Açıq Task-lar
| TASK | Scope | Status |
|------|-------|--------|
| TASK-0006 | Admin password rotation | in progress |
| TASK-0007 | Devir M5 real CRUD | in progress |
| TASK-0008 | Resend email integration | in progress |

### Bilinən Bug-lar
- /ilan-ver və /ilanlar dev server-də 404 (middleware rewrite, prod-da OK)
- Vercel preview 401 (Authentication Protection aktiv)

### Env Var Statusu
| Var | Qurulu? |
|-----|---------|
| DATABASE_URL | ✅ |
| DEEPSEEK_API_KEY | ✅ |
| RESEND_API_KEY | ❌ əskik |
| ADMIN_SEED_PASSWORD | ❌ əskik |
