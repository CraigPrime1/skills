## What it does

`clean-architecture` restructures existing code into separated concerns and real module boundaries — behaviour identical, structure improved — and writes the architecture description that makes the new tree navigable.

It won't move a single file until behaviour is pinned by something green — an existing suite, characterisation tests, or a golden-output harness — and that proof re-runs after every step. A restructure you can't verify is a rewrite with extra confidence.

## When to reach for it

Type `/clean-architecture`, or the agent reaches for it automatically when a task fits — it fires when you ask to refactor into layers or folders, separate concerns, decouple modules, or untangle a file that has grown too big.

Reach for it when the code works and the *shape* is the problem. To find out which parts of an unfamiliar codebase deserve this treatment first, run [onboarding-audit](https://aihero.dev/skills-onboarding-audit) before it; for the vocabulary of designing one module's shape rather than the tree's, use [codebase-design](https://aihero.dev/skills-codebase-design).

## Prerequisites

A way to prove behaviour is unchanged. If the code has no tests and no golden-output harness is achievable, the skill says so and stops rather than restructuring blind — adding characterisation tests first becomes the work. It also writes into the repo: an architecture description, and an ADR where the restructure made a hard-to-reverse choice.

## The dependency rule, moved in verified steps

What makes a structure *clean* rather than merely tidy is one rule: **dependencies point inward, toward the domain.** Domain code imports nothing from infrastructure or presentation; adapters are injected at the composition root. The skill names the concerns actually present in your code, proposes the target tree, then moves in an order that keeps the repo working the whole way — pure logic out first, interfaces at the I/O seams, wiring inverted, files relocated last.

Every step ends with the proof command green and its own commit. **No behaviour changes ride along** — no bug fixes, no renamed fields, no "while I'm here" — and a step that won't go green gets reverted rather than debugged forward.

It also right-sizes: a 400-line CLI doesn't need six layers, and layers you can't justify with a real second implementation or test seam are ceremony, which is a coupling of its own.

## It's working if

- The proof command was green before the first move, and is green — unchanged — now.
- Every commit is structural only; no behavioural diff hides in one.
- Grepping the domain's imports turns up no infrastructure.
- An architecture description lands in the repo and matches the tree.

## Where it fits

`clean-architecture` is periodic maintenance you reach for when a tangle is blocking work. [onboarding-audit](https://aihero.dev/skills-onboarding-audit) hands its restructure findings straight to it, and it speaks [codebase-design](https://aihero.dev/skills-codebase-design)'s deep-module vocabulary while doing them. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
