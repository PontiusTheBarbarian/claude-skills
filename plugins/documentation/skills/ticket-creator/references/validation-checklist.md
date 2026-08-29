# Validation Checklist

A structural check of the drafted ticket, run as Step 7 — after the Security
Assessment and Skills Required table are filled in, before the scrutiny subagent
sees it. It catches mechanical gaps (missing sections, leftover placeholders, an
unfilled table) so Step 8 can spend its attention on substance.

**This is a self-check, and self-checks fail by asserting rather than
verifying.** So the rule for every item below is the same: *quote the line from
the ticket that satisfies it.* An item you cannot quote is a failing item, not a
judgment call. Do not write "all sections present" — write out what you found.
This is deliberately more tedious than reading the ticket and forming an
impression, because the impression is exactly what's unreliable here.

Report results as a compact list, one line per item, in this form:

```
PASS  ## Acceptance Criteria      → line 24
FAIL  ## Human Test Instructions  → not found
FAIL  placeholder "TBD"           → line 31: "Retry limit: TBD"
```

## 1. Required sections

All twelve must be present as `##` headings, with the exact wording below, in
this order. A section that is genuinely not applicable keeps its heading and
says "N/A" plus a reason — a missing heading is a failure even when the section
would have been empty.

- [ ] `## User Story`
- [ ] `## Description`
- [ ] `## Acceptance Criteria`
- [ ] `## Human Test Instructions`
- [ ] `## Risks / Unknowns`
- [ ] `## Technical Instructions`
- [ ] `## Cross-Repo Scope`
- [ ] `## Security Assessment`
- [ ] `## Skills Required`
- [ ] `## Documentation Requirements`
- [ ] `## Review / Sign-off Required`
- [ ] `## Scrutiny`

Check the order too, not just presence: if a heading appears out of sequence,
that's a failure — `references/ticket-template.md` fixes the order.

## 2. No placeholder text

None of these may survive into the delivered ticket. Quote the surrounding line
for any hit.

- [ ] `TBD`, `TODO`, `XXX`
- [ ] `[Ticket Title]`
- [ ] `[role]`, `[capability]`, `[benefit]`
- [ ] `[Filled in after ...]`, `[Bullet list ...]`
- [ ] `Pending — completed in Steps 5–6` (the Step 4 marker; both sections
      should be real content by now)

Template scaffolding that reads as an instruction to the writer rather than
information for the reader is a placeholder even if it isn't on this list.

## 3. Content completeness

- [ ] **Cross-Repo Scope** contains a line matching `**Verdict:** Yes` / `No` /
      `Unclear`, and the evidence beneath it names what was actually checked.
      A verdict with no supporting evidence fails — Step 3 requires the checks
      to have been run.
- [ ] **Skills Required** accounts for every entry in
      `assets/skills-config.yaml` — each one either has a table row or appears on
      the "Evaluated and not required" line. Count them against the config; an
      entry in neither place is a failure, since it's indistinguishable from a
      trigger that was never evaluated.
- [ ] Every table row's justification names something specific in this ticket.
      A row that just restates the trigger condition fails — that's a copy, not
      an evaluation.
- [ ] **Security Assessment** marks each checklist item Applicable or Not
      Applicable **with a reason**. A bare "Not Applicable" fails — it's
      indistinguishable from a skipped check.
- [ ] **Acceptance Criteria** are stated so that each one can be observed as
      true or false. "Works correctly" is not checkable; "returns 409 when the
      order is already cancelled" is.

## On failure

Fix the ticket and re-run the affected items — don't note the gap and move on,
and don't hand a failing draft to Step 8 with an apology attached. The scrutiny
subagent's value comes from reviewing a structurally complete artifact; giving
it a draft with known holes wastes the pass on findings you already knew about.

## What this doesn't do

Everything here is mechanical: is the heading there, is the table filled, is the
placeholder gone. None of it judges whether the ticket is *correct* — whether
the acceptance criteria match the ask, whether the plan is achievable, whether
the security assessment reached the right conclusion. That's Step 8's job, and
it's done by a subagent that didn't draft the ticket precisely because this
check couldn't be trusted to do it.
