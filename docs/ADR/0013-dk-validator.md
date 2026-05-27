# ADR-0013: DK Validator Agent as Pre-Merge Quality Gate

## Status
Accepted

## Context
Recurring regressions (navigation buttons disappearing, untranslated keys, broken mobile layout)
were reaching production despite manual review. A systematic check was needed before every merge.

## Decision
Create `.claude/agents/dk-validator.md` as an 8-check quality gate run before merge:
1. Build passes (`npm run build` zero errors).
2. No hardcoded strings in new components (Pattern C violation).
3. All four locale files contain new keys.
4. Navigation components contain required elements.
5. No `any` types introduced.
6. No `console.log` left in committed files.
7. Mobile touch targets meet 44px minimum.
8. Protected files are unmodified.

## Consequences
**Positive:** Catches regressions before they reach production. Documents the check list explicitly. Reduces cognitive load on reviewer.
**Negative:** The validator misses nested i18n key issues (see incident L-028) where a key exists in the file but points to an empty object rather than a string. Manual check still required for deep key structures.

## References
- `.claude/agents/dk-validator.md`
- `docs/LESSONS.md` (L-028)
- `scripts/verify-protected.sh`

## Date
2026-05-15
