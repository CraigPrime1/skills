---
name: four-hats
description: Run one piece of work through four separated roles — Architect, Engineer, Reviewer, Optimizer — one hat at a time, with a written handoff between each. Use when the user asks for multiple agents/roles to collaborate, wants design plus build plus review plus optimisation in one pass, or wants a nontrivial change stress-tested before it lands.
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
- Tests at the seams the Architect named (drive `/tdd` where the behaviour is worth locking down).
- Note every deviation and every shortcut in a short **build note**: what you built, what you skipped, where you're unsure. Unsure-list included — that's the Reviewer's map.

### 3. Reviewer — try to break it

Runs as a **fresh sub-agent**. It receives: the design brief, the acceptance criteria, the build note, and the diff. It does **not** receive the Engineer's reasoning transcript.

Its brief: find what's wrong, ranked by severity — correctness bugs first, then contract/spec drift, then design smells, then nits. For each finding: file:line, the concrete failure case (inputs → wrong result), and the smallest fix.

For a substantial diff, run `/code-review` here rather than hand-rolling the pass.

**The Reviewer may send the work back.** A rejection returns to the Engineer hat with the findings attached. Cap it at two return trips: if the third round is still red, the design is wrong — go back to the Architect, don't keep patching.

A Reviewer that returns "looks good" on the first pass with no findings didn't run. Say so and re-run it with a sharper brief.

### 4. Optimizer — make it faster, honestly

Runs as a **fresh sub-agent**, after the Reviewer is satisfied. It may only keep changes it can **measure**, so it must invoke `/optimizing-performance`: baseline first, one change at a time, before/after numbers reported.

Constraints:

- **Correctness is not negotiable for speed.** Every test still passes; behaviour is unchanged.
- **No unmeasured "optimisations."** Removing a readable line for a guessed gain is a regression in disguise.
- If nothing is worth optimising, say that and stop. "No change needed, here's the baseline" is a valid, common result.

## Output

Deliver all four artifacts, in order, so the reader can see the work argue with itself:

1. **Architecture** — the design brief, including the rejected alternative.
2. **Implementation** — the diff, plus the build note.
3. **Review feedback** — findings and what was done about each (fixed / deferred with reason).
4. **Final optimised version** — before/after numbers, or an explicit "measured, nothing to gain".

## Anti-theatre rules

- One hat at a time, named out loud. Blended hats collapse into a single voice agreeing with itself.
- Reviewer and Optimizer are **sub-agents, context-isolated**. This is the whole mechanism.
- Every hat leaves an artifact. A hat with no artifact didn't run.
- Disagreement is the product. Four hats that all agree immediately means the separation failed — re-run the doubting hat with a sharper brief.
