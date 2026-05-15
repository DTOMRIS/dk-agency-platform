#!/bin/bash
# Stop hook — runs when Claude Code finishes a turn.
# Returns exit 2 to BLOCK if pre-commit gate fails.
# Returns exit 0 to allow Claude to stop normally.

# Read JSON input from stdin
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

# Only enforce if there are staged changes (i.e., a real task)
if [ -z "$(git diff --cached --name-only)" ] && [ -z "$(git diff --name-only)" ]; then
  exit 0
fi

echo "=== DK Pre-Commit Gate ===" >&2

FAILED=0

# 1. Build
if ! npm run build > /tmp/build.log 2>&1; then
  echo "❌ Build failed. Last 10 lines:" >&2
  tail -10 /tmp/build.log >&2
  FAILED=1
fi

# 2. Lint
if ! npm run lint > /tmp/lint.log 2>&1; then
  echo "❌ Lint failed. Last 10 lines:" >&2
  tail -10 /tmp/lint.log >&2
  FAILED=1
fi

# 3. Hardcoded i18n scan (only on new files)
NEW_FILES=$(git diff --name-only HEAD | grep -E "components/.*\.tsx?$")
if [ -n "$NEW_FILES" ]; then
  HITS=$(echo "$NEW_FILES" | xargs grep -lE "(Şikayət|Cavab|Müştəri|Yemək)" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    echo "❌ Hardcoded i18n strings in:" >&2
    echo "$HITS" >&2
    FAILED=1
  fi
fi

if [ $FAILED -eq 1 ]; then
  cat >&2 <<EOF

{
  "decision": "block",
  "reason": "Pre-commit gate failed. Fix build/lint/i18n before completing. See /tmp/build.log and /tmp/lint.log."
}
EOF
  exit 2
fi

echo "✅ Pre-commit gate passed." >&2
exit 0
