---
name: four-hats
description: Run one piece of work through four separated roles — Architect, Engineer, Reviewer, Optimizer — one hat at a time, with a written handoff between each. Use when a change is high-stakes — auth, payments, money, permissions, data integrity, a tricky algorithm, a new module — and should be designed, built, independently reviewed and measured before it ships; or when the user wants work checked by an agent that didn't write it.
---

# Four Hats

One piece of work, four roles, **one hat at a time**: Architect designs it, Engineer builds it, Reviewer tries to break it, Optimizer makes it faster. Each hat produces a written artifact the next one consumes.

The reason this works isn't the number of roles — it's **separation**. The value comes from the Reviewer not having been in the room while the Engineer was rationalising. So the defining constraint: **the Reviewer and the Optimizer run as fresh sub-agents that see the diff and the brief, never your reasoning for it.** A reviewer who watched you write the code agrees with you.

Use it for changes worth the overhead: a new module, a tricky algorithm, anything touching money, auth, or data integrity. For a two-line fix this is theatre — just use `/code-review`.

## The relay

Announce each hat as you put it on. Never blend two.

### 1. Architect — decide the shape

Produces a **design brief** (10–20 lines, not a document):

- The job, in one sentence, and the constraints that actually bind (latency, existing schema, team conventions).
- The chosen shape: which modules exist, what each one's interface is, where the seam goes. Speak the `/codebase-design` vocabulary — depth, seam, adapter.
- **One rejected alternative and why.** A design with no discarded option wasn't designed.
- The risks the Engineer must not paper over.
- **Acceptance criteria** — the observable conditions that make this done. The Reviewer will be handed these, so write them as checks, not aspirations.

The Architect writes no implementation code.

### 2. Engineer — build exactly that

Builds to the brief. Rules:

- Follow the brief. Where reality contradicts it, **stop and amend the brief in writing**, then continue — don't silently redesign.
- Tests at the seams the Architect named — confirm that seam list with the user before writing them, per `/tdd`; the Architect hat is you one step earlier, not the user.
- Note every deviation and every shortcut in a short **build note**: what you built, what you skipped, where you're unsure. Unsure-list included — that's the Reviewer's map.

### 3. Reviewer — try to break it

Runs as a **fresh sub-agent**. It receives: the design brief, the acceptance criteria, the build note, and the diff. It does **not** receive the Engineer's reasoning transcript.

Its brief: find what's wrong, ranked by severity — correctness bugs first, then contract/spec drift, then design smells, then nits. For each finding: file:line, the concrete failure case (inputs → wrong result), and the smallest fix.

For a substantial diff, run `/code-review` here rather than hand-rolling the pass.

**The Reviewer may send the work back.** A rejection returns to the Engineer hat with the findings attached. Cap it at two return trips: if the third round is still red, the design is wrong — go back to the Architect, don't keep patching.

A Reviewer that returns "looks good" with no account of what it checked didn't run — send it back **once**, asking for the specific cases it exercised (edge inputs, error paths, concurrent access). A second pass that lists what it checked and still finds nothing is a valid result: record it and move on. Never invent findings to satisfy this rule.

### 4. Optimizer — make it faster, honestly

Runs as a **fresh sub-agent**, after the Reviewer is satisfied. It may only keep changes it can **measure**, so it must invoke `/optimizing-performance`: baseline first, one change at a time, before/after numbers reported.

Being context-isolated, it cannot ask the user anything — so **the Architect's brief must carry the performance metric, workload and budget**. If the brief names none, the Optimizer reports "no budget given, baseline only" and stops rather than inventing one.

Constraints:

- **Correctness is not negotiable for speed.** Every test still passes; behaviour is unchanged.
- **No unmeasured "optimisations."** Removing a readable line for a guessed gain is a regression in disguise.
- If nothing is worth optimising, say that and stop. "No change needed, here's the baseline" is a valid, common result.
- **Optimizer changes go back through the Reviewer**, or the Optimizer keeps nothing. Nobody reviews their own work here — that includes this hat.

## Output

Deliver all four artifacts, in order, so the reader can see the work argue with itself:

1. **Architecture** — the design brief, including the rejected alternative.
2. **Implementation** — the diff, plus the build note.
3. **Review feedback** — findings and what was done about each (fixed / deferred with reason).
4. **Final optimised version** — before/after numbers, or an explicit "measured, nothing to gain".

## When you can't spawn a sub-agent

Say so in the output, then run the Reviewer from a written brief only — design brief, acceptance criteria, build note, and diff, with none of the Engineer's reasoning — and label the review **not context-isolated** so the reader discounts it accordingly. Silently reviewing in-context while reporting four artifacts is the failure this skill exists to prevent.
