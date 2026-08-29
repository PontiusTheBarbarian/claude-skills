# tasks

Skills for authoring the artifacts work starts from: a deterministic
engineering-ticket author with built-in security and scrutiny review passes, and
an interactive README author.

## Skills

| Name | Description |
|------|-------------|
| [ticket-creator](skills/ticket-creator/SKILL.md) | Runs a structured interview, detects cross-repo scope, drafts a ticket (and optional agent-targeted implementation plan), settles every risk and unknown with you, then puts the result through an independent security review and an independent scrutiny pass before writing it to a ticketing MCP or to the current directory. Triggers on "create a ticket", "draft a story", "spec out a feature". |
| [readme-creator](skills/readme-creator/SKILL.md) | Analyses a repo (structure, language, dependencies, entry points, license, CI) and drafts a tailored `README.md`, then refines it with you. Triggers on "write a README", "document this repo", "make my README better". |

### ticket-creator

The skill is deliberately thin: every judgment call is pinned to a file, so the
same ask produces the same ticket across sessions and models. The nine-step
workflow lives in [`SKILL.md`](skills/ticket-creator/SKILL.md); the rules it
follows live here:

| File | What it fixes |
|------|---------------|
| [`references/ticket-template.md`](skills/ticket-creator/references/ticket-template.md) | The eight sections a ticket may contain, in order. A closed set: sections are never dropped (a non-applicable one becomes "N/A" plus a reason) and never added, `###` sub-headings included. |
| [`references/implementation-plan-template.md`](skills/ticket-creator/references/implementation-plan-template.md) | The separate, agent-executable plan file. Concrete paths and ordered steps, so the ticket itself can stay human-readable. |
| [`references/scope-detection.md`](skills/ticket-creator/references/scope-detection.md) | A fixed checklist of greps and checks for "does this touch more than one repo". The checks always run; single-repo work produces no ticket content at all, and cross-repo work produces one sentence in Technical Instructions. |
| [`references/security-checklist.md`](skills/ticket-creator/references/security-checklist.md) | The OWASP-style checklist, and the shape of the `SecurityAssessment.md` file it produces. Every item is marked Applicable or Not Applicable *with a reason* - a bare "Not Applicable" is indistinguishable from a skipped check. |
| [`references/style-guide.md`](skills/ticket-creator/references/style-guide.md) | Checkable writing rules, replacing a "run it through a humanizer" vibe pass. Adapted from [skill-deslop](https://github.com/stephenturner/skill-deslop) (MIT). |
| [`references/validation-checklist.md`](skills/ticket-creator/references/validation-checklist.md) | The Step 7 structural check - the eight sections present and in order, no heading outside that set, an assumption on every surviving unknown, no leftover placeholders. Requires a quoted line from the ticket per item, since it's a self-check. Not a substitute for the scrutiny pass. |
| [`agents/artifact-security-review.md`](skills/ticket-creator/agents/artifact-security-review.md) | Prompt for the Step 5 subagent. A *design-time* review of the drafted ticket and plan, not a code scan. Adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s diff-scoped `--pr` mode. |
| [`agents/scrutiny-reviewer.md`](skills/ticket-creator/agents/scrutiny-reviewer.md) | Prompt for the Step 8 subagent. Sees only the artifacts, never the drafter's reasoning, so it reviews the ticket as written. Adapted from [obra/superpowers](https://github.com/obra/superpowers)' task-reviewer pattern. |

Those two `agents/*.md` files are prompts the skill reads and hands to a
subagent. They are *not* plugin-level agents: only `plugins/<name>/agents/` is
discovered by Claude Code, so these never appear in `/agents`, which is intended
- they are only meaningful inside the ticket workflow.

#### The ticket structure is a closed set

A ticket has exactly eight sections, and the most common way ticket quality
degrades is a well-meant ninth: a Background, a Rollout Plan, an Alternatives
Considered, a `###` splitting a section that got long. Each one reads as added
rigour and lands as process output in a document someone has to get through
before they can start work.

Three files hold that line, deliberately from different angles - a single
instruction to "be concise" is exactly the kind of rule that erodes mid-draft:

- [`ticket-template.md`](skills/ticket-creator/references/ticket-template.md)
  states the heading list as a ceiling, not a floor, and gives the two available
  moves for content that doesn't fit - fold it into the nearest section, or cut
  it. Cut is usually right.
- [`validation-checklist.md`](skills/ticket-creator/references/validation-checklist.md)
  enforces it mechanically: enumerate every heading in the file, compare against
  the eight, fail on anything else.
- [`scrutiny-reviewer.md`](skills/ticket-creator/agents/scrutiny-reviewer.md)
  checks it again from outside, since the session that added a heading is the
  one least likely to notice it.

Three things that used to be ticket sections now live elsewhere for the same
reason. The security assessment became its own `SecurityAssessment.md`, because
an eleven-item OWASP checklist appeared in full in every ticket regardless of the
change and buried the sections readers needed; only its sign-off outcome and any
actionable finding cross back, and the finding arrives as an acceptance criterion
rather than a quote. Cross-repo scope lost its section and its evidence block
entirely: the checks still run every time, but single-repo work - the common
case - now produces nothing in the ticket at all. And the scrutiny pass lost its
section without gaining a file: its Critical and Important findings are fixed in
the ticket and reported to you in the terminal, so the evidence the review ran is
that the ticket is better, not that it carries a record of having been reviewed.

#### Unknowns get answered, not listed

Risks / Unknowns is the section that quietly rots. A drafter writes down what
they weren't sure about, the ticket ships with the list attached, and the person
who picks it up inherits five open questions and no authority to settle any of
them.

Step 6 puts every item back to you, one question per unknown, before the ticket
is finalised - and it checks the repo first, so you're only asked what the repo
can't answer. Each item then ends in one of two states:

- **Answered.** The bullet is deleted and the answer is folded into the section
  it belongs in - an acceptance criterion, a line of Technical Instructions.
  It doesn't stay in the risk list with the answer appended; a resolved question
  sitting under "Risks" still reads as a reason to hesitate.
- **Nobody can answer it today.** The bullet stays and gains an explicit
  `**Assumption:**` - what the ticket is built on in the meantime. The
  difference matters more than it looks: an unknown with no assumption tells the
  reader to stop and go find someone, while an unknown with one tells them how
  to proceed and what to re-check if it turns out wrong.

The closing confidence rating is then re-derived from what's left, so a ticket
resting on four standing assumptions can't also claim High confidence.

#### No ticketing MCP required

Step 1 always offers "local files only" alongside any Jira/Linear/GitHub Issues
MCP tools it finds, so the skill is usable with no ticketing integration
connected. Files land in the current working directory - `Ticket.md`,
`SecurityAssessment.md`, and `ImplementationPlan.md` if you asked for a plan -
with no subdirectory created for them. Run it from wherever you want the files.

### readme-creator

Ships one reference file, [`references/sections.md`](skills/readme-creator/references/sections.md),
covering what each README section should contain and which ones are generic filler.

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install tasks@claude-skills
```

Then ask in plain language - "draft a ticket for the export feature", "write a
README for this project" - and the right skill loads itself.
