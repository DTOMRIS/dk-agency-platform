# DK Agency — System Audit (CANLI)

> Avtomatik: `node scripts/generate-audit.mjs` | Hər PR-ın DoD-una daxil.
> Son güncəlləmə: 2026-05-28 14:24:18 | Branch: feat/system-audit-generator | d4dcae2

## Route İnventarı
| Kateqoriya | Say |
|-----------|-----|
| Toplam page.tsx | 180 |
| Dashboard | 76 |
| Toolkit | 35 |

## AI Stack (lib/ai-models.ts SST)
| Provider | Model | Fayl sayı |
|----------|-------|-----------|
| DeepSeek | v4-flash | 19 |
| Gemini | 2.5-flash | 7 |
| Anthropic | claude-sonnet-4-6 | fallback |

AI Insight bağlı səhifə: **9**

## i18n
| AZ | EN | RU | TR | Parity |
|----|----|----|----|----|
| 3087 | 3087 | 3087 | 3087 | ✅ |

## Protected (14)
- `lib/data/listingFieldConfig.ts`
- `lib/db/schema.ts`
- `lib/member-access.ts`
- `app/api/member/auth/route.ts`
- `lib/utils/listingStatus.ts`
- `middleware.ts`
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `app/layout.tsx`
- `app/globals.css`
- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/layout/MobileBottomNav.tsx`

## ENV (.env.local)
| Key | Status |
|-----|--------|
| DEEPSEEK_API_KEY | ✅ |
| GEMINI_API_KEY | ⚠️ OCR kor |
| ANTHROPIC_API_KEY | ⚠️ fallback yox |

---
## Manual (əl ilə güncəllə)

### Production
- Son smoke: 2026-05-28 — 23/23 PASS, 0 kritik
- Hostinger GEMINI_API_KEY: yoxlanmalı

### Tech Debt
- Route [locale] uyğunsuzluğu
- ai-readiness ghost route
- SektorNabziTabs Pattern A keçməyib
