#!/bin/bash
# PreToolUse hook on Bash — blocks dangerous patterns.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block --no-verify
if echo "$CMD" | grep -qE "git (commit|push).*--no-verify"; then
  cat <<EOF
{
  "decision": "block",
  "reason": "BLOCKED: --no-verify violates DK Agency project rules. Fix the hook failure instead."
}
EOF
  exit 2
fi

# Block force push to main
if echo "$CMD" | grep -qE "git push.*-f.*main"; then
  cat <<EOF
{
  "decision": "block",
  "reason": "BLOCKED: force push to main is forbidden."
}
EOF
  exit 2
fi

# Block .env writes via shell
if echo "$CMD" | grep -qE "(echo|cat).*>.*\.env"; then
  cat <<EOF
{
  "decision": "block",
  "reason": "BLOCKED: cannot write to .env via shell. Use Hostinger panel."
}
EOF
  exit 2
fi

exit 0
