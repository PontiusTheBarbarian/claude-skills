# Validation Checklist

A structural check of the drafted ticket, run as Step 6 — after the security
assessment is written, before the scrutiny subagent sees it. It catches
mechanical gaps (missing sections, headings that shouldn't exist, leftover
placeholders) so Step 7 can spend its attention on substance.

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
FAIL  unlisted heading            → line 58: "## Rollout Plan"
FAIL  placeholder "TBD"           → line 31: "Retry limit: TBD"
```

## 1. Required sections

All nine must be present as `##` headings, with the exact wording below, in this
order. A section that is genuinely not applicable keeps its heading and says
"N/A" plus a reason — a missing heading is a failure even when the section would
have been empty.

- [ ] `## User Story`
- [ ] `## Description`
- [ ] `## Acceptance Criteria`
- [ ] `## Human Test Instructions`
- [ ] `## Risks / Unknowns`
- [ ] `## Technical Instructions`
- [ ] `## Documentation Requirements`
- [ ] `## Review / Sign-off Required`
- [ ] `## Scrutiny`

Check the order too, not just presence: if a heading appears out of sequence,
that's a failure — `references/ticket-template.md` fixes the order.

## 2. No unlisted sections

The list above is closed. Extract every heading in the file and compare against
it — don't scan for ones that look out of place, enumerate:

```bash
grep -n "^#\{1,6\} " Ticket.md
```

- [ ] Exactly one `#` heading (the title) and exactly the nine `##` headings
      above. Any other `##` heading is a failure.
- [ ] **Zero `###` or deeper headings anywhere in the ticket.** Sub-headings are
      the most common way an extra section sneaks in past a check that only
      looks at `##`.
- [ ] No section that was removed from the template reappears under any name:
      `Cross-Repo Scope`, `Security Assessment`, `Skills Required`. These have
      homes elsewhere now (a sentence in Technical Instructions,
      `SecurityAssessment.md`, and nowhere respectively).

On a hit, the fix is one of two things, and "leave it, it's useful context" is
not among them: fold the content into the closest listed section as a sentence
or two, or cut it. Content that survives neither test was never ticket content.

Bold group labels inside Acceptance Criteria (`**Cancellation flow**`) are not
headings and are expected — don't flag them.

## 3. Section shape

- [ ] **User Story** is three lines, one each for `**As a**`, `**I want**`,
      `**So that**` — not a single flowing sentence. Quote all three lines. The
      first two end in a hard line break that survives rendering (two trailing
      spaces, a backslash, or `<br>`); a bare newline that collapses into one
      paragraph is a failure.
- [ ] **Acceptance Criteria** bullets all sit under a bold group label. A bullet
      before the first label, or a bare ungrouped list, is a failure.
- [ ] **Acceptance Criteria** has four or fewer groups. More than that is a
      failure to merge — either combine groups or flag in Risks / Unknowns that
      the ticket should be split.
- [ ] **Technical Instructions** mentions other repositories only if the scope
      detection found genuine cross-repo work, and then in one sentence with no
      evidence, verdict, or check list attached. Scope commentary on a
      single-repo change is a failure.

## 4. No placeholder text

None of these may survive into the delivered ticket. Quote the surrounding line
for any hit.

- [ ] `TBD`, `TODO`, `XXX`
- [ ] `[Ticket Title]`
- [ ] `[role]`, `[capability]`, `[benefit]`
- [ ] `[Group label]`
- [ ] `[Filled in after ...]`, `[Criterion ...]`
- [ ] `Pending — completed in Step 5` (the Step 4 marker; Review / Sign-off
      should hold a real answer by now)

Template scaffolding that reads as an instruction to the writer rather than
information for the reader is a placeholder even if it isn't on this list.

## 5. Content completeness

- [ ] **Acceptance Criteria** are stated so that each one can be observed as
      true or false. "Works correctly" is not checkable; "returns 409 when the
      order is already cancelled" is.
- [ ] Each Acceptance Criteria group label names a behaviour area specific to
      this ticket. `**Requirements**` or `**Other**` is a failure — it's a label
      that would fit any ticket, which means it isn't grouping anything.
- [ ] **Risks / Unknowns** ends with a `**High / Medium / Low**` confidence
      rating and a one-line reason.
- [ ] **Review / Sign-off Required** agrees with the Recommended Sign-off line
      in `SecurityAssessment.md`. If that file says CSO review is required and
      the box is unchecked, that's a failure; the reverse needs a stated reason.
- [ ] **Human Test Instructions** scenarios are numbered, and each has Steps and
      an Expected result a reader could pass or fail without asking a question.

## 6. Companion files

- [ ] `SecurityAssessment.md` exists next to `Ticket.md`, links back to the
      ticket, and marks each checklist item Applicable or Not Applicable **with
      a reason**. A bare "Not Applicable" fails — it's indistinguishable from a
      skipped check.
- [ ] If an implementation plan was requested, `ImplementationPlan.md` exists
      and its Affected Areas names every repo involved.
- [ ] All files are in the current working directory, not a subdirectory created
      for them.

## On failure

Fix the ticket and re-run the affected items — don't note the gap and move on,
and don't hand a failing draft to Step 7 with an apology attached. The scrutiny
subagent's value comes from reviewing a structurally complete artifact; giving
it a draft with known holes wastes the pass on findings you already knew about.

## What this doesn't do

Everything here is mechanical: is the heading there, is it one of the nine, is
the placeholder gone. None of it judges whether the ticket is *correct* —
whether the acceptance criteria match the ask, whether the plan is achievable,
whether the security assessment reached the right conclusion. That's Step 7's
job, and it's done by a subagent that didn't draft the ticket precisely because
this check couldn't be trusted to do it.
