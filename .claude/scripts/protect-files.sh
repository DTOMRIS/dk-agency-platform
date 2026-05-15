#!/bin/bash
# PreToolUse hook on Write/Edit — blocks edits to protected files.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED=(
  "lib/member-access.ts"
  "lib/listingFieldConfig.ts"
  "middleware.ts"
)

for p in "${PROTECTED[@]}"; do
  if echo "$FILE" | grep -q "$p"; then
    cat <<EOF
{
  "decision": "block",
  "reason": "BLOCKED: $p is a protected file. If a change is truly needed, surface this to Doğan first."
}
EOF
    exit 2
  fi
done

# Block .env writes
if echo "$FILE" | grep -qE "\.env(\..*)?$"; then
  cat <<EOF
{
  "decision": "block",
  "reason": "BLOCKED: .env files must be edited via Hostinger panel."
}
EOF
  exit 2
fi

exit 0
