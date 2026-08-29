# Implementation Plan Template

This file is written for an agent (or a developer) to execute against, not for a human reader skimming for context — that's what the ticket's "Technical Instructions" section is for. Where the ticket stays lightweight, this goes concrete: real file paths, real function/module names, ordered steps.

```markdown
# Implementation Plan: [Ticket Title]

**Linked ticket:** [Ticket.md / ticket URL]

## Preconditions
- [Anything that must be true before starting — env setup, feature flags, access, migrations that must run first.]

## Affected Areas
- [Repo/package/service] — [file or module paths, as concretely as known]
(If Cross-Repo Scope in the ticket is Yes, list every affected repo here explicitly.)

## Steps
1. [Concrete, ordered, executable step. Reference exact files/functions where known.]
2. ...

Each step should be small enough that "done" is unambiguous. If a step is genuinely exploratory (e.g. "determine the right library"), say so explicitly rather than presenting it as a known action.

## Testing Approach
- [Unit/integration/e2e coverage expected for this change, mapped to the ticket's Acceptance Criteria items where possible.]

## Rollback / Flag Strategy
- [How this change is reverted or disabled if something goes wrong. "N/A — trivial revert" is a valid answer if true.]

## Open Questions for the Implementer
- [Anything the planner couldn't resolve with confidence — mirror relevant items from the ticket's Risks/Unknowns, but implementation-specific ones only.]
```

## Notes

- Don't restate the User Story, Description, or Acceptance Criteria here — link to the ticket instead. Duplication is where these two documents drift out of sync.
- If the scope detection (Step 3 in SKILL.md) found cross-repo impact, this file must enumerate the other repo(s) and what changes there — don't leave it implicit.
