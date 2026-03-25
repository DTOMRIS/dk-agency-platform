# AGENT START

Yeni agent oturumu açıldığında ilk 60 saniyede aşağıdakileri sırayla oku:

1. `docs/PROJECT-STATUS.md`
2. `docs/STATE.md`
3. `docs/DECISIONS.md`
4. `docs/HANDOFF.md`
5. Aktif task card: `docs/tasks/TASK-xxxx.md`

## Zorunlu kurallar
- Session memory'ye güvenme, repo memory'ye güven.
- Task ID olmadan commit/PR yok (`TASK-0000` formatı).
- Protected dosyalara dokunurken onay/prosedür zorunlu.
- İş bitiş kriteri: kod + docs (STATE/DECISIONS/HANDOFF) birlikte güncel olmalı.

## Çalıştırılacak temel komutlar
```bash
npm run verify
npm run snapshot:state
npm run audit:drift
```

## Handoff kontratı (zorunlu)
Her çalışma sonunda `docs/HANDOFF.md`'ye şu blok eklenir:
- Ne değişti
- Ne değişmedi
- Riskler
- Sonraki adım

