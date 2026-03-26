# DK Agency - Claude Code Context

## Project
Azarbaycanin AI-supported HoReCa platformasi.
Consulting + digital tools + AI is the core model.

## Brand Names
- `DK Agency` = umbrella brand, B2B consulting
- `KAZAN AI` = AI chatbot / assistant
- `OCAQ` = owner dashboard (`/dashboard`)
- `Sedd Rozeti` = audit / quality badge
- `Dogan Tomris` = founder

## Tech Stack
- Next.js 16 + Tailwind CSS v4 + Framer Motion
- DM Sans (body) + Playfair Display (headings)
- Drizzle ORM + Neon PostgreSQL
- next-intl (3 languages: AZ, TR, EN)
- Vercel deployment

## Colors
- Background: `#FAFAF8`
- White: `#FFFFFF`
- Surface: `#F9FAFB`
- Navy: `#1A1A2E`
- Gold: `#C5A022`
- Red CTA: `#E94560`
- Muted text: `#6B7280`
- Border: `#E5E7EB`
- Purple: `#8B5CF6`
- Green: `#059669`

## Rules
1. Update `docs/CHANGELOG.md` after every important change.
2. Do not use `Agentlik`, `Holdinq`, or `CRM` wording in product UI.
3. Light theme only. Dark theme is prohibited.
4. Do not use `any`. Prefer `unknown`.
5. Do not use `console.log` in production code.
6. All UI text should default to AZ.
7. Commit format: `TASK-XXXX: short summary`
8. Protected files: `app/layout.tsx`, `components/layout/Header.tsx`, `Footer.tsx` require `ALLOW_PROTECTED=1`

## Illustration Style
- Hairline style
- Petroleum / dark gray `#2C2C2A`
- Accent: terracotta `#C07A50`
- Flat, no heavy gradients or shadows
- Lots of whitespace

## Key Files
- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/layout/MegaMenu.tsx`
- `components/Hero.tsx`
- `components/StageSelector.tsx`
- `components/ToolkitShowcase.tsx`
- `components/CTASections.tsx`
- `components/ui/CookiesBanner.tsx`
- `app/page.tsx`
- `app/layout.tsx`

## Agent Definitions
- `@scout` - web search for trends, competitors, platforms, and market research. Use sources. Do not guess.
- `@architect` - strategy plan, roadmap, feature spec, field-by-field admin model, and sales flow.
- `@builder` - write code, create components, and keep the current design language, performance, and mobile UX intact.
- `@verifier` - check build, tests, lint, encoding, and UX risks before release.

## Agent Usage
- Use `@scout` when research or verification from external sources is needed.
- Use `@architect` for product direction, structure, and feature planning.
- Use `@builder` for implementation.
- Use `@verifier` for final quality audit.
