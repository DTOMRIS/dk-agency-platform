# TASK-0157C Continuation — Dashboard i18n Remaining 5 Files

**Last session:** 2026-05-21 (7+ saat, 4 PR merged)
**Dashboard i18n:** 11/16 fayl bitdi (69%)
**Qalan:** 5 fayl (roller, food-cost, faturalar, auditor, b2b-yonetimi)

## Session Summary (2026-05-21)

| PR | Task | Keys | SHA |
|---|---|---|---|
| #171 | TASK-0157A — sidebar + kazan-leads + listing labels | 65 | c1547aa |
| #172 | TASK-0157B — route mirrors + locale-aware links | 0 | 84ccadb |
| #173 | TASK-0157C-1 — Pattern A pilot (settings/toolkit/site/trends) | 81 | bc7d082 |
| #174 | TASK-0157C-2a — Server Pattern A (mesajlar/pipeline/loglar/raporlar) | 99 | 2ad24c2 |

Cəmi: 245 leaf key × 4 dil = 980 tərcümə. Net -143 sətir kod azalması.

## Qalan 5 fayl — plan

### TASK-0157C-2b: roller (51 key) — ƏN HƏSSAS
- Client component, `useTranslations`
- **Permission/səlahiyyət terminologiyası — diqqət!**
- AZ "rol" / "səlahiyyət" / "icazə" fərqi saxla
- RU: "роль" yox "должность"
- Tək batch, ayrı PR (~30 dəq)

### TASK-0157C-3: food-cost + faturalar + auditor (150 key)
- food-cost (54) — client, kalkulyator-bənzər səhifə
- faturalar (65) — client, ən böyük fayl
- auditor (31) — client
- Bir batch, bir PR (~50 dəq)

### TASK-0157C-4: b2b-yonetimi (23 key)
- Client component
- **3 mock keyword "İstanbul HORECA Group" — TOXUNMA**
- Devir M5 işidir, yalnız UI label-ları
- Tək batch, ayrı PR (~20 dəq)

### TASK-0157D: faturalar/[id]
- Record<Locale> YOXDUR
- Inline hardcoded pattern (481 sətir, 0 Record)
- Ayrı yanaşma, ayrı task (sonra)

## Pattern reference

### Client component (TASK-0157C-1 nümunə)
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('dashboard<Name>');
  return <h1>{t('title')}</h1>;
}
```

### Server component (kazan-leads nümunə)
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('dashboard<Name>');
  return <h1>{t('title')}</h1>;
}
```

## Sabit tərcümə qaydaları

| AZ | TR | RU | EN |
|---|---|---|---|
| Lead | leadleri | Лиды | Lead |
| Intent | Niyet | Намерение | Intent |
| Email | E-posta | Эл. почта | Email |
| Tənzimləmələr | Ayarlar | Настройки | Settings |
| Çıxış | Çıkış | Выход | Logout |

## Mock data — TOXUNMA (Devir M5)

| Fayl | Mock keyword | Sətir |
|---|---|---|
| pipeline | İstanbul, Türkiye | :227 |
| b2b-yonetimi | İstanbul HORECA Group | :34 |
| b2b-yonetimi | İstanbul | :41 |
| mesajlar | (1 mock) | — |
| raporlar | (4 mock) | — |
| b2b-yonetimi | (3 mock) | — |

## Sabah başlama prompt-u

```
ƏVVƏL OXU: docs/handoff/TASK-0157C-CONTINUATION.md

git checkout main
git pull origin main
git log --oneline -5

Sonra TASK-0157C-2b başlayır:
  - roller (51 key, client component)
  - useTranslations pattern
  - Permission terminologiyası:
    * AZ "rol" → TR "Rol" → RU "Роль" → EN "Role"
    * AZ "səlahiyyət" → TR "Yetki" → RU "Разрешение" → EN "Permission"
    * AZ "icazə" → TR "İzin" → RU "Доступ" → EN "Access"
  - Tək batch, tək PR
  - Mock data yox, təmiz
```

## L-010 (yeni dərs)

**Mock data UI label-larından ayır.** Pattern A miqrasiyası zamanı agent İstanbul/HORECA/Kadıköy gördükdə tərcümə etməməli — bunlar Devir M5 işidir. Hər task prompt-unda mock keyword siyahısı əlavə olunmalıdır.
