---
name: production-debugging
description: Investigate a bug in a deployed environment that you cannot reproduce locally. Use when the user reports a production incident or outage, an error affecting real users, a crash, 500 or timeout in production or staging, says users are reporting something broken, or hands you logs, traces, or a Sentry / error-tracker report.
---

# Production Debugging

Debug what is failing for real users, right now, with the evidence you have rather than the debugger you don't.

The defining constraint: **stop the bleeding before you satisfy your curiosity.** Root cause is the goal, but users come first, and the two are done in that order. The second constraint follows from the first: **production is not a REPL** — you never deploy speculative changes to see what happens.

Once you can reproduce the failure locally, this skill hands off: `/diagnosing-bugs` owns the tight-feedback-loop discipline from there.

## Phase 0 — Stabilise

Before investigating:

- **Scope the blast radius.** Who is affected, how many, since when, and what exactly can't they do? "Errors are up" is not scope; "checkout fails for EU users since 14:05" is.
- **Check the timeline first.** What deployed, what feature flag flipped, what config or infra changed, what third party changed, in the window before onset. Correlation with a deploy is the single highest-yield signal in production debugging.
- **Mitigate if you can, before you understand.** Prefer the reversible lever: feature flag off, config revert, traffic shift. Mitigation is not defeat — it converts an incident into a bug you can debug calmly. **Before rolling a deploy back, check what migrations shipped with it** — old code over an applied schema change corrupts data and is not reversible. Scaling up is wrong for pool or lock contention: more app instances multiply the contention. Ask before any mitigation you can't undo.
- **Start a timeline note** now: onset, detection, each action with its timestamp. You will not reconstruct this later, and it is the raw material for Phase 6.

## Phase 1 — Harvest the evidence that already exists

Do this early — logs rotate, traces sample out, and the incident window ages out of retention.

- **Error tracker** — the exact exception, stack, frequency curve, first-seen version, affected users, breadcrumbs.
- **Logs** — pull the raw lines for one failing request end to end, not just the aggregate count. One complete failing trace beats a thousand summarised ones.
- **Traces / spans** — where the latency or the error actually occurs across service boundaries.
- **Metrics** — error rate, latency percentiles, saturation (CPU, memory, connections, queue depth), and the shape of the onset: instant (a deploy or flag), ramping (a leak, growing data), periodic (a cron, a cache expiry), or load-correlated (contention, pool exhaustion).
- **The failing input** — the request, payload, tenant, or record. Prefer ids and *shapes* (types, lengths, encodings, null-ness) over content; the bug is often in the field redaction would destroy, so if you need the literal bytes, ask before pulling production data local and delete it after. If redaction kills the repro, say so — that narrows the cause to the redacted field.

You will usually not have access to these yourself. Ask the user for each by name — the exact dashboard, query, or issue link — and state plainly which ones you didn't get. **Never infer a frequency curve, a percentile, or an affected cohort you did not see.**

Write down what the evidence **rules out** as well as what it suggests. Narrowing is progress.

## Phase 2 — Reconstruct the case

Try, in order:

1. **Replay the real input locally** against the same version — captured request, payload, or record. This is the fastest path to a reproduction, and it works more often than people expect.
2. **Match the environment**, not just the code: same version, same config, same feature flags, and production-shaped data (volume, nulls, legacy rows, encodings, timezones). Most "only in production" bugs are data or config differences, not magic.
3. **Reproduce in staging** with a copy of the triggering data.

The moment it reproduces, **switch to `/diagnosing-bugs`** — you now have what production denied you: a loop you can run at will.

## Phase 3 — When it won't reproduce: instrument production safely

Only when Phase 2 has genuinely failed. Every rule here is non-negotiable:

- **Add observability, not behaviour.** New logging, a metric, a span, an error-tracker breadcrumb — nothing that changes what the code does.
- **Behind a flag or sampled**, so it can be turned off without a deploy and can't melt the logging bill.
- **Structured, and correlated** — request id, tenant, version — so you can join it to the failing case.
- **Never log secrets or personal data.** Log shapes, sizes, types, ids, and booleans — not payloads.
- **A removal plan and a deadline**, tagged so cleanup is a single grep.
- Announce the deploy in the incident channel, and confirm it's reversible.

Then wait for the failure to reproduce with instrumentation attached, and re-run Phase 1 against the new evidence.

## Phase 4 — Root cause

State it as a causal chain that the evidence supports: **this input, in this state, hits this code path, which does this wrong thing, producing the symptom users reported.**

Test it: does the chain explain the *timing* of onset and the *subset* of affected users? A cause that explains the error but not why it started at 14:05, or why only EU users, is incomplete — keep going.

**Time-box this.** Users are broken while you theorise. Once the chain explains onset and cohort, that is enough to fix on: record any still-unexplained symptom as an open question in the Phase 6 note and move to Phase 5. Two independent causes in one incident is a normal outcome, not a sign you aren't done.

Beware the classes that only bite in production: concurrency and races under real load, connection/thread pool exhaustion, retry storms and thundering herds, clock and timezone assumptions, unbounded growth (memory, disk, table scans as data grows), stale caches, partial deploys running two versions at once, and third-party degradation.

## Phase 5 — Fix, verify, and guard

- **Smallest correct fix**, deployed the normal way with review — an incident is not a licence to skip the pipeline.
- **Regression test** that fails on the old code, using the real failing input from Phase 1.
- **Verify in production** against the actual signal: the error rate for *that* error, for the affected cohort, back to baseline — not "the deploy went out".
- **Guard the class, not just the case**: validation at the edge that rejects the bad input shape, a timeout or bound that was missing, an alert on the metric that would have caught this earlier.
- **Remove the temporary instrumentation** (grep the tag) and un-mitigate deliberately — the flag flipped back on, the rollback rolled forward — watching the signal.

## Phase 6 — Post-incident note

Short, blameless, and written while it's fresh:

- Timeline (onset → detection → mitigation → fix), impact in user terms.
- Root cause, and the contributing factors that let it reach production.
- **Detection gap** — how long until you knew, and what would have told you sooner.
- Follow-ups, each an issue with an owner. If the real finding is that the code has no seam to lock this down, say so and recommend the user run `/improve-codebase-architecture` — it's user-invoked, so you can't fire it yourself.
