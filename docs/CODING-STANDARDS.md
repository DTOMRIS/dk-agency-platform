# DK Agency -- Kod Yazma Qaydalari

## TypeScript
- `any` tipi QADAGAN -- `unknown` istifade et
- Interface > type (mumkun olduqda)
- Explicit return types (public API funksiyalari ucun)

## React / Next.js
- 'use client' -- yalniz hooks/browser API istifade eden komponentlere
- next/image istifade et (img tag QADAGAN)
- next/link istifade et (a tag QADAGAN -- xarici linkler istisna)
- loading="lazy" default
- Alt text AZ dilinde

## CSS / Tailwind
- LIGHT tema only -- dark class-lar QADAGAN
- min-h-screen, 100vh section-larda QADAGAN
- absolute positioning layout ucun QADAGAN -- normal flow istifade et
- Mobile-first: 320px, 390px, 768px, 1024px, 1440px
- Cards: rounded-2xl, hover:shadow-lg
- Buttons: rounded-xl
- Badge: rounded-full

## Git
- Commit formati: TASK-XXXX: qisa izah
- Protected files: ALLOW_PROTECTED=1 ile
- Pre-push hook: main-e direkt push bloklanir -- PR ac
- Binary files (PNG, JPG): encoding hook-dan kecmir -- verify-encoding.mjs skip edir

## Dil
- Default: AZ (Azerbaycan Turkcesi)
- Butun UI text AZ dilinde
- "Siz" formasi
- Imla: e, o, u, s, c, g, i herfleri mutleq duzgun yazilmali
