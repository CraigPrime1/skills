#!/usr/bin/env bash
# Cursor beforeShellExecution / Claude Code PreToolUse wrapper.
# Fail-closed: missing python3 denies the command.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  msg='BLOCKED by agent-safety: python3 is required; fail-closed'
  printf '%s\n' "{\"permission\":\"deny\",\"agent_message\":\"$msg\",\"user_message\":\"$msg\"}"
  printf '%s\n' "$msg" >&2
  exit 2
fi
exec python3 "$DIR/agent-safety-hook.py"
