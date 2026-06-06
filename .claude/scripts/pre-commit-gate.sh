#!/bin/bash
# Stop hook — runs when Claude Code finishes a turn.
# Returns exit 2 to BLOCK if pre-commit gate fails.
# Returns exit 0 to allow Claude to stop normally.
# Covers dk-validator checks 1-5 (static checks that need no dev server).
# Checks 6-8 (route smoke, API gating, Playwright) require dev server → manual dk-validate.sh.

INPUT=$(cat)

# If this is an already-triggered stop hook, allow it through
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

# Only enforce on feature branches
BRANCH=$(git branch --show-current)
case "$BRANCH" in
  feat/*|fix/*|chore/*) ;;
  *) exit 0 ;;
esac

# Only enforce if there are staged or unstaged changes
if [ -z "$(git diff --cached --name-only)" ] && [ -z "$(git diff --name-only)" ]; then
  exit 0
fi

echo "" >&2
echo "╔══════════════════════════════════════╗" >&2
echo "║   DK VALIDATOR GATE (5/8 checks)    ║" >&2
echo "╚══════════════════════════════════════╝" >&2
echo "" >&2

FAILED=0
RESULTS=""

# Helper: append result row
add_result() {
  local num="$1" name="$2" status="$3" detail="$4"
  RESULTS="${RESULTS}| ${num} | ${name} | ${status} | ${detail} |\n"
}

# --- Check 1: Build ---
echo "  [1/5] Build..." >&2
if NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build > /tmp/dk-build.log 2>&1; then
  add_result 1 "Build" "PASS" "0 errors"
else
  add_result 1 "Build" "FAIL" "$(tail -3 /tmp/dk-build.log | tr '\n' ' ')"
  FAILED=1
fi

# --- Check 2: Lint (changed files only — L-016 repo debt ≠ task fail) ---
echo "  [2/5] Lint..." >&2
LINT_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E "\.(ts|tsx)$")
if [ -z "$LINT_FILES" ]; then
  LINT_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E "\.(ts|tsx)$")
fi
if [ -n "$LINT_FILES" ]; then
  if echo "$LINT_FILES" | xargs npx eslint --no-error-on-unmatched-pattern > /tmp/dk-lint.log 2>&1; then
    add_result 2 "Lint" "PASS" "0 new errors"
  else
    LINT_DETAIL=$(tail -5 /tmp/dk-lint.log | tr '\n' ' ')
    add_result 2 "Lint" "FAIL" "$LINT_DETAIL"
    FAILED=1
  fi
else
  add_result 2 "Lint" "PASS" "no .ts/.tsx changes"
fi

# --- Check 3: Hardcoded i18n scan ---
echo "  [3/5] Hardcoded i18n..." >&2
NEW_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E "components/.*\.tsx?$")
if [ -z "$NEW_FILES" ]; then
  NEW_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E "components/.*\.tsx?$")
fi
I18N_FAIL=0
if [ -n "$NEW_FILES" ]; then
  HITS=$(echo "$NEW_FILES" | xargs grep -lE "(Şikayət|Cavab|Müştəri|Yemək|Sertifikat|Hesabat)" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    add_result 3 "Hardcoded i18n" "FAIL" "$HITS"
    I18N_FAIL=1
    FAILED=1
  fi
fi
if [ $I18N_FAIL -eq 0 ]; then
  add_result 3 "Hardcoded i18n" "PASS" "0 hits"
fi

# --- Check 4: Auth contract (dk-validator #4) ---
echo "  [4/5] Auth contract..." >&2
NEW_API=$(git diff --name-only HEAD 2>/dev/null | grep -E "app/api/.*route\.ts$")
if [ -z "$NEW_API" ]; then
  NEW_API=$(git diff --cached --name-only 2>/dev/null | grep -E "app/api/.*route\.ts$")
fi
AUTH_FAIL=0
if [ -n "$NEW_API" ]; then
  BAD_AUTH=$(echo "$NEW_API" | xargs grep -nE "auth\.(id|plan|email|name)[^A-Za-z]" 2>/dev/null | grep -v "auth\.userId\|auth\.role\|auth\.email" || true)
  if [ -n "$BAD_AUTH" ]; then
    add_result 4 "Auth contract" "FAIL" "$(echo "$BAD_AUTH" | head -3 | tr '\n' ' ')"
    AUTH_FAIL=1
    FAILED=1
  fi
fi
if [ $AUTH_FAIL -eq 0 ]; then
  add_result 4 "Auth contract" "PASS" "userId/role only"
fi

# --- Check 5: DB schema naming (dk-validator #5) ---
echo "  [5/5] DB schema naming..." >&2
DB_FAIL=0
if [ -n "$NEW_API" ]; then
  BAD_DB=$(echo "$NEW_API" | xargs grep -nE "\.(input|output|provider)[^A-Za-z]" 2>/dev/null | grep -v "inputData\|outputData\|aiProvider\|tool_input\|provider_id\|providerName\|provider:" || true)
  if [ -n "$BAD_DB" ]; then
    add_result 5 "DB schema naming" "FAIL" "$(echo "$BAD_DB" | head -3 | tr '\n' ' ')"
    DB_FAIL=1
    FAILED=1
  fi
fi
if [ $DB_FAIL -eq 0 ]; then
  add_result 5 "DB schema naming" "PASS" "correct suffixes"
fi

# --- Print report ---
echo "" >&2
echo "┌────┬──────────────────┬────────┬─────────────────────────────────┐" >&2
echo "│ #  │ Check            │ Result │ Detail                          │" >&2
echo "├────┼──────────────────┼────────┼─────────────────────────────────┤" >&2
echo -e "$RESULTS" | while IFS= read -r line; do
  [ -n "$line" ] && echo "  $line" >&2
done
echo "└────┴──────────────────┴────────┴─────────────────────────────────┘" >&2
echo "" >&2

if [ $FAILED -eq 1 ]; then
  echo "  Verdict: BLOCK — fix issues above before completing." >&2
  echo "" >&2
  cat >&2 <<EOF
{
  "decision": "block",
  "reason": "DK Validator gate FAILED. See check results above. Fix and retry."
}
EOF
  exit 2
fi

echo "  Verdict: PASS (5/5 static checks)" >&2
echo "  Note: Run 'npm run dk:validate' for full 8-check (needs dev server)." >&2
echo "" >&2
exit 0
