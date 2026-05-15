---
name: task-prompt-writer
description: Use when the user asks to write a Claude Code prompt for a new TASK.
             Generates a complete, copy-paste-ready prompt with specification,
             file layout, definition of done, and validator invocation.
disable-model-invocation: true
---

# DK Agency Task Prompt Template

Always produce a prompt with these 9 sections in order. Never skip.

## Section structure

### 1. ƏVVƏL TANIŞ OL (mandatory reading list)
Always include:
- CHANGELOG.md, DEVLOG.md, STATE.md, PROTECTED.md, CLAUDE-DESIGN.md
- `docs/LESSONS.md` (acı dərslər)
- Two existing similar components as pattern reference (e.g., yemek-xerci, pnl-simulator)
- `git log --oneline -10`

End with: "Bu xülasə olmadan kod yazma."

### 2. PROTECTED FILES
List untouchables: `lib/member-access.ts`, `lib/listingFieldConfig.ts`, `middleware.ts`, `.env*`

### 3. SCOPE (one paragraph + bullet list)
- What is built
- Tier (ŞAGIRD / KALFA / USTA)
- Slug + URL
- Out-of-scope (explicit)

### 4. FILE LAYOUT (every path absolute)
Use existing pattern. Never let agent guess paths.

### 5. CONFIG UPDATES
- `lib/marketing-tools-config.ts` (or relevant config)
- `app/dashboard/marketinq-ocagi/page.tsx` (4 dil entry)
- `app/dashboard/marketinq-ocagi/[slug]/page.tsx` (router entry)

### 6. i18n KEYS (full JSON, all 4 langs, no TODO)
Pattern A: `useTranslations('toolkit.<feature>')`. Full translations, no "..." placeholders.

### 7. KEÇMİŞ XƏTALAR (relevant lessons from docs/LESSONS.md)
Surface 3-5 relevant lessons. Make agent acknowledge each.

### 8. ADDIM-ADDIM EXECUTION (numbered)
1. Tanışlıq xülasəsi yaz (5-10 sətir) before any code
2. Branch
3. i18n keys
4. Components
5. API route (if needed)
6. Config updates
7. Playwright spec
8. Post-task checklist (see section 9)
9. Validator invocation
10. Commit + PR

### 9. POST-TASK CHECKLIST (execute, raw output required)
8-item Definition of Done from CLAUDE.md. Each ✅ or ❌ + raw output. NO "lazımdır" or "yazıldı, icra olunmadı".

End with: "After your checklist passes, request: 'Use the dk-validator subagent to verify TASK-XXXX.'"
