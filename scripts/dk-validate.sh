#!/bin/bash
# DK Agency Full Validator — 8-check suite
# Usage: npm run dk:validate
# Runs all dk-validator checks including those that need dev server.
# Static checks (1-5) always run. Server checks (6-8) skip if no dev server.

set -e

BRANCH=$(git branch --show-current)
COMMIT=$(git log -1 --format='%h %s')

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   DK VALIDATOR — Full 8-Check Suite           ║"
echo "║   Branch: $BRANCH"
echo "║   Commit: $COMMIT"
echo "╚════════════════════════════════════════════════╝"
echo ""

FAILED=0
PASS_COUNT=0
SKIP_COUNT=0

result() {
  local num="$1" name="$2" status="$3" detail="$4"
  if [ "$status" = "PASS" ]; then
    echo "  [$num] $name: ✅ PASS — $detail"
    PASS_COUNT=$((PASS_COUNT + 1))
  elif [ "$status" = "SKIP" ]; then
    echo "  [$num] $name: ⏭️  SKIP — $detail"
    SKIP_COUNT=$((SKIP_COUNT + 1))
  else
    echo "  [$num] $name: ❌ FAIL — $detail"
    FAILED=1
  fi
}

# Detect changed files
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null)
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null)
fi
NEW_COMPONENTS=$(echo "$CHANGED_FILES" | grep -E "components/.*\.tsx?$" || true)
NEW_API=$(echo "$CHANGED_FILES" | grep -E "app/api/.*route\.ts$" || true)

# --- 1. Build ---
echo "  [1/8] Building..."
if npm run build > /tmp/dk-build.log 2>&1; then
  result 1 "Build" "PASS" "0 errors"
else
  result 1 "Build" "FAIL" "$(tail -3 /tmp/dk-build.log | tr '\n' ' ')"
fi

# --- 2. Lint (changed files only — L-016 repo debt ≠ task fail) ---
echo "  [2/8] Linting changed files..."
LINT_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(ts|tsx)$" || true)
if [ -n "$LINT_FILES" ]; then
  if echo "$LINT_FILES" | xargs npx eslint --no-error-on-unmatched-pattern > /tmp/dk-lint.log 2>&1; then
    result 2 "Lint" "PASS" "0 new errors in changed files"
  else
    NEW_ERRORS=$(grep -c "error" /tmp/dk-lint.log 2>/dev/null || echo "?")
    result 2 "Lint" "FAIL" "$NEW_ERRORS errors — $(tail -3 /tmp/dk-lint.log | tr '\n' ' ')"
  fi
else
  result 2 "Lint" "PASS" "no .ts/.tsx changes"
fi

# --- 3. Hardcoded i18n ---
echo "  [3/8] Scanning hardcoded i18n..."
if [ -n "$NEW_COMPONENTS" ]; then
  HITS=$(echo "$NEW_COMPONENTS" | xargs grep -lE "(Şikayət|Cavab|Müştəri|Yemək|Sertifikat|Hesabat)" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    result 3 "Hardcoded i18n" "FAIL" "$HITS"
  else
    result 3 "Hardcoded i18n" "PASS" "0 hits in changed components"
  fi
else
  result 3 "Hardcoded i18n" "PASS" "no component changes"
fi

# --- 4. Auth contract ---
echo "  [4/8] Checking auth contract..."
if [ -n "$NEW_API" ]; then
  BAD_AUTH=$(echo "$NEW_API" | xargs grep -nE "auth\.(id|plan|email|name)[^A-Za-z]" 2>/dev/null | grep -v "auth\.userId\|auth\.role\|auth\.email" || true)
  if [ -n "$BAD_AUTH" ]; then
    result 4 "Auth contract" "FAIL" "$BAD_AUTH"
  else
    result 4 "Auth contract" "PASS" "userId/role only"
  fi
else
  result 4 "Auth contract" "PASS" "no API changes"
fi

# --- 5. DB schema naming ---
echo "  [5/8] Checking DB schema naming..."
if [ -n "$NEW_API" ]; then
  BAD_DB=$(echo "$NEW_API" | xargs grep -nE "\.(input|output|provider)[^A-Za-z]" 2>/dev/null | grep -v "inputData\|outputData\|aiProvider\|tool_input\|provider_id\|providerName\|provider:" || true)
  if [ -n "$BAD_DB" ]; then
    result 5 "DB schema" "FAIL" "$BAD_DB"
  else
    result 5 "DB schema" "PASS" "correct suffixes"
  fi
else
  result 5 "DB schema" "PASS" "no API changes"
fi

# --- 6. Route smoke ---
echo "  [6/8] Route smoke test..."
DEV_RUNNING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
if [ "$DEV_RUNNING" = "000" ]; then
  result 6 "Route smoke" "SKIP" "dev server not running (start with npm run dev)"
else
  # Test a few core routes
  ROUTE_FAIL=0
  for route in "/" "/auth/login" "/ilanlar" "/b2b-panel"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${route}" 2>/dev/null || echo "000")
    if [ "$CODE" = "404" ] || [ "$CODE" = "500" ]; then
      echo "    $route → HTTP $CODE"
      ROUTE_FAIL=1
    fi
  done
  if [ $ROUTE_FAIL -eq 1 ]; then
    result 6 "Route smoke" "FAIL" "see routes above"
  else
    result 6 "Route smoke" "PASS" "core routes 200/307"
  fi
fi

# --- 7. API gating ---
echo "  [7/8] API gating smoke..."
if [ "$DEV_RUNNING" = "000" ]; then
  result 7 "API gating" "SKIP" "dev server not running"
else
  if [ -n "$NEW_API" ]; then
    GATING_FAIL=0
    for f in $NEW_API; do
      API_PATH=$(echo "$f" | sed -E 's|app(/api/.*)/route\.ts|\1|')
      if [ -n "$API_PATH" ]; then
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000${API_PATH}" \
          -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "000")
        if [ "$CODE" = "200" ]; then
          echo "    POST $API_PATH → HTTP 200 (no auth gating!)"
          GATING_FAIL=1
        fi
      fi
    done
    if [ $GATING_FAIL -eq 1 ]; then
      result 7 "API gating" "FAIL" "unprotected endpoints"
    else
      result 7 "API gating" "PASS" "all endpoints gated"
    fi
  else
    result 7 "API gating" "PASS" "no new API routes"
  fi
fi

# --- 8. Playwright ---
echo "  [8/8] Playwright tests..."
SPEC=$(echo "$CHANGED_FILES" | grep -E "e2e/.*\.spec\.ts$" || true)
if [ -n "$SPEC" ]; then
  if npx playwright test "$SPEC" --reporter=list > /tmp/dk-playwright.log 2>&1; then
    result 8 "Playwright" "PASS" "$(tail -3 /tmp/dk-playwright.log | tr '\n' ' ')"
  else
    result 8 "Playwright" "FAIL" "$(tail -5 /tmp/dk-playwright.log | tr '\n' ' ')"
  fi
else
  result 8 "Playwright" "SKIP" "no e2e spec in changed files"
fi

# --- Summary ---
echo ""
echo "────────────────────────────────────────────"
TOTAL=$((PASS_COUNT + SKIP_COUNT))
if [ $FAILED -eq 1 ]; then
  echo "  VERDICT: ❌ BLOCK ($PASS_COUNT passed, $SKIP_COUNT skipped)"
  echo "  Fix the FAIL items above, then re-run: npm run dk:validate"
  exit 1
else
  echo "  VERDICT: ✅ PASS ($PASS_COUNT passed, $SKIP_COUNT skipped)"
fi
echo ""
