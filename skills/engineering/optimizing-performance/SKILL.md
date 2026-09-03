---
name: optimizing-performance
description: "Make code faster, leaner, or more scalable — measurement first. Use when the user says something is slow, heavy, laggy or takes forever, or mentions performance, memory usage or a memory leak, scalability, bottlenecks, N+1 queries, bundle size, or unnecessary re-renders — for code that has always been too slow, not code that used to be fast (that's a regression: use diagnosing-bugs)."
---

# Optimizing Performance

Find the real bottleneck, fix it, and prove the fix with numbers. Speed, memory, scalability — same loop.

The defining constraint: **no measurement, no optimisation.** Every change here is justified by a before-and-after number, and any change that can't produce one gets reverted. Guessing at bottlenecks is how readable code turns into fast-looking slow code.

**Was it fast before and slow now?** That's a regression — reach for `/diagnosing-bugs` and bisect to the change that caused it. This skill is for code that has always been too slow.

## Phase 1 — Define the number

Optimisation without a target never ends. Write down:

- **The metric.** p95 request latency, time-to-interactive, peak RSS, rows/sec, cold-start time. Pick the one the user actually feels.
- **The workload.** Which operation, at what input size, under what concurrency. "Slow" on 10 rows and on 10 million are different problems with different answers.
- **The budget.** The number that makes this good enough — and stopping there. Optimising past the budget is spending time you could spend elsewhere.

Averages hide the problem. Use percentiles (p95/p99) for anything user-facing.

## Phase 2 — Baseline, reproducibly

Build a harness that produces the metric on demand, from a **realistic** workload — production-shaped data volumes and distributions, not a three-row fixture. Then:

- Run it 5+ times; record median and spread. If the spread is wider than the win you're chasing, tighten the harness before optimising anything.
- Pin what you can: warm caches (or explicitly cold), fixed dataset, no other load, production-like build (never profile a dev build for frontend or a debug build for native).
- Paste the baseline output. It's the thing every later claim is measured against.

## Phase 3 — Profile to find the dominant cost

**Profile; don't read code and guess.** Use the real tool: sampling profiler, flame graph, `EXPLAIN` (`EXPLAIN ANALYZE` **executes the statement** — read queries only, or wrap writes in `BEGIN … ROLLBACK`, and never against production without the user's go-ahead), browser performance panel, allocation/heap snapshot, `time`/`perf`.

Rank costs by share of total, then **attack the largest cost you can actually change.** Making a 3% path twice as fast buys 1.5%. Two caveats that decide real cases: when the dominant cost is a dependency you don't control (a third-party API, a mandated crypto step), say so explicitly and move to the largest cost you do control; and check whether several mid-sized costs share one fix (a single batching change) before dismissing them individually.

Where profiles lie or aren't available, bracket with timers around candidate regions and bisect by measurement — still numbers, not intuition.

### The usual suspects, in rough order of payoff

- **Algorithmic complexity** — the nested loop over a growing collection, the O(n²) that was fine at launch. Biggest wins live here.
- **Round trips** — N+1 queries, per-item API calls, chatty I/O in a loop. Batch, join, or prefetch.
- **Index problems** — read the query plan. A sequential scan is only a defect when the query is *selective*: check estimated-vs-actual rows first (a wide gap means stale statistics, not a missing index), and check the predicate is sargable (no function or cast wrapped around the column, no leading-wildcard `LIKE`). Every index is a permanent write cost — name the query it serves.
- **Doing work that could be done once** — recomputing inside a loop, re-parsing config, rebuilding a lookup table per call.
- **Doing work nobody asked for** — over-fetching columns/rows, eager loading, shipping data the client discards.
- **Serialisation and copying** — JSON encode/decode on hot paths, defensive deep clones, large payloads crossing a boundary.
- **Allocation churn / retained memory** — per-iteration allocation, unbounded caches, leaked listeners and timers, closures holding large objects.
- **Unnecessary rendering (frontend)** — a re-render is a symptom; find the cause. New object/array/function identity in props **where it defeats an existing `React.memo` boundary or an effect's dependency array** — identity churn under an unmemoised parent costs nothing, so memoising there is pure overhead; context holding a value that changes on every keystroke; state living higher than it needs to. Reach for memoisation only when a profile shows the render itself is expensive. (Index keys are a correctness bug, not a perf one — fix them separately.)
- **Blocking the main thread / event loop** — synchronous heavy work, large parses, unbatched layout thrashing. Chunk it, defer it, or move it off-thread.
- **Missing cache at the right layer** — cheapest win when the data tolerates staleness; the invalidation strategy is part of the change, not an afterthought.

## Phase 4 — One change at a time

For each candidate:

1. State the hypothesis with a prediction: "batching these 40 queries into one cuts p95 by ~200ms."
2. Make the smallest change that tests it.
3. Re-run the baseline harness. Record the number.
4. **Keep or revert.** Below the noise floor, or below what the loss in clarity is worth? Revert it. Unmeasured "optimisations" left in the tree are pure cost.
5. Re-profile. The dominant cost has moved — the next change targets the new one, not the next item on your original list.

Never batch three optimisations into one measurement; you won't know which one worked, or which one caused the regression.

**Correctness is not negotiable for speed.** The full test suite passes after every kept change. Faster wrong answers are worthless — and a fast path that diverges from the slow path on an edge case is the worst bug class this skill can produce.

## Phase 5 — Lock it in

- Report **before → after** for each kept change, plus the total against the Phase 1 budget.
- Where the fix is fragile (an index, a batch size, an intentional cache), add a regression guard: a perf assertion, a query-count test, a bundle-size or memory budget in CI. Otherwise it silently rots back.
- Comment **why** any non-obvious fast path exists, with the number that justified it. Without that, the next reader "simplifies" it away.
- Say what you *didn't* do and what it would buy — the next 10% often isn't worth its complexity, and that judgement is worth recording.
