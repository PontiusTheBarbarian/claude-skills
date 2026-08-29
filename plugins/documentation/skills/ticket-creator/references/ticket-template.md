# Ticket Template

This is the fixed section order for every ticket. Do not reorder, rename, or drop sections — if a section is genuinely not applicable (e.g. no designs exist), keep the heading and write "N/A" with a one-line reason, so it's clear it was considered rather than forgotten.

```markdown
# [Ticket Title]

## User Story
As a [role], I want [capability], so that [benefit].

## Description
A concise, targeted summary of exactly what is being asked and why. No more than ~150 words. No restating the user story in different words — add information, don't paraphrase.

## Acceptance Criteria
- [Bullet list. Each item independently verifiable. No item should require another item to be interpreted.]

## Human Test Instructions
A walkthrough of every scenario a human needs to manually verify to confirm the acceptance criteria are met. Be thorough — include setup steps, the exact action to take, and the exact expected result. Number the scenarios.

1. **Scenario**: ...
   **Steps**: ...
   **Expected result**: ...

## Risks / Unknowns
- What we need to be aware of, and what wasn't confirmed with high confidence.
- End with an overall confidence rating: **High / Medium / Low**, with a one-line reason for the rating.

## Technical Instructions
A lightweight, human-readable summary of the technical approach. Concise, light on implementation detail and code — this is not the implementation plan. If an implementation plan file exists, link to it here instead of duplicating detail.

## Cross-Repo Scope
**Verdict:** Yes / No / Unclear
**Evidence:** [what was checked and what was found — see references/scope-detection.md]
**If Yes:** what needs to happen in the other repo(s), and who owns coordinating that.

## Security Assessment
[OWASP-style checklist from references/security-checklist.md, each item marked Applicable/Not Applicable with a one-line reason.]

## Skills Required
| Skill | Why it applies here |
|---|---|
| [skill name from assets/skills-config.yaml] | [one line tying it to something specific in this ticket, not a restatement of its trigger] |

**Evaluated and not required:** [every other skill in the config, comma-separated] — [one line on why none of them apply].

Only skills that apply get a row. The line beneath accounts for the rest, so it's
still visible that every trigger was evaluated rather than skipped. If nothing
applies, write "None required" in place of the table and still list everything
evaluated on the line below.

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

## Scrutiny
[Filled in after the independent subagent review — see agents/scrutiny-reviewer.md. Format:]

**Findings:**
- [Issue raised] → [Resolution: fixed / acknowledged as acceptable risk, with reasoning]

**Unresolved concerns (if any):** ...
```

## Notes on filling this in

- **Scannable, not sparse.** The goal is that someone can read the whole ticket in under two minutes and understand exactly what's being asked, why, and how it'll be verified. Cut anything that doesn't serve that.
- **Size should track the feature, not the template.** A one-line config change doesn't need five Human Test Instructions scenarios; a cross-cutting feature might need six. Let real content set the length — never pad a section just to look thorough, and never compress genuinely complex risk into one bullet just to look concise.
- **No section is optional to include** — only its *content* can be "N/A." This keeps every ticket reviewable against the same checklist regardless of who wrote it.
