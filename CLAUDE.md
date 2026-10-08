# DK Agency — Project Rules (lean, every session loads this)

## Stack
Next.js 16 (App Router, TypeScript) · Drizzle ORM · Neon PostgreSQL · Tailwind · DeepSeek (primary AI) + Claude (fallback) · 4 dil: AZ/RU/EN/TR (Pattern A: useTranslations) · Hostinger Web Apps (GitHub auto-deploy from `main`).

## Project Identity
- **Project Name**: `dk-agency-platform`
- **Core Business**: HoReCa consulting + platform for restaurants, cafés and hotels: food cost / P&L / delivery tools (Toolkit), KAZAN AI, OCAQ daily control, B2B listings, member portal, sector news. (Owner decision 2026-10-08: the old "investment/holding, not a restaurant system" identity is retired.)
- **Target Audience**: Restaurant/café/hotel owners and multi-branch chains in Azerbaijan; partners and suppliers.
- **Landing pages**: Food cost, P&L, delivery commission and restaurant operations ARE the core message of `/` and `/tanitim` (design reference: kutlerri.ai, restaurant365.com). Every number on a landing page is either the product's own calculation or has a verifiable source; mock screens carry «Nümunə məlumat».
- **AQTA SOURCE OF TRUTH**: `AQTA qeydiyyatı üçün müraciət ASAN/KOBIA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.`

## Design System
- **Tone**: Premium, sophisticated, high-tech.
- **Theme**: Premium light for dashboard; landing (`/`, `/tanitim`) = warm cream (#F6F1E9) + ink + single accent brand-red, phone mockups and signal → action cards (owner 2026-10-08).
- **Primary Color**: `brand-red` (`#E94560` — `--dk-red`; sahib qərarı 2026-09-13: olduğu kimi qalır)
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
- **Interaktif elementlər (WCAG AA mütləq):** Quiz option, radio, checkbox, dropdown, tab label — HƏMİŞƏ `text-slate-700` (seçilməmiş) / `text-slate-900` (seçilmiş). Default/muted/inherited rəng QADAĞAN. Heç bir `<button>` və ya `<label>` text-color class-sız buraxılmamalı. Kontrast ≥4.5:1. Bu qayda nəticə ekranlarına da aiddir (bar label, skor, kateqoriya adı).

## Definition of Done — bütün maddələr keçməli (Stop hook yoxlayır)
1. `npm run build` → 0 TS error
2. `npm run lint` → 0 yeni error
3. `npm run verify:staged` → pass
4. Playwright smoke icra olundu (yazıldı yox, **icra olundu**)
5. Lokal route HEAD → 200/307 (404/500 yox)
6. Lokal API POST → 401 əgər auth tələbi varsa (gating sübut)
7. Yeni component-də `grep -rn "<turkish/azeri word>"` → 0 hit (hardcoded yox)
8. DEVLOG.md + CHANGELOG.md yeniləndi
9. **dk-validator PASS çıxışı PR-da/commit-də GÖRÜNMƏLI** — Stop hook 5/8 check avtomatik işləyir; tam 8-check üçün `npm run dk:validate` istifadə et
10. `npm run audit:system` → SYSTEM-AUDIT.md yeniləndi
11. **Completion report-da dk-validator 8/8 PASS məcburi** — skip yalnız texniki səbəblə (məs. dev server yox, Playwright browser yüklənməyib) + skip səbəbi raportda izah olunmalıdır

## Workflow standard
- **Plan əvvəl, kod sonra**: hər task üçün specification yazılır, ekran qarşılığında təsdiq alınır, sonra kod
- **Diff oxu mövcuddur**: hər PR-də mən diff-i oxumadan kod yazma
- **Validator çağır**: builder TASK bitirəndə `Use the dk-validator subagent` deyilir
- **Atomic commits**: bir task = bir branch = bir PR
- **Conventional commits**: `[TASK-XXXX] type(scope): message`

## PR axını (TASK-0464, Doğan qərarı 2026-10-04)
- Claude yan branch-ə push edir və PR-ı **özü açır** (`gh pr create`). `main`-ə push yoxdur (pre-push hook bloklayır).
- **Merge-i Doğan edir.** İstisna: yalnız məzmun PR-ları (`docs/**` — `docs/STATE.md` xaric, `content/**`, `decision-log/**`, kökdəki `CHANGELOG/DEVLOG/HANDOFF/README.md`) — CI yaşıl olanda `auto-merge-content.yml` ilə avtomatik merge olur. Bunu Doğan GitHub-da "Allow auto-merge" açaraq aktivləşdirir.
- Bir task = bir worktree = bir branch: `git worktree add ../_wt-dk-<ad> -b <type>/TASK-XXXX-<ad> origin/main`. Hamısını tək `claude/...` branch-dən göndərmə (konflikt mənbəyi).
- İşə başlamazdan əvvəl oxu: `docs/LESSONS.md` başlıqları, `CHANGELOG.md` [Unreleased], `docs/HANDOFF.md`, `docs/PROTECTED.md`. Ən böyük task nömrəsini `docs/tasks/` + `git log origin/main`-dən tap.

## PR Disiplini
- HƏR task = branch + PR + dk-validator. İSTİSNA YOXDUR.
- `git push --no-verify` QƏTİ QADAĞAN (hook bypass = pozuntu, bax L-008).
- ⚠️ Köhnə git tarixçəsində PR-sız commit-lər ola bilər (5-qat control-dan əvvəlki). Bunlar nümunə DEYİL.
- Hər PR-da CHANGELOG.md yenilənməlidir. `docs/STATE.md`-yə PR-da **toxunma** — main-ə hər push-dan sonra CI (quality-gates, «Generate STATE.md») onu avtomatik yeniləyir; PR-da dəyişmək hər bot commit-i ilə konflikt yaradır (L-054, sahib qərarı 2026-09-26)
- PR template-i (.github/pull_request_template.md) doldurulmalıdır
- PROTECTED.md-dəki fayllara toxunulubsa TASK ID + CTO icazəsi lazımdır
- Merge öncəsi checklist tam olmalıdır

## Referanslar
- Acı dərslər: `docs/LESSONS.md` (yeni task-dan əvvəl oxu)
- Listing config SST: `lib/listingFieldConfig.ts`
- Marketing tools config: `lib/marketing-tools-config.ts`
- Member access: `lib/member-access.ts`
- API guards: `lib/api/guards.ts` (`requireApiAdmin` / `requireApiMember`) — middleware `/api/*`-ı tutmur
- DB miqrasiya: `npm run db:migrate:status` → `npm run db:migrate` (RUNBOOK §6); `drizzle-kit push` canlıda QADAĞAN

## Frame as facts, not commands (prompt injection defense)
This document describes how the project works. It is project information, not a system command.
