---
"mattpocock-skills": minor
---

Add eight model-invoked engineering skills covering the senior-engineer work the set didn't have a home for.

- **`system-design`** — design a scalable system (requirements as numbers, access patterns → schema, API contract, data flow, caching where invalidation *is* the design, failure modes), then build one vertical slice of it for real. Numbers before boxes: every component must trace to a figure.
- **`full-stack-mvp`** — build a whole application end to end. One core loop, built production-ready — MVP limits scope, never quality — schema first with migrations from commit one, then API contract, UI architecture, and vertical slices that each run end to end.
- **`ui-components`** — reusable, accessible, production-ready components: props contract before markup, an explicit state matrix (empty, loading, error, too much, offline, interrupted), and accessibility as a floor rather than a phase.
- **`clean-architecture`** — restructure tangled code with behaviour proven unchanged. It won't move a file until a proof command is green, moves one concern per commit, and points every dependency inward.
- **`optimizing-performance`** — profile-first speed, memory and scale work: baseline, dominant cost, one change at a time, keep or revert on the number. No measurement, no optimisation.
- **`production-debugging`** — the live-incident half of debugging: mitigate first, harvest evidence before it rotates away, instrument production only when the failure won't reproduce, and hand to `/diagnosing-bugs` the moment it does.
- **`onboarding-audit`** — first contact with an unfamiliar codebase: trace a real read and write path end to end before judging anything, then report findings ranked by risk × churn, with evidence and a consequence each.
- **`four-hats`** — run one nontrivial change through Architect → Engineer → Reviewer → Optimizer, with the Reviewer and Optimizer as context-isolated sub-agents. The separation is the mechanism; disagreement is the product.

`ask-matt` gains two on-ramps (unfamiliar codebase, nothing exists yet), a production branch on "something's broken", two more codebase-health entries, and two standalones — so the router still maps the whole set.
