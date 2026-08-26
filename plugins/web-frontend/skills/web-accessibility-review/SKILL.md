---
name: web-accessibility-review
description: Use when writing or reviewing any new page, form, or interactive Vue component — WCAG 2.2 AA checklist covering semantic HTML, ARIA, keyboard navigation, focus management, and color contrast. Run this before considering frontend work done, not as an afterthought.
---

# Web accessibility review (WCAG 2.2 AA)

SMB client sites are public-facing and often have a legal obligation (ADA/EN
301 549) to be accessible — this isn't optional polish.

## Semantic HTML first

Reach for the native element before reaching for ARIA:

- `<button>` for anything clickable that performs an action, not
  `<div @click>`. A `<div>` needs `role`, `tabindex`, and keydown handling
  to match what `<button>` gives you for free.
- `<a href>` for navigation, `<button>` for actions — don't use one for the
  other's job.
- One `<h1>` per page; headings (`h1`-`h6`) form a real outline, don't skip
  levels for visual sizing (use CSS for that).
- `<nav>`, `<main>`, `<header>`, `<footer>` landmarks instead of generic
  `<div>`s for page structure.

## Forms

- Every input has a `<label for>` (or wraps the input) — a `placeholder` is
  not a label.
- Group related inputs (e.g. an address) in `<fieldset>` + `<legend>`.
- Validation errors are associated with their field via
  `aria-describedby`, and the error is announced (see live regions below),
  not conveyed by color/icon alone.
- Required fields are marked with `required`/`aria-required`, not just a
  visual asterisk.

## Keyboard navigation

- Everything clickable is reachable and operable via `Tab` and `Enter`/
  `Space` — test by unplugging the mouse, not just reading the code.
- Focus order follows visual/reading order (avoid `tabindex` values above
  `0`, which reorder focus and usually indicate a layout problem instead).
- Custom components (modal, dropdown, tabs) implement the expected keyboard
  pattern for that widget (e.g. `Escape` closes a modal, arrow keys move
  between tabs) — follow the WAI-ARIA Authoring Practices pattern for the
  widget rather than inventing one.
- Modals/dialogs trap focus while open and return focus to the trigger
  element on close.

## Visible focus

Never `outline: none` without replacing it with an equally visible custom
focus style. If you can't see where keyboard focus is, neither can a
keyboard user.

## ARIA — only when semantic HTML can't do it

- `aria-label`/`aria-labelledby` for controls whose visible text isn't
  descriptive enough (an icon-only button needs `aria-label`).
- `aria-live="polite"` region for async status updates (form submitted,
  item added to cart) that aren't otherwise announced.
- `aria-expanded`/`aria-controls` on disclosure/dropdown triggers.
- Don't add ARIA roles to elements that already have the right implicit
  role — redundant ARIA is a common source of screen-reader bugs.

## Color & contrast

- Text contrast ratio ≥ 4.5:1 (normal text) / 3:1 (large text ≥ 18pt or
  bold ≥ 14pt) against its background.
- Color is never the only signal (error states, required fields, links in
  body text also need an underline/icon/text cue, not just a color change).

## Images & media

- Every `<img>` has `alt`; decorative images use `alt=""` (not omitted —
  omitted `alt` is announced as the filename by some screen readers).
- Video has captions; audio-only content has a transcript.

## Review checklist

- [ ] Tabbed through the feature with no mouse; everything is reachable and
      operable.
- [ ] Every form input has a real `<label>`.
- [ ] Focus is visible at every stop.
- [ ] Custom widgets (modal/dropdown/tabs) implement the standard keyboard
      pattern for that widget.
- [ ] Text meets contrast minimums; no information conveyed by color alone.
- [ ] Images have appropriate `alt` text.
