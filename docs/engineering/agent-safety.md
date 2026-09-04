## What it does

`agent-safety` installs **guardrails** that stop an [agent](https://www.aihero.dev/ai-coding-dictionary/agent) at the shell tool: `git push`, `git reset --hard`, force-clean, piping a download into bash, and a handful of other destructive commands. Cursor Grok (desktop and cloud) reads `.cursor/hooks.json`. Claude Code reads `.claude/settings.json`. Codex has no shell hook, so it gets an `AGENTS.md` section only.

The classifier runs in the [harness](https://www.aihero.dev/ai-coding-dictionary/harness) before the command. A broken hook denies rather than looking installed while blocking nothing.

## When to reach for it

Type `/agent-safety`, or the agent reaches for it automatically when a task fits: "block git push", "agent safety", "guardrails for Grok", "dangerous shell commands".

| Situation | Skill |
| --- | --- |
| Cursor Grok, Claude Code, Codex, or "every agent in this repo" | This one |
| Claude Code only, and you already know you want that PreToolUse hook | [git-guardrails-claude-code](https://github.com/CraigPrime1/skills/blob/main/skills/misc/git-guardrails-claude-code/SKILL.md) in `misc/` (not in the plugin) |
| Human setup that is not about blocking the agent | [wizard](https://aihero.dev/skills-wizard) |

## Prerequisites

It writes into the repo you run it in (project scope, the default) or into your home directory (user scope):

| It writes | Where |
| --- | --- |
| Classifier + wrapper | `.cursor/hooks/` and/or `.claude/hooks/` |
| Hook registration | `.cursor/hooks.json`, `.claude/settings.json` |
| Prompt rail | `AGENTS.md` or `CLAUDE.md` |

`python3` must be on PATH. Without it the wrapper denies every command (fail-closed). Cursor cloud agents load **project** hooks only; `~/.cursor` is invisible to them, so prefer project scope.

Do not install it in a repo whose agents must `git push`.

## Guardrails, not reminders

A **guardrail** is the hook. The `AGENTS.md` section is the backup for Codex and a second copy of the same policy for everyone else. The blocked list lives in the classifier; global git options (`git -C . push`) are stripped before matching, so adjacency tricks do not slip through.

Your own terminal is not wrapped. The same `git push` the agent cannot run, you can.

## Common questions

**Will this work for Cursor Grok?**

Yes, when you install it as **project** hooks. Cursor runs `beforeShellExecution` from `.cursor/hooks.json` for desktop Agent and for cloud agents in the repo. User-level `~/.cursor/hooks.json` does not load in the cloud. That is the question this skill exists to answer: [git-guardrails-claude-code](https://github.com/CraigPrime1/skills/blob/main/skills/misc/git-guardrails-claude-code/SKILL.md) is Claude Code only.

**Isn't this what Claude Code deny rules already do?**

Deny rules are a Claude Code permission list. This skill is one policy file wired into Cursor *and* Claude Code *and* a prompt rail for Codex, so the blocked set cannot drift between harnesses. If you only use Claude Code deny rules, you do not need this, and Grok will ignore those rules.

**Can I still push from my own terminal?**

Yes. The hook sits on the agent's shell tool, not on `git`.

**What if python3 is missing, or the payload is garbage?**

The command is denied. The older Claude-only hook failed *open* without `jq`, so it looked installed and blocked nothing. This one fails closed on purpose.

## It's working if

- `echo '{"command":"git push origin main"}' | .cursor/hooks/agent-safety.sh` exits 2 and prints BLOCKED.
- `echo '{"command":"git -C /tmp push origin main"}'` is also blocked (global options do not dodge it).
- `echo '{"command":"git status"}'` exits 0.
- The next time Cursor Grok tries `git push` in this repo, the hook denies it and your own `git push` still works.

## Where it fits

A **run-once setup** standalone: you install it when you want agents fenced, then you forget it. Its nearest neighbour is [wizard](https://aihero.dev/skills-wizard), which also writes a setup path a human runs, and [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills), which configures this skill set rather than the agent's shell. When you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
