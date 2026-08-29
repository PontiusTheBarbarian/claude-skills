# documentation

Skills for writing project documentation: an interactive README author, and a
deterministic engineering-ticket author with built-in security and scrutiny
review passes.

## Skills

| Name | Description |
|------|-------------|
| [readme-creator](skills/readme-creator/SKILL.md) | Analyses a repo (structure, language, dependencies, entry points, license, CI) and drafts a tailored `README.md`, then refines it with you. Triggers on "write a README", "document this repo", "make my README better". |
| [ticket-creator](skills/ticket-creator/SKILL.md) | Runs a structured interview, detects cross-repo scope, drafts a ticket (and optional agent-targeted implementation plan), then puts both through an independent security review and an independent scrutiny pass before writing them to a ticketing MCP or to local files. Triggers on "create a ticket", "draft a story", "spec out a feature". |

### readme-creator

Ships one reference file, [`references/sections.md`](skills/readme-creator/references/sections.md),
covering what each README section should contain and which ones are generic filler.

### ticket-creator

The skill is deliberately thin: every judgment call is pinned to a file, so the
same ask produces the same ticket across sessions and models. The nine-step
workflow lives in [`SKILL.md`](skills/ticket-creator/SKILL.md); the rules it
follows live here:

| File | What it fixes |
|------|---------------|
| [`references/ticket-template.md`](skills/ticket-creator/references/ticket-template.md) | The exact section order every ticket must follow. Sections are never dropped - a non-applicable one becomes "N/A" plus a reason. |
| [`references/implementation-plan-template.md`](skills/ticket-creator/references/implementation-plan-template.md) | The separate, agent-executable plan file. Concrete paths and ordered steps, so the ticket itself can stay human-readable. |
| [`references/scope-detection.md`](skills/ticket-creator/references/scope-detection.md) | A fixed checklist of greps and checks for "does this touch more than one repo", so the verdict is evidence-backed rather than guessed. |
| [`references/security-checklist.md`](skills/ticket-creator/references/security-checklist.md) | The OWASP-style checklist. Every item is marked Applicable or Not Applicable *with a reason* - a bare "Not Applicable" is indistinguishable from a skipped check. |
| [`references/style-guide.md`](skills/ticket-creator/references/style-guide.md) | Checkable writing rules, replacing a "run it through a humanizer" vibe pass. Adapted from [skill-deslop](https://github.com/stephenturner/skill-deslop) (MIT). |
| [`references/validation-checklist.md`](skills/ticket-creator/references/validation-checklist.md) | The Step 7 structural check - sections present and in order, tables filled, no leftover placeholders. Requires a quoted line from the ticket per item, since it's a self-check. Not a substitute for the scrutiny pass. |
| [`agents/artifact-security-review.md`](skills/ticket-creator/agents/artifact-security-review.md) | Prompt for the Step 5 subagent. A *design-time* review of the drafted ticket and plan, not a code scan. Adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s diff-scoped `--pr` mode. |
| [`agents/scrutiny-reviewer.md`](skills/ticket-creator/agents/scrutiny-reviewer.md) | Prompt for the Step 8 subagent. Sees only the artifacts, never the drafter's reasoning, so it reviews the ticket as written. Adapted from [obra/superpowers](https://github.com/obra/superpowers)' task-reviewer pattern. |
| [`assets/skills-config.yaml`](skills/ticket-creator/assets/skills-config.yaml) | Maps each skill to the condition under which a ticket requires it. Ships populated with this marketplace's 18 skills; trim or replace it for your own catalog (see below). |

Those two `agents/*.md` files are prompts the skill reads and hands to a
subagent. They are *not* plugin-level agents: only `plugins/<name>/agents/` is
discovered by Claude Code, so these never appear in `/agents`, which is intended
- they are only meaningful inside the ticket workflow.

#### Tuning `skills-config.yaml`

`assets/skills-config.yaml` is the one file here meant to be edited per team. It
ships populated with all 18 skills from this marketplace, so it works as-is if
that's what you have installed. Each entry is a name plus a plain-language
`trigger` that Step 6 evaluates against the drafted ticket:

```yaml
skills:
  - name: dotnet:dotnet-rest-api-design
    trigger: "The ticket adds, removes, or changes an ASP.NET Core endpoint, a request/response contract, or HTTP status-code behaviour."
```

**This file is the only control on how long the ticket's Skills Required section
gets** - so delete the plugins you don't use rather than carrying dead triggers.
A ticket lists only the skills that actually apply, each with a justification
tied to that specific ticket, then accounts for the rest on one
"Evaluated and not required" line. That keeps the audit trail (every trigger was
evaluated) without an 18-row table on a two-line bug fix.

If the file is missing, or still holds `example-*` entries from an older copy,
the skill says so rather than inventing entries for you.

#### No ticketing MCP required

Step 1 always offers "local files only" alongside any Jira/Linear/GitHub Issues
MCP tools it finds, so the skill is usable with no ticketing integration
connected - it writes `Ticket.md` and `ImplementationPlan.md` to a directory you
name.

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install documentation@claude-skills
```

Then ask in plain language - "write a README for this project", "draft a ticket
for the export feature" - and the right skill loads itself.
