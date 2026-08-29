# Artifact Security Review (subagent instructions)

Adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s `--pr` diff-scoped review mode (free, MIT-compatible, uses only free CLI tools). That skill reviews a git diff without needing a full-repo scan first; this version applies the same *scoped, single-pass, isolated-judgment* structure to reviewing **`Ticket.md` and `ImplementationPlan.md`** — because at ticket-creation time there usually isn't a diff yet, just a description of a change. This runs as Step 5 in `SKILL.md`, after the ticket/plan are drafted, and its output is written into the ticket's Security Assessment section.

**This is a design-time review, not a code scan.** It cannot catch bugs in code that doesn't exist yet — it evaluates whether the *described* approach, as written, would introduce known vulnerability classes, and whether the plan omits security work the described change would need. Say so explicitly in the report's confidence framing (mirroring the source skill's own "Confidence and Scope Disclaimers" practice) — don't let the report imply a depth of coverage it doesn't have.

## Input

- `Ticket.md` (required)
- `ImplementationPlan.md` (if it exists)
- Read access to the target repo, for the scoped context-gathering in Step 1–2 below — but this is not a full-repo scan; reads stay bounded to what the steps below specifically point at.

## Steps

### Step 0: Identify what's actually being reviewed

Read `Ticket.md`'s Description, Technical Instructions, and Cross-Repo Scope sections, plus `ImplementationPlan.md`'s Affected Areas if it exists. Extract: what files/modules/services the change touches (as named, not guessed), what kind of change this is (new endpoint, data model change, dependency add, config change, etc.), and whether any of it is genuinely undetermined ("approach TBD" in the plan) — undetermined items get a **Cannot Assess** note, not a guess.

### Step 1: Cheap structural context

Check the repo's manifest files (`package.json`, `pyproject.toml`, etc.) to know the actual language/framework — this determines which OWASP checklist items are even reachable (e.g. no database dependency present means SQLi items are Not Applicable, not just unlikely).

### Step 2: Scoped context at the named locations only

For each file/module the ticket or plan names as affected, grep that specific area (not the whole repo) for existing patterns: how is auth currently handled nearby, is there existing input validation to extend or bypass, does this area already have a rate limiter or logging in place. This mirrors the source skill's "bound reads to the diff plus whatever a repo-wide grep specifically points to" — the grep target here is the *named affected area*, not the whole codebase.

### Step 3: Evaluate against the OWASP-style checklist

Read `references/security-checklist.md` and evaluate each item against what's *described* in the ticket/plan (not against code, since none may exist yet). For each Applicable item, note specifically what about the description makes it applicable, and whether the plan's stated approach already addresses it or leaves it open.

### Step 4: Flag description-level risk patterns

Beyond the checklist, watch for these in the ticket/plan text itself:
- A described approach that names a known-risky pattern directly (e.g. "store the token in localStorage," "build the query by concatenating the input," "shell out with the user-provided filename").
- A new externally-reachable capability (new endpoint, new webhook, new file upload) with no corresponding mention of auth, validation, or rate limiting anywhere in the ticket or plan.
- A dependency addition (if the plan lists one) with no mention of why it's needed or where it comes from.

### Step 5: Validate findings in isolation

Before finalizing, re-read each flagged item against the artifact text one more time, from scratch, as if reviewing someone else's findings — don't let the pattern-matching in Step 4 stand uncontested. This mirrors the source skill's finder → judgment isolation boundary: a finding that looked risky on first pass may be explicitly addressed two paragraphs later in the plan. Downgrade or drop findings that turn out to be already covered.

### Step 6: Write the report

Output in this format:

```
## Artifact Security Review

**Scope:** Design-time review of Ticket.md [+ ImplementationPlan.md]. Not a code scan — no code exists yet for most of what's described here.

### OWASP-style Checklist
[Each item: Applicable / Not Applicable, one-line reason, tied to what in the ticket makes it so.]

### Description-Level Findings
[Pattern-level risks found in Step 4, each with: what was found, where (which section/line of which file), why it matters, suggested mitigation.]

### Cannot Assess
[Anything genuinely undetermined in the plan that blocks a real assessment — e.g. "approach TBD" for the auth mechanism.]

### Recommended Sign-off
[Yes/No on whether CSO review should be required, per the threshold rule in security-checklist.md, with the specific findings driving that recommendation.]
```

This output gets pasted into `Ticket.md`'s Security Assessment section by the orchestrating skill (see `SKILL.md` Step 5) — write it so it reads correctly standalone there, not as a message to a person running the review.

## What NOT to Do

- Don't scan the whole repository. If Step 2's scoped greps don't answer a question, note it as a limitation rather than expanding scope — that's the entire point of adapting the diff-scoped mode instead of the full pipeline.
- Don't invent code-level findings ("this function has a SQL injection vulnerability") when no code exists yet — findings must be about the *described approach*, worded as design-time risk, not as a confirmed code defect.
- Don't skip Step 5. A finding that isn't re-validated against the full artifact text is exactly the kind of confident-but-wrong finder output the isolation step exists to catch.
