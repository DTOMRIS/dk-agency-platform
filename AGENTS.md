# AGENTS.md — DK Agency (cross-tool agent instructions)

> Open [AGENTS.md](https://agentskills.io) standard. This file lets any agent (Codex,
> Claude Code, others) load the same project rules. It is a **thin mirror** — the
> canonical sources are `CLAUDE.md`, `.claude/memory/CLAUDE-BRAIN.md`, and `docs/LESSONS.md`.
> Read those; do not duplicate rules here (single source of truth, no drift).

## Read first (in order)
1. `CLAUDE.md` — project rules, design system, Definition of Done.
2. `.claude/memory/CLAUDE-BRAIN.md` — distilled invariants, deploy reality, recurring traps.
3. `docs/LESSONS.md` — full hard-won lessons (L-001 … L-038).
4. `docs/STATE.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md`, latest `docs/SESSION-JOURNAL.md` entries.

## Non-negotiables (full detail in CLAUDE.md / brain)
- Every task = branch + PR + dk-validator. **Never `git push --no-verify`.**
- PROTECTED files need approval: `lib/member-access.ts`, `lib/listingFieldConfig.ts`,
  `lib/marketing-tools-config.ts`, `middleware.ts`, `Header.tsx`, `Footer.tsx`, `app/layout.tsx`,
  `next.config.ts`, `package.json`, `tailwind.config.ts`. Never write `.env*` (Hostinger panel only).
- `unknown` not `any`. No `console.log` in production. UI default language **AZ**.
- i18n Pattern A (`useTranslations`) only. Light bg ⇒ dark text (WCAG AA on interactive elements).
- New `app/[locale]/X` route ⇒ also add root mirror `app/X` (L-038) or the prefix-less az URL 404s.
- AI insight: reuse `getToolkitInsight` / `TOOL_PROMPTS`; do not add new API routes (L-009).
- merge ≠ live: Hostinger must rebuild + **restart**. 503 = resource/OOM, not code.
- AQTA SST: «AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.»

## Commands
- Build: `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build`
- Lint: `npm run lint` · Verify staged: `npm run verify:staged` · Full validate: `npm run dk:validate`
- Install git hooks: `npm run hooks:install`

## Skills (`.claude/skills/`, agentskills.io format)
Reference (auto): `dk-deploy-reality`, `dk-i18n-pattern`, `dk-design-system`.
Task (`/name`): `dk-new-tool`, `dk-release`, `dk-blog-publish`, `task-prompt-writer`.

## Commit format
`[TASK-XXXX] type(scope): message` — a matching `docs/tasks/TASK-XXXX.md` card must exist.
