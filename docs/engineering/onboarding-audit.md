Quickstart:

```bash
npx skills add mattpocock/skills --skill=onboarding-audit
```

```bash
npx skills update onboarding-audit
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/onboarding-audit)

## What it does

`onboarding-audit` orients you in a large, unfamiliar codebase — how it's built, run and wired — and then reports its structural problems, duplication, performance bottlenecks and maintainability risks as a ranked list with evidence.

It won't judge before it understands: **trace one real request end to end before criticising anything.** Folder names describe the codebase somebody intended; the call path describes the one that exists. Nothing in the working tree changes — functionality remains unchanged, quality is enhanced by what happens next.

## When to reach for it

Type `/onboarding-audit`, or the agent reaches for it automatically when a task fits — it fires when you ask it to understand, review or audit a codebase it hasn't worked in, hand it an inherited repo, or ask for an architecture summary or data-flow map.

Reach for it on first contact with unfamiliar code. On a codebase you already know, [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) is the better tool — it surveys for deepening opportunities and grills through the one you pick, rather than building a map you already have.

## The trace, then the ranking

Phase one is cheap facts: how it runs, what it depends on, the biggest files, and **git churn** — the audit's most useful signal, because a mess nobody touches is not the problem while a mess that changes weekly is. Then it traces two paths end to end, one read and one write, opening every file in the chain, and writes an architecture summary — including **what it still doesn't understand**, which is what makes the rest trustworthy. That summary goes to you *before* any findings, so a wrong mental model gets corrected in one sentence rather than producing confident wrong recommendations.

Findings come in four buckets — structural, duplication, performance, maintainability — and each carries `file:line` evidence plus the concrete consequence: the bug it causes, the change it makes expensive, the incident it invites. A finding phrased only as a preference gets cut. They're then ranked by **risk × change frequency** and capped at the top ten, which is what stops an audit becoming a 60-item wish list nobody acts on.

## It's working if

- It runs (or tries to run) the test suite and reads git history before reading logic.
- You get an architecture summary, with its blind spots named, before any criticism.
- Every finding has a file, a line, and a consequence — not an adjective.
- It ends with strategies and handoffs, and an unchanged working tree.

## Where it fits

`onboarding-audit` is the first-contact survey: it hands restructures to [clean-architecture](https://aihero.dev/skills-clean-architecture), suspected slowness to [optimizing-performance](https://aihero.dev/skills-optimizing-performance), module-shape problems to [codebase-design](https://aihero.dev/skills-codebase-design), and ongoing upkeep to [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture). When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
