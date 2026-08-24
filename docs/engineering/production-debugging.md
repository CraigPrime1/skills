Quickstart:

```bash
npx skills add mattpocock/skills --skill=production-debugging
```

```bash
npx skills update production-debugging
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/production-debugging)

## What it does

`production-debugging` investigates a failure happening to real users in a live environment — working from logs, traces, metrics and the deploy timeline rather than a debugger you can't attach.

It stops the bleeding before it satisfies its curiosity: mitigation comes before root cause, because a flipped flag or a config revert converts an incident into a bug you can debug calmly.

## When to reach for it

Type `/production-debugging`, or the agent reaches for it automatically when a task fits — it fires on an incident, an error affecting real users, a crash, 500 or timeout in a live environment, or when you hand it an error-tracker report to work from.

Reach for it while the failure is only reproducible in production. The moment you can reproduce it locally, it hands off to [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs), which owns the tight-feedback-loop discipline from there.

## Prerequisites

Access to the evidence, and the authority to act on it. The skill's first two phases assume an error tracker, log search, traces and metrics, plus the deploy and feature-flag timeline — and Phase 0 assumes someone can flip a flag or revert a config. You will usually not have these yourself: the skill tells you to ask for each by name and to state plainly which ones you didn't get, rather than inferring a cohort you never saw.

## Evidence first, because evidence expires

Logs rotate, traces sample out, and the incident window ages out of retention — so the skill harvests what already exists early: the exception and its frequency curve, the raw lines for **one complete failing request** end to end, spans across service boundaries, and the shape of the onset (instant, ramping, periodic, load-correlated). It checks the deploy and flag timeline first, because correlation with a deploy is the highest-yield signal in production debugging.

Only when the failure genuinely won't reproduce does it instrument production — observability, never behaviour; flagged and sampled; structured and correlated; no secrets or personal data; with a removal deadline.

Its bar for root cause is strict: the causal chain must explain the *timing* of onset and the *subset* of users affected, not just the loudest symptom. And it ends with a blameless post-incident note including the **detection gap** — how long until you knew, and what would have told you sooner.

## It's working if

- The blast radius is stated in user terms before any code is read.
- A timeline note exists, with timestamps for each action taken.
- The fix ships through the normal pipeline with a regression test built from the real failing input.
- Temporary instrumentation is grepped away and mitigations are reversed deliberately, watching the signal.

## Where it fits

`production-debugging` is a reach-for-it-anytime standalone that owns the live-incident half of debugging, pairing with [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) for the reproducible half. Its follow-ups go to the issue tracker, and to [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) when the real finding is that the code has no seam to lock the failure down. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
