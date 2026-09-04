## Agent safety

A **guardrail** in this repo stops the agent at the tool, not after the fact.

Agents here:

- Commit locally when the user asked for a commit
- Leave `git push`, `git reset --hard`, force-clean, and history rewrite to the human
- Keep secrets out of the chat: do not print `.env`, credentials, or private keys

Your own terminal is not hooked. Cursor Grok (including cloud agents) reads `.cursor/hooks.json`. Claude Code reads `.claude/settings.json`. Codex has no shell hook, so this section is the whole rail there.
