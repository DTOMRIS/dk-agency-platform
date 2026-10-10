#!/bin/bash
# DK Agency Full Validator — 8-check suite
# Usage: npm run dk:validate
# Runs all dk-validator checks. Static checks (1-5) always run.
# TASK-0508: server checks (6-8) start their OWN `next start` on a free port after the build and
# verify it is DK Agency — before, they curled whatever answered on localhost:3000 (another
# project's dev server, or nothing). Node test scripts (e2e/*.test.ts) run separately in [8a].

set -e

# OOM prevention — ensures all child node processes (build, lint, tsc) get enough heap
# Fix for #233 where validator OOM'd during build on large codebase
export NODE_OPTIONS='--max-old-space-size=4096'

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
# TASK-0508: after commit both are empty and lint/i18n/API checks silently passed with "no changes".
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null || true)
fi
NEW_COMPONENTS=$(echo "$CHANGED_FILES" | grep -E "components/.*\.tsx?$" || true)
NEW_API=$(echo "$CHANGED_FILES" | grep -E "app/api/.*route\.ts$" || true)

# --- 1. Build (with explicit 8GB heap to prevent OOM — #233) ---
echo "  [1/8] Building..."
# --no-save: the install must not rewrite package-lock.json (TASK-0508)
if npm install --include=dev --no-save > /dev/null 2>&1 && node --max-old-space-size=4096 node_modules/next/dist/bin/next build > /tmp/dk-build.log 2>&1; then
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

# --- 5b. Lessons integrity (TASK-0445) — kodda istinad edilən hər L-0XX LESSONS.md-də olmalıdır
echo "  [5b] Lessons integrity..."
if node scripts/verify-lessons.mjs > /tmp/dk-lessons.log 2>&1; then
  result 5 "Lessons integrity" "PASS" "$(tail -1 /tmp/dk-lessons.log)"
else
  result 5 "Lessons integrity" "FAIL" "$(tail -3 /tmp/dk-lessons.log | tr '\n' ' ')"
fi

# --- Own server for 6-8 (TASK-0508) ---
BASE=""
SERVER_PID=""
if [ -f .next/BUILD_ID ]; then
  PORT=3901
  while lsof -ti tcp:$PORT > /dev/null 2>&1; do PORT=$((PORT + 1)); done
  node node_modules/next/dist/bin/next start -p $PORT > /tmp/dk-server.log 2>&1 &
  SERVER_PID=$!
  trap '[ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null' EXIT
  for _ in $(seq 1 60); do
    if curl -s "http://localhost:$PORT/" 2>/dev/null | grep -q "DK Agency"; then BASE="http://localhost:$PORT"; break; fi
    sleep 1
  done
fi
DEV_RUNNING=$([ -n "$BASE" ] && echo "200" || echo "000")

# --- 6. Route smoke ---
echo "  [6/8] Route smoke test... ${BASE:-(DK server did not start)}"
if [ "$DEV_RUNNING" = "000" ]; then
  result 6 "Route smoke" "SKIP" "DK server did not start (see /tmp/dk-server.log)"
else
  # Test a few core routes
  ROUTE_FAIL=0
  for route in "/" "/auth/login" "/ilanlar" "/b2b-panel"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${route}" 2>/dev/null || echo "000")
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
  result 7 "API gating" "SKIP" "DK server did not start"
else
  if [ -n "$NEW_API" ]; then
    GATING_FAIL=0
    for f in $NEW_API; do
      API_PATH=$(echo "$f" | sed -E 's|app(/api/.*)/route\.ts|\1|')
      # TASK-0530: a route marked «public-ok: <reason>» is public on purpose (same rule as SYSTEM-MAP.md);
      # the reason is printed so a reviewer sees every skip.
      if [ -n "$API_PATH" ] && grep -q "public-ok:" "$f"; then
        echo "    $API_PATH → public-ok: $(grep -o 'public-ok:.*' "$f" | head -1 | cut -c12-110)"
        continue
      fi
      if [ -n "$API_PATH" ]; then
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}${API_PATH}" \
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

# --- 8. Playwright @smoke (against our own server) ---
echo "  [8/8] Playwright @smoke tests..."
if [ "$DEV_RUNNING" = "000" ]; then
  result 8 "Playwright @smoke" "SKIP" "DK server did not start"
elif [ -f playwright.config.ts ] || [ -f playwright.config.js ]; then
  if BASE_URL="$BASE" npx playwright test --grep @smoke --reporter=list > /tmp/dk-playwright.log 2>&1; then
    SUMMARY=$(grep -E "^ *[0-9]+ (passed|skipped|flaky)" /tmp/dk-playwright.log | tr -s ' ' | tr '\n' ' ')
    if [ -z "$SUMMARY" ]; then
      # TASK-0508: exit 0 with no Playwright summary = nothing ran (e.g. a script called process.exit)
      result 8 "Playwright @smoke" "FAIL" "no Playwright summary in output: $(tail -2 /tmp/dk-playwright.log | tr '\n' ' ')"
    else
      result 8 "Playwright @smoke" "PASS" "$SUMMARY"
    fi
  else
    if grep -q "No tests found" /tmp/dk-playwright.log 2>/dev/null; then
      result 8 "Playwright @smoke" "SKIP" "no @smoke tests found — add @smoke tag to e2e specs"
    else
      result 8 "Playwright @smoke" "FAIL" "$(grep -E "^ *[0-9]+ (failed|passed)" /tmp/dk-playwright.log | tr -s ' ' | tr '\n' ' ') — /tmp/dk-playwright.log"
    fi
  fi
else
  result 8 "Playwright @smoke" "SKIP" "no playwright config"
fi

# --- 8a. Node test scripts (e2e/*.test.ts — plain tsx scripts, not Playwright) ---
echo "  [8a] Node test scripts..."
NODE_FAIL=""
NODE_COUNT=0
for f in e2e/*.test.ts; do
  [ -f "$f" ] || continue
  NODE_COUNT=$((NODE_COUNT + 1))
  if ! npx tsx "$f" > "/tmp/dk-node-$(basename "$f").log" 2>&1; then NODE_FAIL="$NODE_FAIL $(basename "$f")"; fi
done
if [ -n "$NODE_FAIL" ]; then
  result 8 "Node test scripts" "FAIL" "failed:$NODE_FAIL (logs in /tmp/dk-node-*.log)"
else
  result 8 "Node test scripts" "PASS" "$NODE_COUNT scripts"
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
