---
name: full-stack-mvp
description: Build a complete, production-ready application from scratch — backend and user interface: architecture, file structure, database schema, API endpoints, UI, and working code. Use when the user wants a new app, product, SaaS or clone built end to end from zero, a greenfield project scaffolded, or a startup MVP that has to be real rather than a demo.
---

# Full-Stack MVP

Build a whole application the way a senior full-stack engineer would ship a startup's first version: designed first, then built — small in scope, but **production-ready in kind**. Real auth, real migrations, real error handling, deployable.

The defining constraint: **one core loop, built properly.** MVP is a limit on *scope*, never on *quality*. The failure this skill exists to prevent is the demo that has six half-features, no auth, no migrations, and has to be thrown away the week it gets users.

Designing one system rather than building a whole app? Use `/system-design`. When this backend needs real scale thinking, pull that skill's numbers work (its Phase 1) into Phase 2 here and its failure-mode pass (its Phase 6) into Phase 6 — don't run both skills end to end.

## Phase 1 — Name the core loop

One sentence: the single thing a user must be able to do for this product to mean anything ("a host publishes a listing and a guest books it"). Then:

- List the steps of that loop. **That list is v1.**
- Everything else — settings pages, admin panels, notifications, teams, billing, dark mode — goes on a written **deferred** list. Don't argue about it; write it down and move on.
- Name who the users are and what each may see and do. Roles decided now cost nothing; roles retrofitted cost a rewrite.

If the user hasn't given you enough to write this, ask — or tell them to run `/grill-with-docs`, which is user-invoked so you can't fire it yourself. Building the wrong loop beautifully is the most expensive outcome available.

## Phase 2 — Choose a boring stack

Default: **one deployable app, one relational database.** Justify every addition against the core loop, not against a future. Queues, caches, search clusters, microservices and separate BFFs are all "later" until a real number says otherwise (`/system-design` Phase 1 for those numbers).

State the stack and the three or four decisions that follow from it (rendering model, auth approach, ORM/migrations, hosting) in a few lines. Record genuinely hard-to-reverse ones as ADRs — reach for `/domain-modeling` if this is a repo that keeps them.

## Phase 3 — Schema first

The database outlives every other decision, so it goes first:

- Entities and relationships from the core loop's nouns, named in the domain's language.
- The **ownership key** (`user_id`/`org_id`) on every row that belongs to a user or tenant.
- Constraints in the database, not just in code: not-null, unique, foreign keys, checks. The app is not the only thing that will ever write to this table.
- Indexes for the queries the loop performs.
- **Migrations from commit one**, applied by tooling. Never a hand-edited schema.
- Seed data that makes the app runnable and testable locally in one command.

## Phase 4 — API contract

Define the endpoints the loop needs and nothing else. For each: method, path, auth requirement, request and response shape, and error cases. Then the cross-cutting rules — validation at the edge with a schema (never trust a client), consistent error shape, pagination on every collection, idempotency on anything a client may retry.

Type-share between server and client if the stack allows it; a generated or shared type is worth more than a document.

## Phase 5 — UI architecture

- **Routes**, matching the loop's steps.
- **Data loading strategy** — where fetching happens, how loading and error states surface, what's cached and how it's invalidated after a mutation. Decide this once, globally; inconsistent data loading is the most common source of MVP jank.
- **State ownership** — server state (from the API, cached), URL state (filters, tabs, pagination — put it in the URL so it's shareable), and local UI state. Keep them separated.
- **Layout and component inventory** for the loop's screens. Build the shared pieces with `/ui-components` so states and accessibility are designed rather than discovered.
- **The empty and first-run experience.** A brand new account sees an empty app — design that screen, it's the one every user sees first.

## Phase 6 — The production floor

Cheap now, expensive later. Split by what you can actually deliver:

**In the repo, always:**

- [ ] **Input validation at every boundary**, with the schema as the single source of truth.
- [ ] **Error handling** — no unhandled rejections, no leaked stack traces to clients, a real 404/403/500 path, and something the user can do next.
- [ ] **Structured logging** with request ids.
- [ ] **Config from the environment**, no secrets in the repo, an `.env.example` that documents every variable.
- [ ] **Migrations** runnable in CI and in deploy.
- [ ] **Tests at the seams** — the core loop end to end, plus unit tests for the domain rules. Name the seams and confirm them with the user before writing tests (`/tdd`). Not 100% coverage; the loop must be protected.
- [ ] **CI config** running typecheck, lint, tests, build.
- [ ] **Accessibility floor at the page level** — landmarks and heading order, a unique `<title>` per route, focus moved to the heading on navigation, form errors associated with their inputs. Components are `/ui-components`' job; pages are this one's.
- [ ] **README** — how to run it, how to test it, how to deploy it.

**Needs infrastructure you don't have — write the config, then tell the user what to provision:** error-reporting DSN, deploy target and pipeline, health check. Never invent placeholder credentials.

**Scale to the product:** authentication and **authorisation on every endpoint** (ownership checked server-side, never by hiding UI) are non-negotiable the moment there is more than one user or any non-public data. If there genuinely isn't — a single-user local tool — say so in writing rather than building an auth system nobody logs into.

## Phase 7 — Build in vertical slices

Never layer-by-layer. Each slice goes schema → failing test → endpoint → UI and **runs end to end** before the next begins, so the app is demoable at every commit and integration risk is paid down first. Order the slices so the riskiest or most uncertain part of the loop is slice one.

Domain rules go test-first through `/tdd` (red before green — don't invert it for the schema-to-UI order above); the UI layer is tested after the slice runs. Close out with `/code-review` before calling it done.

## Deliver

1. **Architecture** — stack, the shape of the system, and the decisions with their reasons.
2. **File structure** — annotated tree; every folder's purpose in one line.
3. **Database schema** — with migrations.
4. **API endpoints** — the contract from Phase 4.
5. **UI architecture** — routes, data loading, state ownership.
6. **Complete, running code** — installable and runnable from the README with no undocumented steps.
7. **The deferred list** — what you consciously left out, and the signal that says build it.

**Scalable by default, not scaled prematurely:** stateless app tier, indexed queries, no N+1s, pagination everywhere, background work behind an interface you can move to a queue. That's enough headroom for the first real users, and it doesn't cost the MVP a week.
