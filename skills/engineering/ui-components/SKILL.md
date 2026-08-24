---
name: ui-components
description: Design and build reusable, accessible, production-ready UI components. Use when the user asks for a component (form, modal, table, dropdown, toast, date picker), a design-system piece, or wants existing UI made reusable, responsive, or accessible.
---

# UI Components

Build the component a senior frontend engineer would ship: a **props contract** callers can't misuse, every state designed rather than discovered in production, and accessibility built in rather than bolted on.

The discipline: **write the contract before the markup.** A component whose props were invented while typing JSX is the one that grows `isSpecialCaseForCheckout` three sprints later.

If `CONTEXT.md` exists, read it — components should be named in the project's language, not generic UI jargon.

## Phase 1 — The contract

Answer these in prose (three or four lines, not a document) before writing code:

- **Job.** One sentence. If it needs "and", you have two components.
- **Who owns the state?** Controlled (caller owns the value), uncontrolled (component owns it), or both (`value` + `defaultValue`). Pick deliberately — this is the single decision most component rewrites are caused by.
- **What does the caller supply, and what does the component decide?** Anything the caller must be able to change goes in the contract; anything they must never change stays inside.
- **What does it render into?** Inline in a form, a portal, a list row — this decides sizing, overflow and focus behaviour.
- **What is deliberately out of scope?** Say it. This is what keeps the component small.

Check for a component that already does this job before building a new one. Two 80%-similar components are worse than one with a variant.

## Phase 2 — Props design

Rules, in priority order:

1. **Composition over configuration.** Prefer `<Card><Card.Header/></Card>` or a `children`/render-prop slot over `headerTitle`, `headerIcon`, `headerAlign`. Every prop you add is a branch you maintain forever.
2. **No boolean explosion.** Three booleans make eight states, most of them nonsense. Collapse to one union: `variant: "primary" | "secondary" | "danger"`, `state: "idle" | "loading" | "error"`. Booleans are for genuinely independent switches.
3. **Make illegal states unrepresentable.** If `error` only makes sense when `status === "error"`, model it as a discriminated union, not two optional props.
4. **Extend the native element.** For anything with an HTML equivalent, spread the rest props and forward the ref (`ComponentProps<"button">`) so callers keep `aria-*`, `data-*`, `type`, `form`, and event handlers. Never re-declare `onClick` yourself.
5. **Style by token, not by escape hatch.** Expose `variant`/`size`; allow `className` for layout only. `style` overrides and deep CSS selectors into internals are how design systems die.
6. **Name from the domain, not the mechanism.** `emptyMessage`, not `noDataTextString`.

Callbacks report what happened (`onValueChange`), never what to do (`shouldCloseAfterSelect`).

## Phase 3 — Design every state

Walk the matrix explicitly. Anything you skip becomes a production bug:

- [ ] **Empty** — no data yet, with a real message and (where it fits) the action that fills it. Never a bare blank box.
- [ ] **Loading** — first load vs refetch are different: skeletons for first load, a non-blocking indicator for a refetch that already has data. Match skeleton shape to real content so layout doesn't jump.
- [ ] **Partial** — some fields missing, optional data absent, image failed to load.
- [ ] **Error** — what went wrong in the user's language, plus the recovery action (retry, undo, go back). Never a dead end.
- [ ] **Success / populated** — the boring path.
- [ ] **Disabled / read-only** — and *why*, communicated (a disabled button with no explanation is a support ticket).
- [ ] **Too much** — 500-character name, 10 000 rows, 40 tags. Decide: truncate, wrap, scroll, virtualise, paginate.
- [ ] **Too little** — one item where the design assumed a grid of nine.
- [ ] **Slow and offline** — request pending for 10s, request failed with no network. Optimistic updates need a defined rollback.
- [ ] **Interrupted** — double submit, unmount mid-request, rapid re-select. Guard against the second click and cancel stale responses.

## Phase 4 — Accessibility floor

Non-negotiable. These are defects, not enhancements:

- [ ] **Semantic element first.** `button`, `a`, `label`, `input`, `table`, `dialog`. A `div` with a click handler fails keyboard, screen reader, and browser defaults at once. Reach for ARIA only when no element exists.
- [ ] **Keyboard-complete.** Every action reachable and operable without a mouse: Tab order matches visual order, Enter/Space activate, Escape dismisses, arrow keys move within composite widgets (menu, tabs, listbox).
- [ ] **Visible focus.** Never remove the outline without replacing it with something at least as visible.
- [ ] **Focus management.** Move focus into a dialog on open, trap it while open, return it to the trigger on close. Never leave focus on a removed node.
- [ ] **Accessible name for every control**, including icon-only buttons (`aria-label`) and inputs (a real `<label>`, not a placeholder).
- [ ] **State exposed programmatically** — `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-describedby` for the error text.
- [ ] **Live regions** for async announcements (toasts, validation, "3 results") so screen-reader users learn what sighted users just saw.
- [ ] **Contrast** at 4.5:1 for text, 3:1 for UI boundaries and focus rings — including the disabled and dark-mode variants.
- [ ] **Reduced motion** honoured (`prefers-reduced-motion`) for anything that animates.

For genuinely hard widgets — combobox, date picker, menu, dialog — build on an accessible headless primitive rather than hand-rolling the ARIA pattern. Hand-rolled comboboxes are almost always broken for real assistive-tech users.

## Phase 5 — Responsive

- Respond to the **container**, not the viewport, wherever the component can appear in more than one column width.
- No fixed heights on anything containing text; text scales and translations run 30% longer.
- Touch targets at least 44×44 CSS px, with real spacing between adjacent destructive actions.
- Test at 320px wide and at 200% browser zoom — the two cheapest ways to find broken layouts.
- Overflow has an owner: decide per component whether long content truncates (with a title/tooltip), wraps, or scrolls.

## Phase 6 — Deliver

Ship with:

1. **The component**, typed, with no `any` on the public props.
2. **Usage examples** — the common case, plus the two the props were designed for (a controlled example, an error/empty example). Real code that compiles, not prose.
3. **Tests at the interface** — render, interact the way a user does (role/label queries, keyboard), assert the visible result. Never assert on internal state or class names. Reach for `/tdd` when the behaviour is non-trivial.
4. **A one-line note of what it deliberately doesn't do**, so the next person composes instead of adding a prop.

### Done when

- [ ] Every state in Phase 3 is either implemented or explicitly ruled out in writing.
- [ ] The Phase 4 checklist passes — keyboard-walked by you, not assumed.
- [ ] No prop exists that a caller can't reach from the examples, and no example needs a prop that doesn't exist.
- [ ] It works at 320px and at 200% zoom.
