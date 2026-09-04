# Engineering

Skills I use daily for code work.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[ask-matt](./ask-matt/SKILL.md)**: Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./grill-with-docs/SKILL.md)**: Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./triage/SKILL.md)**: Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)**: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)**: Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo.
- **[to-spec](./to-spec/SKILL.md)**: Turn the current conversation into a spec and publish it to the issue tracker.
- **[to-tickets](./to-tickets/SKILL.md)**: Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges, whether as text in a local file or as native blocking links on a real tracker.
- **[implement](./implement/SKILL.md)**: Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[wayfinder](./wayfinder/SKILL.md)**: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on the issue tracker, resolved one at a time until the way to the destination is clear.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[prototype](./prototype/SKILL.md)**: Build a throwaway prototype to answer a design question: a single shareable HTML file for state/logic, or several toggleable UI variations.

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)**: Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./research/SKILL.md)**: Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./tdd/SKILL.md)**: Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./domain-modeling/SKILL.md)**: Actively build and sharpen a project's domain model by challenging terms, stress-testing with scenarios, and updating `CONTEXT.md` and ADRs inline.
- **[codebase-design](./codebase-design/SKILL.md)**: Shared discipline and vocabulary for designing deep modules: small interfaces, clean seams, testable through the interface.
- **[code-review](./code-review/SKILL.md)**: Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/spec?), run as parallel sub-agents.
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)**: Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation, never `--abort`.
- **[wizard](./wizard/SKILL.md)**: Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.
- **[system-design](./system-design/SKILL.md)**: Design a scalable system: data model, API contract, data flow, caching, failure modes, then build the minimal version of it that could run in production.
- **[full-stack-mvp](./full-stack-mvp/SKILL.md)**: Build a complete application from scratch: one core loop, built production-ready, in vertical slices: schema, API, UI architecture, and running code.
- **[ui-components](./ui-components/SKILL.md)**: Build reusable, accessible, production-ready UI components: props contract first, every state designed, accessibility as a floor rather than a phase.
- **[clean-architecture](./clean-architecture/SKILL.md)**: Restructure tangled code into separated concerns and a dependency rule that points inward: behaviour proven unchanged, one verified step at a time.
- **[optimizing-performance](./optimizing-performance/SKILL.md)**: Profile-first work on speed, memory and scale: baseline, find the dominant cost, one change at a time, keep only what the numbers justify.
- **[production-debugging](./production-debugging/SKILL.md)**: Investigate a failure hitting real users: mitigate first, harvest the evidence before it rotates away, instrument production safely, then fix and write the post-incident note.
- **[onboarding-audit](./onboarding-audit/SKILL.md)**: Get oriented in an unfamiliar codebase by tracing real paths end to end, then report structural, duplication, performance and maintainability findings ranked by risk × churn.
- **[four-hats](./four-hats/SKILL.md)**: Run one piece of work through Architect → Engineer → Reviewer → Optimizer, with the review and optimisation hats as context-isolated sub-agents.
- **[agent-safety](./agent-safety/SKILL.md)**: Install cross-harness guardrails that block dangerous agent shell commands (git push/reset/clean, curl|bash) in Cursor Grok, Claude Code, and via AGENTS.md for Codex.
