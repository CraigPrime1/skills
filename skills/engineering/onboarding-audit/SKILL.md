---
name: onboarding-audit
description: Get oriented in a large, unfamiliar codebase and report what's wrong with it. Use when the user hands you a legacy, inherited, or newly joined codebase to audit or get oriented in, says nobody knows how it works, or asks for an architecture summary, a data-flow map, duplication, tech debt, or maintainability risks.
---

# Onboarding Audit

Arrive in a codebase you've never seen, understand how it actually works, then report the structural problems, duplication, performance bottlenecks and maintainability risks — ranked, with evidence.

The defining constraint: **trace a real read path and a real write path end to end before you judge anything.** Folder names and READMEs describe the codebase somebody intended; the call path describes the one that exists. Every audit finding that skipped the trace is a guess about someone else's constraints.

**Nothing changes in the working tree.** This skill produces understanding and a ranked plan; the fixes are separate work.

## Phase 1 — Cheap orientation

Gather what's free before reading any logic:

- **How is it run, built, tested?** `package.json` scripts, Makefile, CI config, Dockerfile, README quickstart. Try to run the tests — whether they pass, and how long they take, tells you more about the culture than any doc. First read the test config for side effects (snapshot updates, DB migrate/seed); if the suite writes to a database or rewrites snapshots, **don't run it** — report that instead, and check `git status` after anything you do run.
- **What does it depend on?** The manifest: framework, ORM, queue, auth, and any suspiciously old or duplicated libraries.
- **What shape is it?** Top-level folders, file count and lines per area, the ten largest files (`wc -l`), entry points (`main`, server bootstrap, routes, CLI, jobs).
- **What actually changes?** `git log` churn per file over the last year, and the files with the most authors. **Churn is the audit's most useful signal:** a mess nobody touches is not the problem; a mess that changes weekly is. Check the clone first (`git rev-parse --is-shallow-repository`) — on a shallow clone, either `git fetch --unshallow` or state in the report that the churn axis is unavailable and the ranking is risk-only.
- **What's documented?** `CONTEXT.md`, ADRs, comments that read like warnings.

## Phase 2 — Trace two paths end to end

Pick the two paths that carry the product's core value — **one read and one write** — and follow each from the outermost entry point to the datastore and back. Actually open every file in the chain.

For each, write the narrative: entry → validation → authorisation → business logic → persistence → response, naming the real functions and files at each hop. Note where state is owned, where it's mutated, where it's cached, and every place the path crosses a process, network, or module boundary.

Don't shortcut this — it's the phase the rest of the audit rests on.

## Phase 3 — Write the architecture summary

Before any criticism, prove you understand it. One page:

- **What the system does**, in the domain's own words.
- **The major modules** — what each owns, and the interface other code reaches it through.
- **The data flow**, from the Phase 2 traces.
- **The external dependencies** and what happens at each boundary.
- **The conventions in force** — how this codebase does errors, validation, tests, naming. You'll need these so your findings respect the local idiom instead of importing yours.
- **What you still don't understand.** Naming your blind spots is what makes the rest of the audit trustworthy.

Show this to the user before the findings. A wrong mental model produces confident, wrong recommendations — and the person who knows the codebase can correct it in one sentence. Don't block on it: if the user is AFK, say which model you're proceeding on, flag it unconfirmed, and continue.

## Phase 4 — Find the problems

Work the four buckets. **Every finding carries `file:line` evidence and the concrete consequence** — the bug it causes, the change it makes expensive, the incident it invites. A finding phrased only as a preference ("this should be more modular") gets cut.

- **Structural** — modules that know too much about each other, circular dependencies, god objects and 2000-line files, business logic in controllers/components, no seam where tests need one, layering that's declared but not enforced.
- **Duplication** — the same rule implemented in three places (search for the *behaviour*, not just copy-pasted lines: two validators that must agree, two date formatters, parallel model and DTO hierarchies). Rank by how badly the copies have already drifted.
- **Performance** — N+1 queries, unbounded queries with no pagination, missing indexes on hot lookups, work in loops, unbounded caches and memory growth, blocking calls with no timeout. Confirm with a query plan (`EXPLAIN` — not `EXPLAIN ANALYZE`, which executes the statement) or a measurement where you can; mark as suspected where you can't.
- **Maintainability risk** — untested load-bearing code (cross-reference with churn), abandoned dependencies, silently swallowed errors, config and secrets handling, dead code, comments contradicting the code, missing migrations story.

## Phase 5 — Rank by risk × change frequency

Sort findings by **(damage if it goes wrong) × (how often this code changes)**, then by cost to fix. Churn from Phase 1 does the second axis. Cap the report at the top ~10 findings and say you cut the rest — otherwise an audit becomes a 60-item wish list nobody acts on.

## Phase 6 — Refactoring strategies

For each top finding, a strategy — not a patch:

- the smallest safe first step (usually: get a test around it), then the sequence,
- what must stay behaviour-identical, and how that gets proven,
- rough size (hours / days / weeks), and the risk of doing it,
- what it unblocks.

Hand off deliberately: a restructure into layers goes to `/clean-architecture`; a measured slowness goes to `/optimizing-performance`; a module whose shape is the problem goes to `/codebase-design`. Where the finding is a survey-and-grill job, recommend the user run `/improve-codebase-architecture` — it's user-invoked, so you can't fire it yourself.

### Deliverable

One document: architecture summary → ranked findings (each with evidence and consequence) → strategies → open questions. Nothing in the working tree changed.
