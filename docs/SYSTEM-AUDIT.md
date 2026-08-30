# DK Agency — System Audit (CANLI)

> Avtomatik: `node scripts/generate-audit.mjs` | Hər PR-ın DoD-una daxil.
> Son güncəlləmə: 2026-08-30 15:20:55 | Branch: claude/deploy-commit-changelog-upr6me | 50bdd31

## Route İnventarı
| Kateqoriya | Say |
|-----------|-----|
| Toplam page.tsx | 255 |
| Dashboard | 92 |
| Toolkit | 47 |

## AI Stack (lib/ai-models.ts SST)
| Provider | Model | Fayl sayı |
|----------|-------|-----------|
| DeepSeek | v4-flash | 23 |
| Gemini | 2.5-flash | 8 |
| Anthropic | claude-sonnet-4-6 | fallback |

AI Insight bağlı səhifə: **9**

## i18n
| AZ | EN | RU | TR | Parity |
|----|----|----|----|----|
| 4450 | 4377 | 4377 | 4377 | ⚠️ |

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
| DEEPSEEK_API_KEY | ❌ |
| GEMINI_API_KEY | ❌ Yoxdur / İstifadə edilmir (DeepSeek/Claude aktiv) |
| ANTHROPIC_API_KEY | ⚠️ fallback yox |
| SMTP_USER | ❌ |

## Email Backend
| Komponent | Status |
|-----------|--------|
| Provider | ✅ Hostinger SMTP (nodemailer) |
| Templates | ✅ lib/email/templates.ts |
| Routes | ✅ 10 API route sendEmail() |
| SMTP_USER | ⚠️ boş → console.log mock |

## Fatura OCR
| Komponent | Status |
|-----------|--------|
| OCR pipeline | ✅ lib/invoice-ocr/ mövcud |
| GEMINI_API_KEY | ❌ Yoxdur (Sistem tamamilə DeepSeek və Claude üzərindədir) |

---
## Manual (əl ilə güncəllə)

### Production
- Son smoke: 2026-05-28 — 23/23 PASS, 0 kritik
- Hostinger key: DeepSeek & Claude aktivdir

### Tech Debt
- Route [locale] uyğunsuzluğu
- ai-readiness ghost route
- SektorNabziTabs Pattern A keçməyib
