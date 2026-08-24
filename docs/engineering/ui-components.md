Quickstart:

```bash
npx skills add mattpocock/skills --skill=ui-components
```

```bash
npx skills update ui-components
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/ui-components)

## What it does

`ui-components` builds the UI component a senior frontend engineer would ship — a reusable, accessible, production-ready one — by deciding its props contract, designing every state it can be in, and clearing an accessibility floor before it's called done.

It writes the **contract before the markup**. The props a component exposes are decided deliberately, up front, as the thing callers are allowed to change; a component whose props were invented while typing JSX is the one that grows `isSpecialCaseForCheckout` three sprints later.

## When to reach for it

Type `/ui-components`, or the agent reaches for it automatically when a task fits — it fires when you ask for a component, a design-system piece, a form, modal, table or dropdown, or when you want existing UI made reusable, responsive, or accessible.

Reach for it whenever UI is going to be used more than once, or by more than one person. Asked to fix an *existing* component rather than build a new one, it enters at the state matrix and the accessibility floor and leaves the props contract alone. For a throwaway you're building to *see* what a UI should look like — several variations to choose between — use [prototype](https://aihero.dev/skills-prototype) instead: that code is meant to be deleted, this code is meant to be maintained.

## The state matrix is the work

Most component bugs aren't logic errors; they're states nobody designed. So the skill walks an explicit matrix — empty, loading (first load vs refetch), partial, error, success, disabled, too much content, too little, slow, offline, interrupted — and each one is either implemented or ruled out in writing. Nothing gets discovered in production.

Its props rules follow the same instinct: composition over configuration, no boolean explosion (three booleans make eight states, most of them nonsense), illegal states made unrepresentable, and the native element extended rather than re-declared so `aria-*` and `type` and the ref survive.

Accessibility is a **floor**, not a phase — semantic element first, keyboard-complete, focus managed, every control named, state exposed programmatically. Those are defects when missing, not enhancements. And for the genuinely hard widgets (combobox, date picker, menu), it tells you to build on an accessible headless primitive rather than hand-rolling ARIA.

## It's working if

- It states the component's job, state ownership, and what's out of scope before writing code.
- Empty, loading, and error states exist in the delivered component without you asking.
- It keyboard-walks the component rather than assuming the keyboard path works.
- The usage examples compile and cover the controlled case and the error/empty case.

## Where it fits

`ui-components` is a reach-for-it-anytime standalone that other skills pull in: [full-stack-mvp](https://aihero.dev/skills-full-stack-mvp) invokes it for the shared pieces of an MVP's screens, and it hands non-trivial behaviour to [tdd](https://aihero.dev/skills-tdd) for testing at the interface. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
