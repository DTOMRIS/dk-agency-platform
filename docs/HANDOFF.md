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


## 2026-03-23T08:15:47.626Z — unknown
- Ne değişti:
  - Trendlerin idare edilmesi (CRUD), Modal UI, STATE.md güncellemesi
- Ne değişmedi:
  - Business logic routes, temel UI dışı bileşenler
- Riskler:
  - Mock veri kullanımı (gerçek API bağlantısı yok)
- Sonraki adım:
  - Trend verilerinin veritabanına bağlanması, News API entegrasyonu
