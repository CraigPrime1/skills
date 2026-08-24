Quickstart:

```bash
npx skills add mattpocock/skills --skill=optimizing-performance
```

```bash
npx skills update optimizing-performance
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/optimizing-performance)

## What it does

`optimizing-performance` finds the real bottleneck in slow, heavy, or unscalable code, fixes it, and proves the fix with numbers — speed, memory and scale all run through the same loop.

It optimises nothing it hasn't measured: every change is justified by a before-and-after number, and any change that can't produce one gets reverted. Guessing at bottlenecks is how readable code turns into fast-looking slow code.

## When to reach for it

Type `/optimizing-performance`, or the agent reaches for it automatically when a task fits — it fires when you say something is slow or heavy, or mention performance, memory, scalability, bottlenecks, or unnecessary re-renders.

Reach for it when code has *always* been too slow. If it was fast before and is slow now, that's a regression: [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) bisects to the change that caused it, which is a faster route to the answer.

## Profile, then fix the dominant cost

The loop is: define the number (metric, workload, budget — and stop at the budget), baseline it reproducibly on production-shaped data, then **profile rather than read code and guess**. Amdahl's law is the whole strategy — the only change worth making is to the dominant cost, because halving a 3% path buys you 1.5%.

Then one change at a time, each with a predicted gain, each re-measured, each kept or reverted on the number. Never batch three optimisations into one measurement; you won't know which one worked or which one regressed.

It carries a ranked list of usual suspects — algorithmic complexity, round trips and N+1s, missing indexes, repeated work, over-fetching, serialisation, allocation churn, unnecessary rendering (a symptom, so find the identity or state-placement cause before reaching for memoisation), blocked event loops, missing caches — and it closes by locking wins in with a perf assertion or budget in CI so they don't silently rot back.

## It's working if

- A baseline number and a target budget exist before any code changes.
- A profile — flame graph, `EXPLAIN ANALYZE`, allocation snapshot — names the dominant cost.
- Each kept change is reported as before → after, and changes below the noise floor are reverted rather than kept.
- The test suite is green after every kept change; correctness is never traded for speed.

## Where it fits

`optimizing-performance` is a reach-for-it-anytime standalone, and the Optimizer seat in [four-hats](https://aihero.dev/skills-four-hats) is required to run it so its wins are measured rather than claimed. [onboarding-audit](https://aihero.dev/skills-onboarding-audit) hands it the suspected bottlenecks it finds. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
