Quickstart:

```bash
npx skills add mattpocock/skills --skill=four-hats
```

```bash
npx skills update four-hats
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/four-hats)

## What it does

`four-hats` runs one piece of work through four separated roles — Architect designs it, Engineer builds it, Reviewer tries to break it, Optimizer makes it faster — one hat at a time, each leaving a written artifact for the next.

The value isn't the number of roles, it's the **separation**: the Reviewer and the Optimizer run as fresh sub-agents that see the diff and the brief but never your reasoning for it. A reviewer who watched you write the code agrees with you.

## When to reach for it

Type `/four-hats`, or the agent reaches for it automatically when a task fits — it fires when you ask for multiple agents or roles to collaborate, or want a change designed, built, reviewed and optimised in one pass.

Reach for it on work worth the overhead: a new module, a tricky algorithm, anything touching money, auth, or data integrity. On a two-line fix it's theatre — run [code-review](https://aihero.dev/skills-code-review) on its own instead.

## Hats hand off; hats can send work back

Each hat produces something concrete: a design brief with a rejected alternative and acceptance criteria; a diff plus a build note listing every shortcut and every uncertainty; ranked findings with a failure case each; before/after numbers. **A hat with no artifact didn't run.**

The Reviewer can reject — the work goes back to the Engineer with findings attached, capped at two return trips. A third red round means the design is wrong, so it goes back to the Architect rather than getting patched again. The Optimizer inherits the same honesty rule from [optimizing-performance](https://aihero.dev/skills-optimizing-performance): it may only keep what it can measure, and "measured, nothing to gain" is a normal result.

The anti-theatre rule underneath all of it: **disagreement is the product.** Four hats that agree immediately mean the separation failed, and the doubting hat gets re-run with a sharper brief.

## Where it fits

`four-hats` is a reach-for-it-anytime standalone that wraps other skills rather than replacing them — it drives [code-review](https://aihero.dev/skills-code-review) in the Reviewer seat and [optimizing-performance](https://aihero.dev/skills-optimizing-performance) in the Optimizer seat, and speaks the [codebase-design](https://aihero.dev/skills-codebase-design) vocabulary in the Architect seat. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
