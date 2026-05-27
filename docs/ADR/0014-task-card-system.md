# ADR-0014: Task Card System for Work Tracking

## Status
Accepted

## Context
The project has multiple parallel workstreams (i18n, security, toolkit, AI, deploy).
Linear and Jira add external dependency and context-switching cost.
A file-based task system inside the repo keeps tasks co-located with code and visible in git history.

## Decision
All tasks tracked as individual Markdown files at `docs/tasks/TASK-XXXX.md`.
File name format: `TASK-` + four-digit zero-padded number.
Each card uses the template from `docs/TASK-CARD-TEMPLATE.md` (status, priority, description, acceptance criteria, linked files).
A pre-commit hook validates that any file path referenced in a TASK card exists in the repo.
152+ cards created as of May 2026.

## Consequences
**Positive:** Full traceability — task history is in git. No external tool dependency. Claude Code can read and update cards directly.
**Negative:** Card creation is manual with no automation. Searching across 150+ cards requires grep. No dependency graph or Gantt view.

## References
- `docs/tasks/` directory
- `docs/TASK-CARD-TEMPLATE.md`
- `docs/REPO-GOVERNANCE.md` (pre-commit hook spec)

## Date
2026-04-01
