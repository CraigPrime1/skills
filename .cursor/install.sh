#!/usr/bin/env bash
set -euo pipefail

# Cloud Agent install step for mattpocock-skills.
# Idempotent: safe to run repeatedly and against a cached/partially prepared
# checkout. Keep it to durable, source-derived setup only.

cd "$(dirname "$0")/.."

# Repo tooling (changesets) installed exactly from the committed lockfile.
# This mirrors the Release workflow (.github/workflows/release.yml).
npm ci

# Claude Code CLI, so the documented manifest check from CLAUDE.md/AGENTS.md
# (`claude plugin validate . --strict`) is available to agents working here.
# Non-fatal: a transient network failure must not fail environment setup.
if ! command -v claude >/dev/null 2>&1 && [ ! -x "$HOME/.local/bin/claude" ]; then
  curl -fsSL https://claude.ai/install.sh | bash \
    || echo "warning: Claude Code CLI install failed; 'claude plugin validate' will be unavailable"
fi

# Make the native CLI discoverable in future (login) shells.
if ! grep -qs '.local/bin' "$HOME/.bashrc"; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi
