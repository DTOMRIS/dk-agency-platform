## TASK ID
TASK-XXXX

## Nə dəyişdi
- 

## Nə dəyişmədi (do-not-touch ihlalı yox)
- [ ] lib/data/listingFieldConfig.ts toxunulmadı
- [ ] lib/db/schema.ts toxunulmadı (migration olmadan)
- [ ] lib/utils/listingStatus.ts toxunulmadı
- [ ] Auth faylları toxunulmadı

## dk-validator çıxışı (məcburi)
<!-- Stop hook 5/8 check avtomatik. Tam 8-check: npm run dk:validate -->
```
Verdict: PASS / BLOCK
```

## Checklist
- [ ] STATE.md yeniləndi
- [ ] CHANGELOG.md sətri əlavə edildi
- [ ] `tsc --noEmit` 0 error
- [ ] Real test keçdi (mock deyil)
- [ ] `npm run audit:system` icra olundu
- [ ] dk-validator PASS (çıxış yuxarıda)
