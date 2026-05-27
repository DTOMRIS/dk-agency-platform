# ADR-0015: Claude Code Auto-Approve Mode

## Status
Accepted

## Context
Interactive Claude Code sessions with per-action confirmation interrupts flow for routine file edits.
The team operates at a pace where confirmation dialogs for read/write operations add meaningful overhead.
Protected files and destructive operations still require explicit gates.

## Decision
Enable auto-approve mode via `.claude/settings.json` with `autoApprove: true` for read, write, and edit operations.
Bash commands that match destructive patterns (`rm -rf`, `DROP TABLE`, `.env` writes) are still blocked by `pre-bash.sh` hook and require manual override.
EXECUTION RULES pattern (defined in `docs/CODING-STANDARDS.md`) specifies which operation classes are auto-approved and which are always gated.

## Consequences
**Positive:** Approximately 10x velocity improvement for routine coding sessions. Reduces context-switching from confirmation dialogs during multi-file refactors.
**Negative:** Accidental file deletion risk is real if a generated command is incorrect. Mitigated by pre-bash hook blocking destructive patterns and pre-edit hook protecting listed files.

## References
- `.claude/settings.json`
- `scripts/pre-bash.sh`
- `scripts/pre-edit.sh`
- `docs/CODING-STANDARDS.md` (EXECUTION RULES section)

## Date
2026-05-27
