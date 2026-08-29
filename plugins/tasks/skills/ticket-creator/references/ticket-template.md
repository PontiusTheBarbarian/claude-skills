# Ticket Template

This is the complete, closed set of sections a ticket may contain, in this order.

**The heading list below is a ceiling, not a floor.** Do not add sections. Do not
add `###` sub-headings inside a section. If content doesn't fit one of these
headings, it either belongs in the closest existing section as a sentence or two,
or it doesn't belong in the ticket at all — and the second is the more common
answer. Interesting context, background reading, alternatives considered,
open questions to the author, a glossary, a rollout plan: none of these get a
heading. Fold them in or cut them.

Every heading below is always present. A section with nothing to say keeps its
heading and says "N/A" plus a one-line reason, so it reads as considered rather
than forgotten. Eight sections, every time — no more, no fewer.

```markdown
# [Ticket Title]

## User Story
**As a** [role]  
**I want** [capability]  
**So that** [benefit]

## Description
A concise, targeted summary of exactly what is being asked and why. No more than ~150 words. No restating the user story in different words — add information, don't paraphrase.

## Acceptance Criteria
**[Group label]**
- [Criterion. Independently verifiable. No item should require another item to be interpreted.]
- [Criterion.]

**[Group label]**
- [Criterion.]

## Human Test Instructions
A walkthrough of every scenario a human needs to manually verify to confirm the acceptance criteria are met. Be thorough — include setup steps, the exact action to take, and the exact expected result. Number the scenarios.

1. **Scenario**: ...
   **Steps**: ...
   **Expected result**: ...

## Risks / Unknowns
- [An unknown nobody could answer during drafting.] **Assumption:** [what the ticket is written to assume in the meantime, so work can start without the answer.]
- End with an overall confidence rating: **High / Medium / Low**, with a one-line reason for the rating.

## Technical Instructions
A lightweight, human-readable summary of the technical approach. Concise, light on implementation detail and code — this is not the implementation plan. If an implementation plan file exists, link to it here instead of duplicating detail.

## Documentation Requirements
- [ ] ADR
- [ ] DDR
- [ ] README update
- [ ] Other: ___
(Check all that apply. If none apply, check nothing and state "No documentation changes required" below the list.)

## Review / Sign-off Required
- [ ] Product Owner
- [ ] Designer
- [ ] Cyber Security Officer (CSO)
(Check all that apply, with a one-line reason why each checked role needs to review.)
```

## Section rules

### User Story

Three separate lines, not one sentence. Each of the first two lines ends with
two trailing spaces so the line break survives Markdown rendering. If the
destination strips trailing whitespace, use whatever hard break that renderer
supports (a backslash, or `<br>`) rather than collapsing the three lines into a
paragraph — the shape is the point.

### Acceptance Criteria

Every criterion sits under a **bold group label** — a short noun phrase naming
the behaviour area, not a heading (`**Cancellation flow**`, not
`### Cancellation flow`). Group labels are plain bold text so the ticket keeps
exactly the `##` headings listed above.

- Merge before you group. Two bullets that are always true or false together are
  one bullet. Reach for a second group only when the criteria genuinely split
  across behaviour areas.
- Two to four groups covers almost everything. More than four usually means the
  ticket should be split, which is worth saying in Risks / Unknowns.
- A single group is fine when all the criteria belong to one area — still label
  it rather than dropping to a bare list.

### Risks / Unknowns

Everything here has already been put to the user one item at a time (`SKILL.md`
Step 6) and survived it. That resolution pass is what makes this section short,
and it changes what a bullet means: not "something the drafter wasn't sure
about" but "something nobody could answer today."

- **An answered unknown is not a risk.** When the user answers one, the answer
  goes into the section it actually belongs in — an acceptance criterion, a
  sentence in Description, a line of Technical Instructions — and the bullet is
  deleted. Don't keep the bullet with the answer appended to it; a resolved
  question left in a risk list still reads as a reason to hesitate.
- **Every surviving bullet states its assumption**, on the same bullet, in the
  form `**Assumption:** ...`. This is the whole point of the section. An unknown
  with no assumption tells the reader to stop and go find someone; an unknown
  with one tells them how to proceed and what to re-check if it turns out wrong.
  A bullet you can't write an assumption for is a bullet that should have
  blocked the ticket instead of shipping in it.
- **Two things belong here that don't come from the resolution pass**: a
  cross-repo coupling whose far side couldn't be verified
  (`references/scope-detection.md`), and a security finding the ticket has to
  carry rather than fix (`SKILL.md` Step 5). Both still take an assumption.
- **"N/A — every unknown raised was resolved during drafting" is a real and
  common outcome**, not a section you failed to fill. It still carries the
  confidence rating.

The confidence rating is about the ticket, not the work: how confident you are
that building exactly what's written here produces what was asked for. Standing
assumptions push it down even when each one is individually reasonable.

### Technical Instructions

If the work touches more than one repository or independently-deployed package,
say so here in one sentence: which other repo(s) change, and who coordinates it.
No evidence, no checks listed, no verdict line — the detection procedure in
`references/scope-detection.md` decides whether the sentence is warranted, and
its working stays out of the ticket. If the work is contained to this repo,
write nothing about scope at all.

If a genuine cross-repo dependency couldn't be confirmed, that belongs in
Risks / Unknowns as an unknown, not here as a hedged sentence.

### Companion files, and what leaves no trace

The security assessment is **not** a ticket section. It's written to
`SecurityAssessment.md` next to the ticket (see `SKILL.md` Step 5). Its outcome
still drives whether the CSO box is checked under Review / Sign-off, but its
content stays out of the ticket body.

The scrutiny review (`SKILL.md` Step 8) leaves no artifact at all — no section,
no file. Its Critical and Important findings are fixed in the ticket, so the
evidence that it ran is that the ticket is better; its findings are reported to
the user in the terminal and nowhere else. A "Scrutiny" heading listing what a
reviewer said and how the drafter answered is process output, and the reader
starting this work needs the corrected ticket, not the correction history.

## Notes on filling this in

- **Scannable, not sparse.** The goal is that someone can read the whole ticket in under two minutes and understand exactly what's being asked, why, and how it'll be verified. Cut anything that doesn't serve that.
- **Size should track the feature, not the template.** A one-line config change doesn't need five Human Test Instructions scenarios; a cross-cutting feature might need six. Let real content set the length — never pad a section just to look thorough, and never compress genuinely complex risk into one bullet just to look concise.
- **When in doubt, cut.** A ticket that omits something a reader can derive is a smaller problem than a ticket nobody finishes reading. The bar for adding a paragraph is that a reader who skipped it would do the work wrong.
