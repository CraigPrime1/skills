Quickstart:

```bash
npx skills add mattpocock/skills --skill=full-stack-mvp
```

```bash
npx skills update full-stack-mvp
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/full-stack-mvp)

## What it does

`full-stack-mvp` builds a whole application from scratch the way a senior full-stack engineer ships a startup's first version: architecture, file structure, database schema, API endpoints, UI architecture, and complete running code.

Its defining constraint is **one core loop, built properly** — MVP is a limit on *scope*, never on *quality*. The failure it exists to prevent is the demo with six half-features, no auth and no migrations that has to be thrown away the week it gets users.

## When to reach for it

Type `/full-stack-mvp`, or the agent reaches for it automatically when a task fits — it fires when you want a new app or product built end to end, a greenfield project, or a startup MVP that has to be real rather than a demo.

Reach for it when you're building the whole thing. For the design of one system or service that has to hold up under load, use [system-design](https://aihero.dev/skills-system-design) — this skill borrows its numbers whenever the backend needs real scale thinking.

## Prerequisites

A core loop you can name in one sentence. If the ask isn't that concrete yet, the skill sends you to [grill-with-docs](https://aihero.dev/skills-grill-with-docs) first — building the wrong loop beautifully is the most expensive outcome available.

## Scope is the only thing that's minimal

Everything outside the core loop goes on a written **deferred** list, and everything inside it gets the production floor: auth and per-endpoint authorisation, validation at every boundary, real error handling, structured logging, environment config, migrations from commit one, tests at the seams, CI, a deploy, a README. Each of those is cheap now and expensive later.

Order matters too. Schema first, because the database outlives every other decision — with the ownership key on every row from day one, since retrofitting multi-tenancy is a rewrite. Then the API contract, then UI architecture where the data-loading strategy and state ownership are decided **once, globally**, because inconsistent data loading is the most common source of MVP jank.

It builds in **vertical slices**, never layer by layer: each slice runs schema → endpoint → UI → test end to end before the next starts, so the app is demoable at every commit and the riskiest part of the loop is paid down first. Scalable by default — stateless app tier, indexed queries, no N+1s, background work behind an interface — without a week spent scaling prematurely.

## It's working if

- The core loop is written down in one sentence, with a deferred list beside it.
- Migrations and seed data exist from the first commit; the schema is never hand-edited.
- Every endpoint checks ownership server-side rather than relying on hidden UI.
- The app installs, runs, tests and deploys from the README with no undocumented steps.

## Where it fits

`full-stack-mvp` is a greenfield starting point that pulls other skills in as it goes — [system-design](https://aihero.dev/skills-system-design) for scale decisions, [ui-components](https://aihero.dev/skills-ui-components) for the shared UI pieces, [tdd](https://aihero.dev/skills-tdd) for domain rules, and [code-review](https://aihero.dev/skills-code-review) to close out. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
