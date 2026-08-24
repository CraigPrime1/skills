---
name: clean-architecture
description: Restructure existing code into a clean architecture — separate concerns, increase modularity, reduce coupling — while keeping behaviour identical. Use when the user asks to refactor into layers or folders, separate concerns, decouple modules, untangle a file that has grown too big, or reorganise a project's structure.
---

# Clean Architecture

Convert working-but-tangled code into a structure with separated concerns, real module boundaries, and fewer edges between things. **Behaviour remains unchanged — structure is improved.**

That last sentence is the contract, and it has teeth: **you must be able to prove behaviour didn't change, before you move a single file.** A restructure you can't verify is a rewrite with extra confidence.

This skill uses the `/codebase-design` vocabulary — module, interface, depth, seam, adapter. Read `CONTEXT.md` first if it exists: the folders you create should carry the project's own domain words.

## Phase 1 — Pin the behaviour

Pick the cheapest proof available and get it green **before touching structure**:

1. **Existing test suite**, if it genuinely covers the code you're moving. Check coverage of the target files — don't assume.
2. **Characterisation tests** — capture what the code currently does (including behaviour you think is wrong) and assert on it. Write these against the outermost stable interface, not the internals you're about to move.
3. **Golden-output harness** — run real inputs through the entry point, snapshot stdout/response/DB state, diff after every step.
4. **Type checker + build** as a floor, never as the only proof. They catch moves, not semantics.

Record the exact command. It runs after every step in Phase 4.

If none of these is achievable, say so and stop: the honest options are "add tests first" or "accept this is a rewrite with risk", and that's the user's call, not yours.

## Phase 2 — Name the concerns actually present

Read the code and list the distinct concerns tangled in it. Concrete, from *this* code — not a template:

- domain rules (the logic that would exist regardless of framework or database)
- orchestration / use cases (the steps of a workflow)
- I/O and infrastructure (HTTP, DB, filesystem, queues, third-party SDKs)
- presentation (rendering, serialisation, formatting)
- configuration and wiring

For each, note where it currently lives. The overlaps you find — "the HTTP handler validates, computes pricing, writes to Postgres, and formats the email" — are the restructure.

## Phase 3 — Draw the dependency rule

One rule, and it's what makes the structure *clean* rather than merely tidy: **dependencies point inward, toward the domain.** Domain code imports nothing from infrastructure or presentation. Outer layers depend on inner ones through interfaces defined by the inner layer; concrete adapters are injected at the edge.

Propose the target structure explicitly — folders, what lives in each, which direction imports flow — and show it to the user before moving anything. Include:

- the **seam** for each concern (where the interface lives), and
- the one or two places you're deliberately *not* splitting, because the split would cost more than the coupling.

Right-size it. A 400-line CLI does not need six layers; three folders and one interface may be the whole answer. **Layers you can't justify with a real second implementation or a real test seam are ceremony** — and ceremony is a coupling of its own.

## Phase 4 — Move in small, verified steps

One concern per step. After **every** step, run the Phase 1 command and get it green. Commit each green step separately with a message naming what moved.

Order that keeps the tree working throughout:

1. **Extract pure logic first.** Pull domain rules out of handlers into pure functions — no I/O, no framework types. This is where most of the value lands, and it's the safest move.
2. **Introduce interfaces at the I/O seams.** Define what the domain needs (`OrderRepository`, `EmailSender`) in domain terms; make the existing concrete code satisfy it.
3. **Invert the wiring.** Push construction of adapters out to the composition root (`main`, the server bootstrap, the DI container).
4. **Move files into the target folders** and fix imports — mechanical, and safe only now that the edges are cut.
5. **Delete what the restructure made dead.** Old shims, duplicated helpers, unused exports.

Rules while moving:

- **No behaviour changes mixed in.** No bug fixes, no renamed API fields, no "while I'm here". Note them and hand them back as separate work.
- **Rename only in a dedicated step**, never inside a move — a step that both renames and relocates is unreviewable.
- If a step won't go green, **revert it** rather than debugging forward with three concerns half-moved.

## Phase 5 — Write the architecture description

The structure is only useful if the next person can navigate it. Produce a short description (in the repo, not the chat) covering:

- the folder structure and what belongs in each folder,
- the dependency rule, stated in one line, and where it's enforced,
- for each seam: the interface, its real adapter, and its test adapter,
- what deliberately stayed coupled, and why.

Where the project keeps ADRs, record the hard-to-reverse choices as one — reach for `/domain-modeling` if the restructure changed the vocabulary.

### Done when

- [ ] The Phase 1 proof was green before the first move and is green now, unchanged.
- [ ] Every commit in the sequence is structural only — no behavioural diff hides in one.
- [ ] Domain code imports no infrastructure. Grep the imports and confirm.
- [ ] Each folder's purpose can be stated in one sentence, and every file in it fits that sentence.
- [ ] The architecture description exists and matches the tree.
