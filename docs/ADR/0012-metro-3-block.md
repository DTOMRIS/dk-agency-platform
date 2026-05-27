# ADR-0012: Metro 3-Block Tool Description Format

## Status
Accepted

## Context
The 21 toolkit tools each need a description displayed in the tool card and onboarding flow.
Early descriptions were marketing-heavy and inconsistent in length.
Users reported confusion about what a tool actually does versus what it promises.

## Decision
All tool descriptions follow the Metro 3-Block format with three labeled lines:
"What we do" — one factual sentence, max 15 words, derived from source code behavior.
"What you need" — required inputs or preconditions.
"Who it is for" — the specific role or situation this tool addresses.
Marketing language and superlatives are forbidden. Content must be verifiable against the actual tool implementation.

## Consequences
**Positive:** Consistent scannable format across all 21 tools. Factual grounding reduces support questions about tool scope. Easy to audit for accuracy.
**Negative:** Format is rigid — tools with complex inputs may not fit cleanly into three lines.

## References
- `docs/BRAND-GUIDE.md` (tool card spec)
- `components/toolkit/ToolCard.tsx`
- `messages/az.json` (tool description keys)

## Date
2026-05-27
