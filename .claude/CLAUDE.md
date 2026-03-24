# DK Agency — Claude Code Kontekst

## Proyekt nədir?
Azərbaycanın ilk AI-dəstəkli HoReCa (Hotel, Restaurant, Cafe) platforması.
Danışmanlıq + dijital alətlər + AI = hibrid model.

## Marka adları (KİLİDLİ):
- **DK Agency** = çatı marka, B2B danışmanlıq
- **KAZAN AI** = AI chatbot/asistan
- **OCAQ** = sahibkar paneli (/dashboard)
- **Şədd Rozeti** = audit sertifikası/keyfiyyət rozeti
- **Doğan Tomris** = qurucu (HEÇVAXT "Özbahçeci" YAZMA!)

## Tech stack:
- Next.js 16 + Tailwind CSS v4 + Framer Motion
- DM Sans (body) + Playfair Display (başlıqlar)
- Drizzle ORM + Neon PostgreSQL
- next-intl (3 dil: AZ, TR, EN)
- Vercel deploy

## Rənglər (LIGHT TEMA — DARK QADAĞAN):
- bg: #FAFAF8, white: #FFFFFF, surface: #F9FAFB
- navy: #1A1A2E (text + utility bar)
- gold: #C5A022 (aksent)
- red/CTA: #E94560 (butonlar)
- textMuted: #6B7280, border: #E5E7EB
- purple: #8B5CF6 (devir), green: #059669 (müsbət)

## Qaydalar:
1. Hər dəyişiklikdən sonra docs/CHANGELOG.md yenilə
2. "Agentlik", "Holdinq", "CRM" sözlərini istifadə ETMƏ — bu HoReCa platformasıdır
3. Dizayn: LIGHT tema only, dark tema QADAĞAN
4. `any` tipi QADAĞAN — `unknown` istifadə et
5. `console.log` production-da QADAĞAN
6. Bütün UI text AZ dilində (default)
7. Commit formatı: TASK-XXXX: qısa izah
8. Protected files: app/layout.tsx, components/layout/Header.tsx, Footer.tsx — ALLOW_PROTECTED=1 lazım

## İllüstrasiya stili:
- İncə çizgi (hairline), petroleum/tünd boz (#2C2C2A)
- Vurgu: terracotta (#C07A50)
- Flat, gradient/gölge YOXDUR
- %50 boşluq

## Əsas fayllar:
- components/layout/Header.tsx — Nav + Utility bar + MegaMenu trigger
- components/layout/Footer.tsx — Light tema footer
- components/layout/MegaMenu.tsx — 880px mega menü
- components/Hero.tsx — OCAQ Panel mockup ilə hero
- components/StageSelector.tsx — 3 mərhələ kartı
- components/ToolkitShowcase.tsx — 3 alət kartı
- components/CTASections.tsx — DoganNote + JoinCTA
- components/ui/CookiesBanner.tsx — Axeptio stili cookies
- app/page.tsx — Ana səhifə
- app/layout.tsx — Root layout (DM Sans + Playfair)
