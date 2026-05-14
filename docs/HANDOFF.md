# HANDOFF

Every agent/session must append a handoff block with this contract:
- Ne değişti
- Ne değişmedi
- Riskler
- Sonraki adım

Use script:
`node scripts/append-handoff.mjs` with env vars:
- `HANDOFF_CHANGED`
- `HANDOFF_UNCHANGED`
- `HANDOFF_RISKS`
- `HANDOFF_NEXT`
- optional `HANDOFF_ACTOR`



## 2026-03-05T14:44:18.750Z — codex
- Ne değişti:
  - Operations docs and templates added`nHooks and verify scripts added`nCI workflows extended (ci/state-snapshot/drift-audit)`nTask card and governance files added
- Ne değişmedi:
  - Business UI routes and feature logic not refactored
- Riskler:
  - Protected file gate may block intentional core edits unless ALLOW_PROTECTED=1`nTask-card enforcement may fail legacy commit styles until team adopts TASK-ID
- Sonraki adım:
  - Enable GitHub branch protection settings per docs/REPO-GOVERNANCE.md`nAdopt TASK-ID in all commits`nRun first weekly drift audit


## 2026-04-12T17:15:00.000Z — claude-code

### TASK-0005 verification
- Preview: ⚠️ SKIPPED (Vercel Authentication Protection → 401)
- Prod: ✅ PASS (4/4 Playwright tests)
  - /ilan-ver loads (auth wall) ✅
  - /ilan-ver shows login + register links ✅
  - /ilanlar showcase loads ✅
  - devir listing modal shows İcarə müddəti, Aylıq xalis mənfəət, Mülkiyyət tipi ✅
- Unit test: ✅ 32/32 PASS (field config integrity)
- TypeScript: ✅ 0 errors
- Timestamp: 2026-04-12T17:15Z

- Ne değişti:
  - TASK-0001: repo ops bootstrap (hooks, CI, STATE)
  - TASK-0002: admin leads route + blog/news contrast guardrails
  - TASK-0003: mobile editorial audit + sitemap + article metadata
  - TASK-0004: .gitignore local working images
  - TASK-0005: devir field gap (leaseTermMonths, monthlyNetProfit, propertyType) + franchise minArea + obyekt leaseTermMonths + Playwright scaffold
- Ne değişmedi:
  - DB schema (JSONB, migration yok)
  - Status workflow
  - Auth flows
  - Dashboard routes
- Riskler:
  - propertyType ilk select-tip field — manual form test edilməli (auth lazım)
  - Vercel preview authentication aktiv — PR preview testləri mümkün deyil
- Sonraki adım:
  - Faza 1: listing detail page redesign (BizBuySell card layout benchmark)
  - Route middleware fix: /ilan-ver və /ilanlar dev server-də 404 (pre-existing)

## 2026-03-23T08:15:47.626Z — unknown
- Ne değişti:
  - Trendlerin idare edilmesi (CRUD), Modal UI, STATE.md güncellemesi
- Ne değişmedi:
  - Business logic routes, temel UI dışı bileşenler
- Riskler:
  - Mock veri kullanımı (gerçek API bağlantısı yok)
- Sonraki adım:
  - Trend verilerinin veritabanına bağlanması, News API entegrasyonu

## 2026-05-09T10:40:00+04:00 - codex
- Ne degisti:
  - TASK-0102 contact page lead funnel added: KAZAN AI / WhatsApp / Telegram channel cards, no visible phone card.
  - Contact clicks now write to `leads` through `/api/leads/track` with `source`, `channel`, `locale`, `user_agent`, and `ip_hash`.
  - `contact` i18n namespace added to AZ/RU/EN/TR messages.
- Ne degismedi:
  - Protected files untouched: `lib/member-access.ts`, `listingFieldConfig.ts`, `middleware.ts`.
  - Existing KAZAN lead capture remains separate from contact click tracking.
- Riskler:
  - Production DB must apply `drizzle/0001_foamy_gideon.sql`.
  - `IP_HASH_SALT` must be set in Hostinger before deploy.
  - Telegram handle assumed from existing social link: `https://t.me/dkagency`.
- Sonraki adim:
  - After deploy, run `SELECT channel, locale, COUNT(*) FROM leads WHERE source='contact_page' GROUP BY channel, locale ORDER BY 1, 2;`.

## 2026-05-09T11:30:00+04:00 - codex
- Ne degisti:
  - TASK-0100 P&L Simulator moved from hardcoded AZ copy to `toolkit.pnl` Pattern A i18n.
  - Added AZ/RU/EN/TR `toolkit.pnl` message namespaces and locale-aware number formatting/parsing.
  - Added `/toolkit/pnl-simulator` route aliases and Playwright coverage for 4 locales.
- Ne degismedi:
  - Other toolkit calculators remain out of scope.
  - DB schema and protected files were not touched.
- Riskler:
  - `CLAUDE-DESIGN.md` has pre-existing encoding drift and should be cleaned separately before relying on it in hooks.
- Sonraki adim:
  - Continue remaining toolkit i18n tasks one calculator at a time.

## 2026-05-13T21:28:40+04:00 - codex
- Ne degisti:
  - TASK-0120: `lib/ai-router.ts` streaming, AbortController timeout, DeepSeek JSON mode, Claude streaming support ve token logging ile yenilendi.
  - Sezon Planlama `stream: true`, `responseFormat: 'json_object'`, `timeout: 55000`, `maxDuration = 60` ile calisacak sekilde ayarlandi.
  - Diger marketing tool route-larina `maxDuration = 60` ve explicit `timeout: 55000` eklendi.
  - Sezon Planlama output schema PR #118 relax oncesi sert formuna geri alindi.
- Ne degismedi:
  - Protected files untouched: `lib/member-access.ts`, `lib/listingFieldConfig.ts`, `middleware.ts`, `.env.production`, `package.json`.
  - Locale 404 fix bu task kapsaminda yapilmadi; TASK-0121'e kaldi.
- Riskler:
  - AI router 7+ live tool tarafindan kullanildigi icin regression test zorunlu.
  - Streaming production proxy davranisi Hostinger uzerinde Dogan tarafindan test edilmeli.
- Sonraki adim:
  - PR acik kalacak; Dogan Sezon Planlama, Marka Kompasi ve KST regression testlerinden sonra merge karari verecek.
## 2026-05-14T07:15:00+04:00 - codex
- Ne degisti:
  - TASK-0122 Faza 1: Sezon Planlama route-u raw DeepSeek output ve Zod error detail loglayacaq.
  - Zod validation fail response-u 502 yerine 422 + `debug` body qaytaracaq.
- Ne degismedi:
  - Schema/prompt align hele edilmedi; Faza 2 Dogan raw output verdikden sonra baslayacaq.
  - Protected files untouched: `lib/member-access.ts`, `lib/listingFieldConfig.ts`, `middleware.ts`, `.env.production`, `lib/ai-router.ts`.
- Riskler:
  - Debug output production response-da gorunecek; bu Faza 1 ucun qesden edilir ve qisa omurludur.
- Sonraki adim:
  - Dogan submit edib Response body ve Hostinger `[SEZON-DEBUG] raw output` logunu gonderecek; sonra Faza 2 schema align.
## 2026-05-14T09:42:00+04:00 - codex
- Ne degisti:
  - TASK-0122 Faza 2: Sezon Planlama prompt-u Zod schema ile eyni English JSON keys qaytarmağa mecbur edildi.
  - Inline strict JSON structure: calendar, totalCampaigns, budgetSummary, topRecommendations, ahilikQuote.
- Ne degismedi:
  - Schema deyismedi; debug log-lar saxlanildi.
  - Protected files untouched: `lib/member-access.ts`, `lib/listingFieldConfig.ts`, `middleware.ts`, `lib/ai-router.ts`.
- Riskler:
  - Debug log-lar prod-da qalir; ugurlu testden sonra TASK-0123 ile temizlenmelidir.
- Sonraki adim:
  - Dogan deploydan sonra Sezon Planlama 2-3 defe submit test edir; ugurlu olarsa TASK-0123 debug cleanup, sonra TASK-0124 diger tool key audit.