---
name: agent-safety
description: Install cross-harness agent safety guardrails (Cursor Grok, Claude Code, Codex). Use when the user wants agent safety, git guardrails that work beyond Claude Code, to block dangerous shell commands, or to stop Cursor/Grok from git push/reset/clean.
---

Install **guardrails** that run in the environment, then write the prompt rail for harnesses with no hook.

A **guardrail** is a hook that classifies the agent's shell command *before* it runs and denies the dangerous ones. Cursor Grok (desktop and cloud) reads `.cursor/hooks.json`. Claude Code reads `.claude/settings.json`. Codex has no shell hook: it gets the AGENTS.md section only. Your own terminal is not hooked.

Read [POLICY.md](POLICY.md) for the blocked list. The classifier at [scripts/agent-safety-hook.py](scripts/agent-safety-hook.py) is the source of truth.

Do not install these hooks into a repo whose agents must `git push` (this skills repo's cloud agents, CI that pushes tags). Ask first.

## Process

### 1. Scope

Ask: **this project** (committed files under `.cursor/` and `.claude/`) or **this machine** (`~/.cursor/hooks.json`, `~/.claude/settings.json`)? Prefer project: Cursor cloud agents load project hooks and ignore `~/.cursor`.

Confirm push is blocked. Default yes. If they need agent-owned `git push`, stop; this skill is the wrong rail.

**Done when:** scope is project or user, and push-blocking is confirmed.

### 2. Copy the classifier

From this skill directory:

- Project Cursor: `.cursor/hooks/agent-safety.sh` and `.cursor/hooks/agent-safety-hook.py`
- Project Claude Code: `.claude/hooks/agent-safety.sh` and `.claude/hooks/agent-safety-hook.py`
- User-global: the same names under `~/.cursor/hooks/` and `~/.claude/hooks/`

Copy [scripts/agent-safety.sh](scripts/agent-safety.sh) and [scripts/agent-safety-hook.py](scripts/agent-safety-hook.py). `chmod +x` the `.sh`. Both harnesses share one classifier so the policy cannot drift.

**Done when:** the two files exist at the target path and the `.sh` is executable.

### 3. Wire the harness files

Merge, do not overwrite other hooks.

**Cursor** (Grok, cloud agents): merge [templates/cursor-hooks.json](templates/cursor-hooks.json) into `.cursor/hooks.json` (project) or `~/.cursor/hooks.json` (user). Project commands are `.cursor/hooks/agent-safety.sh`. User commands are `./hooks/agent-safety.sh` run from `~/.cursor`.

**Claude Code:** merge [templates/claude-settings.json](templates/claude-settings.json) into `.claude/settings.json` or `~/.claude/settings.json`. Keep the `$CLAUDE_PROJECT_DIR` form for project installs.

Skip a harness that is not present and say so. Always do step 4.

**Done when:** each present harness file lists the agent-safety command, and no pre-existing hook was dropped.

### 4. Write the prompt rail

Append [templates/AGENTS-SAFETY.md](templates/AGENTS-SAFETY.md) to `AGENTS.md` if it exists, else `CLAUDE.md`, else create `AGENTS.md` with that section. If the section is already there, leave it.

This is the whole rail for Codex.

**Done when:** one of those files carries the Agent safety section once.

### 5. Verify

Need `python3` on PATH. Fail-closed tests (exit 2):

```bash
echo '{"command":"git push origin main"}' | .cursor/hooks/agent-safety.sh
echo '{"command":"git -C /tmp push origin main"}' | .cursor/hooks/agent-safety.sh
echo '{"tool_input":{"command":"git reset --hard"}}' | .claude/hooks/agent-safety.sh
```

Allow test (exit 0):

```bash
echo '{"command":"git status"}' | .cursor/hooks/agent-safety.sh
```

**Done when:** the three denies exit 2, `git status` exits 0, and you have told the user which harnesses are wired.
