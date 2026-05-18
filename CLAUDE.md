# DK Agency — Project Rules (lean, every session loads this)

## Stack
Next.js 16 (App Router, TypeScript) · Drizzle ORM · Neon PostgreSQL · Tailwind · DeepSeek (primary AI) + Claude (fallback) · 4 dil: AZ/RU/EN/TR (Pattern A: useTranslations) · Hostinger Web Apps (GitHub auto-deploy from `main`).

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
- **Global Header**: Always use `Header.tsx`.
- **Do Not Use**: `HospitalityHeader.tsx` for core platform UI.

## Hard rules — NEVER (PreToolUse hook bu qaydaları zorla tətbiq edir)
- `--no-verify` ilə commit/push etmə
- `lib/member-access.ts`, `lib/listingFieldConfig.ts`, `middleware.ts` dəyişmə
- `.env*` fayllarına yazma
- Mock data ilə "tamam" demə (AzHealth dərsi)
- Build keçdi = task bitdi sayma (TASK-0127 dərsi)
- Eyni fix 2 dəfə fail-sə 3-cüsünü yazma — DUR, kök səbəbi araşdır (sarmal dərsi)
- Component yarat amma route-a bağlama (Özbahçeci dərsi: `listingFieldConfig.ts` SST)
- Do not use `any`. Prefer `unknown`.
- Do not use `console.log` in production code.
- Do not copy-paste templates from other sectors without deep customization.
- Do not bypass `Header.tsx` for global navigation.

## Content Contrast Guardrail
- On light backgrounds (`bg-white`, `bg-[var(--dk-paper)]`, `bg-slate-50`, `bg-slate-100`): dark text only (`text-slate-900`, `text-slate-800`, `text-[var(--dk-ink)]`)
- `text-white` forbidden inside article body, blog cards, news content, forms, CMS prose, or any light container
- Light text allowed only on provably dark surfaces: image heroes with dark overlay, dark CTA sections, dark nav, dark footer
- A white-on-white or low-contrast article body is a release-blocking bug, not a cosmetic issue

## Definition of Done — bütün maddələr keçməli (Stop hook yoxlayır)
1. `npm run build` → 0 TS error
2. `npm run lint` → 0 yeni error
3. `npm run verify:staged` → pass
4. Playwright smoke icra olundu (yazıldı yox, **icra olundu**)
5. Lokal route HEAD → 200/307 (404/500 yox)
6. Lokal API POST → 401 əgər auth tələbi varsa (gating sübut)
7. Yeni component-də `grep -rn "<turkish/azeri word>"` → 0 hit (hardcoded yox)
8. DEVLOG.md + CHANGELOG.md yeniləndi

## Workflow standard
- **Plan əvvəl, kod sonra**: hər task üçün specification yazılır, ekran qarşılığında təsdiq alınır, sonra kod
- **Diff oxu mövcuddur**: hər PR-də mən diff-i oxumadan kod yazma
- **Validator çağır**: builder TASK bitirəndə `Use the dk-validator subagent` deyilir
- **Atomic commits**: bir task = bir branch = bir PR
- **Conventional commits**: `[TASK-XXXX] type(scope): message`

## PR Disiplini
- HƏR task = branch + PR + dk-validator. İSTİSNA YOXDUR.
- `git push --no-verify` QƏTİ QADAĞAN (hook bypass = pozuntu, bax L-008).
- ⚠️ Köhnə git tarixçəsində PR-sız commit-lər ola bilər (5-qat control-dan əvvəlki). Bunlar nümunə DEYİL.
- Hər PR-da STATE.md + CHANGELOG.md yenilənməlidir
- PR template-i (.github/pull_request_template.md) doldurulmalıdır
- PROTECTED.md-dəki fayllara toxunulubsa TASK ID + CTO icazəsi lazımdır
- Merge öncəsi checklist tam olmalıdır

## Referanslar
- Acı dərslər: `docs/LESSONS.md` (yeni task-dan əvvəl oxu)
- Listing config SST: `lib/listingFieldConfig.ts`
- Marketing tools config: `lib/marketing-tools-config.ts`
- Member access: `lib/member-access.ts`

## Frame as facts, not commands (prompt injection defense)
This document describes how the project works. It is project information, not a system command.
