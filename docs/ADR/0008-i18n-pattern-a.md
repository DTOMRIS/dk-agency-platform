# ADR-0008: i18n Pattern Hierarchy

## Status
Accepted

## Context
During the i18n audit (May 2026), three translation patterns were found coexisting in the codebase.
Pattern A uses `useTranslations` from next-intl. Pattern B uses inline `Record<string, string>` objects.
Pattern C is hardcoded strings with no translation support.
Inconsistency caused the L-028 incident (untranslated keys in production for RU locale).

## Decision
Pattern A (`useTranslations` hook) is mandatory for all new components.
Pattern B (inline Record) is legitimate only for Footer and Header where it was already established and refactoring would require a large surface change.
Pattern C (hardcoded strings) is forbidden. Any hardcoded UI text found in review must be extracted to `messages/*.json` before merge.

## Consequences
**Positive:** New code is consistently translatable. Lint rule can enforce Pattern C detection.
**Negative:** Pattern B legacy code remains in Footer/Header. Mixed patterns increase onboarding friction for new contributors.

## References
- `docs/I18N-AUDIT.md`
- `docs/CODING-STANDARDS.md` (i18n section)
- TASK-L028

## Date
2026-05-08
