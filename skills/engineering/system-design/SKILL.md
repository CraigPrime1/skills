---
name: system-design
description: Design a scalable system and then build its minimal production version. Use when the user asks to design a system, service, backend or architecture, or asks about data flow, API design, database schema, caching strategy, or how something will handle scale.
---

# System Design

Design the system, then build the **smallest version of that design that could run in production**. Two halves, both required: a design with no running slice is a document, and a slice with no design is a prototype.

The defining constraint: **numbers before boxes.** Every component, every split, every cache in the design must trace back to a number from Phase 1. Architecture diagrams drawn before the load is known are decoration, and they are how teams end up operating six services for a workload one would carry.

Read `CONTEXT.md` and existing ADRs first — a new system inside an existing repo inherits its vocabulary and its already-made decisions.

## Phase 1 — Requirements as numbers

Get these, or state your assumptions explicitly and loudly:

- **Users and traffic** — active users, requests/sec at peak (not average), read:write ratio.
- **Data** — size today, growth per month, the largest single object, retention.
- **Latency budget** — p95 target for the operations users wait on.
- **Consistency needs** — where is stale data fine (feeds, counts, search) and where is it unacceptable (payments, inventory, permissions)? This decides more of the architecture than throughput does.
- **Availability and failure tolerance** — what breaks for users if this is down for five minutes, and is that acceptable?
- **Constraints** — team size, existing stack, deadline, budget, compliance/data residency.

Ask the user for the ones you can't infer. Where they don't know, pick a defensible number, **write it down as an assumption**, and design to it — the assumption is what the next reader will re-check.

## Phase 2 — Access patterns, then the data model

List the queries and mutations the system actually performs, with rough frequency. Then design the schema **to serve that list**:

- Entities, relationships, ownership/tenancy key.
- The index for each frequent query — every listed read should have a plan.
- Where normalisation stops and deliberate denormalisation begins (say why, in terms of a Phase 1 number).
- What is immutable / append-only, and what the retention or archival story is.
- Migration path from empty: schema changes are versioned and applied by tooling from day one.

Schema is the hardest thing to change later. Spend the most time here.

## Phase 3 — API contract

Define the surface before the internals:

- Resources and operations, with request/response shapes.
- **Errors** as a designed part of the contract — codes, shapes, which are retryable.
- **Pagination** for every collection (cursor-based unless there's a reason).
- **Idempotency** for every unsafe operation that a client might retry — idempotency keys or naturally idempotent design.
- **Authentication and authorisation** — who can call it, and where the ownership check happens.
- **Versioning and compatibility** — how you add a field without breaking clients.

## Phase 4 — Components and data flow

Now draw the boxes, and keep them few. Show three flows end to end:

1. **The write path** — request → validation → authorisation → persistence → side effects (events, notifications, cache invalidation).
2. **The read path** — request → cache lookup → store → shaping.
3. **The async path** — what happens outside the request: queues, jobs, schedules, retries with backoff and jitter, dead-letter handling.

**The default architecture is one deployable service and one database.** Add a component only by naming the Phase 1 number that forces it. Each split you add buys scale and costs you a network hop, a failure mode, a deploy, and a debugging session.

## Phase 5 — Caching strategy

For each cache, specify all five or don't add it:

- **Layer** — client, CDN, application memory, shared cache (Redis), database/materialised view.
- **Key** — including tenant and version, so it can't collide or serve stale-shaped data across deploys.
- **TTL** and what staleness that means for the user.
- **Invalidation** — the event that clears it. *This is the design;* the cache itself is trivial. If invalidation can't be stated in one sentence, use a short TTL instead.
- **Miss behaviour** — including the stampede on a cold or evicted key (single-flight, jitter, stale-while-revalidate).

Cache only what a Phase 3 measurement or Phase 1 number says needs it.

## Phase 6 — Failure modes

For each dependency, one line: what happens when it's slow, and what happens when it's gone. Then design for it — timeouts on every network call (a call with no timeout is an outage waiting to happen), bounded retries with jitter on idempotent operations only, circuit breaking or shedding under load, backpressure on queues, and a degraded mode where the core loop still works.

Name the observability you'll need to tell any of this is happening: the handful of metrics, the structured log fields, the traces.

## Phase 7 — Build the minimal production version

Build one **vertical slice** of the design — the core write path and its read path — for real, not as scaffolding:

- Real schema with migrations, real API contract, real authorisation on the path, real error handling, structured logging, config from the environment.
- Tests at the seams the design named.
- Deployable and runnable with one documented command.

Stub what the design calls for but this slice doesn't need — behind the interface the design defined, so filling it in is a swap, not a rewrite. Then list, in writing, **what the design specifies that the minimal version defers**, and the number that would trigger building it.

Building a whole app rather than designing one system? Use `/full-stack-mvp` — it takes over from Phase 7 with the UI and the production floor.
