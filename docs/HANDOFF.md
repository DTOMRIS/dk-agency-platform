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
