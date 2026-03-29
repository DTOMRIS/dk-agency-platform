# Changelog

Butun ehemiyyetli deyisiklikler bu faylda qeyd olunur.

## [0.4.0] - 2026-03-26
### Added
- `KAZAN AI` knowledge base (`lib/kazan-ai/knowledge-base.ts`) - 10 yazidan cixarilan formula, range, checklist, praktik addim ve guru sitatlari
- `KAZAN AI` system prompt (`lib/kazan-ai/system-prompt.ts`) - AZ ton, sales layer, toolkit/blog yonlendirmesi
- `POST /api/kazan-ai` Anthropic proxy route - server-side system prompt + knowledge injection
- `/kazan-ai` real chat UI - sample questions, clickable markdown linkler, toolkit enteqrasiyasi
- `/toolkit/insaat-checklist` ve locale wrapper - temiz interactive checklist, upload util istifadəsi
- `lib/utils/image-resize.ts` - client-side image resize/validation util

### Changed
- `components/layout/Footer.tsx` - toolkit ve insaat linkleri yenilendi, encoding temizlendi
- `components/layout/MegaMenu.tsx` - insaat checklist linki elave olundu, encoding temizlendi
- `app/kazan-ai/page.tsx` teaser sehifeden real chat shell-e cevrildi

## [0.3.0] - 2026-03-24
### Added
- i18n altyapisi (next-intl v4, 3 dil: az/tr/en, 168 key)
- Database schema (Drizzle + 6 tablo: blog, ilan, partner, hero, guru, settings)
- Image optimization (sharp + Cloudinary/Unsplash config)
- Design tokens (colors, fonts, shadows, radius — typed)
- Prettier config (.prettierrc)
- /toolkit — index page (3 alet karti)
- /toolkit/food-cost — porsiya maya deyeri hesablayici (interaktiv)
- /toolkit/pnl — ayliq P&L simulyatoru (KPI + editable cedvel)
- /toolkit/checklist — 43 maddelik restoran acilis checklist (7 bolme, progress bar)
- Blog detail: MarkdownRenderer ile zengin formatlama (guru box, dogan notu, warning/tip, cedvel, code block)
- Blog detail: related articles sidebar, tag-lar, xulase paneli
- .claude/CLAUDE.md — proyekt kontekst faylI
- docs/BRAND-GUIDE.md, docs/CODING-STANDARDS.md

### Changed
- Blog list: components/constants -> lib/data/blogArticles (9 yazi duzgun gosterilir)
- Blog detail: ReactMarkdown -> MarkdownRenderer (zengin formatlama)
- Xeberler: basliq + UI AZ diline cevirildi ("En Cox Oxunan", "oxunus")
- StageSelector: /basla/checklist linki -> /toolkit/checklist (404 fix)

### Fixed
- CI: 10 ESLint error hell edildi (unescaped quotes, unused imports, Math.random in render, mojibake)
- verify-encoding.mjs: binary fayllari (PNG/JPG) skip edir, oz-ozunu skip edir
- Butun bos route qovluqlari (toolkit/food-cost, toolkit/pnl) sehifeyle dolduruldu

## [0.2.0] - 2026-03-24
### Added
- Utility bar (KAZAN AI banner)
- MegaMenu (880px, 18 item, TEZLIKLE badge)
- OCAQ Panel mockup (hero section)
- Sedd Rozeti konsepti
- Axeptio stili cookies banner (localStorage consent)
- 5 illustrasiya (hairline stil)
- CTO Durum Raporu
- Development journal sistemi
- Kod standartlari (ESLint, Prettier, design tokens)

### Changed
- Hero: dark -> light tema, "pul itirdiyin" basliq
- Nav: Toolkit/Saglamliq/Xeberler -> Ana sehife/Trendler/Blog/Ocaq
- Footer: dark -> light (#FAFAF8), 5 sutun
- DoganNote: "riyaziyyat" -> Ahilik/Sedd hikayesi
- StageSelector: blue/red/emerald -> red/gold/purple
- ToolkitShowcase: tab layout -> 3 kart grid
- Font: Inter -> DM Sans

### Fixed
- Cift header problemi (light tema ile hell)
- Cookies banner imla xetalari (AZ herfleri)
- PNG encoding hook (binary skip)

## [0.1.0] - 2026-03-22
### Added
- Ilkin sayt qurulusu (52 route)
- 9 blog yazisi (statik TypeScript)
- 14 dashboard admin sehifesi
- B2B Panel (8 toolkit modulu)
- RSS xeber pipeline (6 menbe)
- Auth (localStorage, TEST_USERS)
- WhatsApp floating button
