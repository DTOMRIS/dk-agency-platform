# DK Agency Platform Guidelines

## Project Identity
- **Project Name**: `dk-agency-platform`
- **Core Business**: Investment, Holding, and Agency Management.
- **Target Audience**: Business partners, investors, and elite clients.
- **CRITICAL RULE**: This is not a Restaurant Management System. Avoid hardcoded hospitality, restaurant, food cost, or AQTA content on core landing pages unless the task is explicitly for a sub-module.
- **AQTA SOURCE OF TRUTH**: `AQTA qeydiyyatı üçün müraciət ASAN/KOBIA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.`

## Design System
- **Tone**: Premium, sophisticated, high-tech.
- **Theme**: Premium light for dashboard, dark glassmorphism for landing.
- **Primary Color**: `brand-red` (`#E11D48`)
- **Typography**: `Inter` (sans), `Playfair Display` (display/serif)

## Component Usage
- **Global Header**: Always use `Header.tsx`.
- **Do Not Use**: `HospitalityHeader.tsx` for core platform UI.
- **Footer**: Use project-specific footers that match the agency/holding identity.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Prohibited Actions
- Do not make reckless changes without reading the existing component and route structure first.
- Do not copy-paste templates from other sectors without deep customization.
- Do not bypass `Header.tsx` for global navigation.

## Content Contrast Guardrail
- In blog, news, article, CMS, and markdown content surfaces, dark text is the default.
- On light backgrounds such as `bg-white`, `bg-[var(--dk-paper)]`, `bg-slate-50`, and `bg-slate-100`, use dark text utilities only: `text-slate-900`, `text-slate-800`, `text-[var(--dk-ink)]`, or `text-[var(--dk-ink-soft)]`.
- `text-white`, `text-white/70`, `text-white/80`, and similar light-text utilities are forbidden inside article body, blog cards, news content, forms, CMS prose, or any light container.
- Light text is allowed only on provably dark surfaces: image heroes with dark overlay, dark CTA sections, dark nav, and dark footer surfaces.
- If a component mixes hero content and article content, hero text styles must stay scoped to the hero only. They must never bleed into the article body.
- `MarkdownRenderer` and `.blog-content` are the source of truth for article readability. Do not override them with light text utilities unless the article body background is explicitly dark.
- Before shipping any blog, news, or article route, verify rendered contrast at the final content layer. Do not assume the parent background; check the exact container the text sits on.

## Workflow Rule For Future Agents
- If you touch any blog, news, article, markdown, or CMS route, inspect all inherited `text-white`, `prose`, and wrapper classes before finishing.
- If there is any ambiguity about the final background, default to dark text and prove the exception instead of assuming a dark surface.
- A white-on-white or low-contrast article body is a release-blocking bug, not a cosmetic issue.
