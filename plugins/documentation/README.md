# documentation

Skills for writing project documentation: an interactive README author, and a
deterministic engineering-ticket author with built-in security and scrutiny
review passes.

## Skills

| Name | Description |
|------|-------------|
| [readme-creator](skills/readme-creator/SKILL.md) | Analyses a repo (structure, language, dependencies, entry points, license, CI) and drafts a tailored `README.md`, then refines it with you. Triggers on "write a README", "document this repo", "make my README better". |
| [ticket-creator](skills/ticket-creator/SKILL.md) | Runs a structured interview, detects cross-repo scope, drafts a ticket (and optional agent-targeted implementation plan), then puts both through an independent security review and an independent scrutiny pass before writing them to a ticketing MCP or to the current directory. Triggers on "create a ticket", "draft a story", "spec out a feature". |

### readme-creator

Ships one reference file, [`references/sections.md`](skills/readme-creator/references/sections.md),
covering what each README section should contain and which ones are generic filler.

### ticket-creator

The skill is deliberately thin: every judgment call is pinned to a file, so the
same ask produces the same ticket across sessions and models. The eight-step
workflow lives in [`SKILL.md`](skills/ticket-creator/SKILL.md); the rules it
follows live here:

| File | What it fixes |
|------|---------------|
| [`references/ticket-template.md`](skills/ticket-creator/references/ticket-template.md) | The nine sections a ticket may contain, in order. A closed set: sections are never dropped (a non-applicable one becomes "N/A" plus a reason) and never added, `###` sub-headings included. |
| [`references/implementation-plan-template.md`](skills/ticket-creator/references/implementation-plan-template.md) | The separate, agent-executable plan file. Concrete paths and ordered steps, so the ticket itself can stay human-readable. |
| [`references/scope-detection.md`](skills/ticket-creator/references/scope-detection.md) | A fixed checklist of greps and checks for "does this touch more than one repo". The checks always run; single-repo work produces no ticket content at all, and cross-repo work produces one sentence in Technical Instructions. |
| [`references/security-checklist.md`](skills/ticket-creator/references/security-checklist.md) | The OWASP-style checklist, and the shape of the `SecurityAssessment.md` file it produces. Every item is marked Applicable or Not Applicable *with a reason* - a bare "Not Applicable" is indistinguishable from a skipped check. |
| [`references/style-guide.md`](skills/ticket-creator/references/style-guide.md) | Checkable writing rules, replacing a "run it through a humanizer" vibe pass. Adapted from [skill-deslop](https://github.com/stephenturner/skill-deslop) (MIT). |
| [`references/validation-checklist.md`](skills/ticket-creator/references/validation-checklist.md) | The Step 6 structural check - the nine sections present and in order, no heading outside that set, no leftover placeholders. Requires a quoted line from the ticket per item, since it's a self-check. Not a substitute for the scrutiny pass. |
| [`agents/artifact-security-review.md`](skills/ticket-creator/agents/artifact-security-review.md) | Prompt for the Step 5 subagent. A *design-time* review of the drafted ticket and plan, not a code scan. Adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s diff-scoped `--pr` mode. |
| [`agents/scrutiny-reviewer.md`](skills/ticket-creator/agents/scrutiny-reviewer.md) | Prompt for the Step 7 subagent. Sees only the artifacts, never the drafter's reasoning, so it reviews the ticket as written. Adapted from [obra/superpowers](https://github.com/obra/superpowers)' task-reviewer pattern. |

Those two `agents/*.md` files are prompts the skill reads and hands to a
subagent. They are *not* plugin-level agents: only `plugins/<name>/agents/` is
discovered by Claude Code, so these never appear in `/agents`, which is intended
- they are only meaningful inside the ticket workflow.

#### The ticket structure is a closed set

A ticket has exactly nine sections, and the most common way ticket quality
degrades is a well-meant tenth: a Background, a Rollout Plan, an Alternatives
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
  the nine, fail on anything else.
- [`scrutiny-reviewer.md`](skills/ticket-creator/agents/scrutiny-reviewer.md)
  checks it again from outside, since the session that added a heading is the
  one least likely to notice it.

Two things that used to be ticket sections now live elsewhere for the same
reason. The security assessment became its own `SecurityAssessment.md`, because
an eleven-item OWASP checklist appeared in full in every ticket regardless of the
change and buried the sections readers needed; only its sign-off outcome and any
actionable finding cross back, and the finding arrives as an acceptance criterion
rather than a quote. Cross-repo scope lost its section and its evidence block
entirely: the checks still run every time, but single-repo work - the common
case - now produces nothing in the ticket at all.

#### No ticketing MCP required

Step 1 always offers "local files only" alongside any Jira/Linear/GitHub Issues
MCP tools it finds, so the skill is usable with no ticketing integration
connected. Files land in the current working directory - `Ticket.md`,
`SecurityAssessment.md`, and `ImplementationPlan.md` if you asked for a plan -
with no subdirectory created for them. Run it from wherever you want the files.

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install documentation@claude-skills
```

Then ask in plain language - "write a README for this project", "draft a ticket
for the export feature" - and the right skill loads itself.
