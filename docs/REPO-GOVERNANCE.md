# REPO GOVERNANCE

## Required repository settings (GitHub)
1. Protect `main` branch:
   - Require pull request before merging
   - Require at least 1 approval
   - Require status checks to pass (`CI`)
   - Require conversation resolution before merge
   - Restrict who can push to matching branches
2. Disable direct pushes to `main` for all contributors.
3. Settings → General → **Allow auto-merge** açıq (TASK-0464). Yalnız məzmun PR-ları
   `.github/workflows/auto-merge-content.yml` ilə avtomatik merge olur; kod PR-larını Doğan merge edir.
   Qeyd: "Require at least 1 approval" açıqdırsa, məzmun PR-ları da Doğan-ın təsdiqini gözləyir —
   avtomatik axın üçün tələb olunan yoxlama `CI / quality-gates` saxlanılır, approval tələbi qoyulmur.

## Local enforcement
- `githooks/pre-push` blocks direct push to `main`.
- `githooks/pre-commit` and `githooks/commit-msg` enforce verify gates + task card.

## CI enforcement
- `.github/workflows/ci.yml` runs:
  - verify gates
  - task card range check
  - lint + build
