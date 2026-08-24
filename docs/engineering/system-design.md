Quickstart:

```bash
npx skills add mattpocock/skills --skill=system-design
```

```bash
npx skills update system-design
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/system-design)

## What it does

`system-design` designs a scalable system — data model, API contract, component structure, data flow, caching, failure modes — and then builds the smallest version of that design that could genuinely run in production.

It insists on **numbers before boxes**: every component, split and cache must trace back to a figure from the requirements phase. Architecture diagrams drawn before the load is known are decoration, and they're how teams end up operating six services for a workload one would carry.

## When to reach for it

Type `/system-design`, or the agent reaches for it automatically when a task fits — it fires when you ask to design a system, service, backend or architecture, or ask about data flow, API design, database schema, caching strategy, or handling scale.

Reach for it for one system or service that has to hold up. For a whole application including its UI and production floor, use [full-stack-mvp](https://aihero.dev/skills-full-stack-mvp), which takes over where this skill's build phase begins.

## Both halves, or neither

A design with no running slice is a document; a slice with no design is a prototype. So the skill does the design work — requirements as numbers, access patterns driving the schema, the API contract with errors and idempotency as first-class parts of it, the write/read/async paths, caching where **invalidation is the design and the cache is trivial**, and a line per dependency on what happens when it's slow and when it's gone — and then builds one **vertical slice** for real: real migrations, real authorisation, real error handling, deployable.

Its default architecture is one deployable service and one database, and every addition has to name the number that forces it. Each split buys scale and costs a network hop, a failure mode, a deploy, and a debugging session.

## It's working if

- Missing requirements come back as explicit written assumptions, not silent defaults.
- The schema is derived from a listed set of queries, each with an index.
- Every cache specifies layer, key, TTL, invalidation event, and miss behaviour — or isn't added.
- The built slice runs with one documented command, and what the design defers is written down with its trigger.

## Where it fits

`system-design` is a reach-for-it-anytime standalone that starts where an idea has become concrete. Its only stated handoff is to [full-stack-mvp](https://aihero.dev/skills-full-stack-mvp), which takes over where its build phase begins and adds the UI and production floor; that skill borrows this one's numbers work in return, whenever an MVP's backend has to hold up. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
