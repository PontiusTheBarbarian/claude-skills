---
name: ticket-creator
description: Interactively create well-formed, deterministic engineering tickets (and optional agent-targeted implementation plans) through a structured interview, cross-repo scope detection, an independent subagent security review of the drafted ticket/plan against an OWASP-style checklist, a mandatory skills-required table, and a second independent subagent scrutiny pass before writing to a ticketing system MCP or local files. Use this whenever the user wants to "create a ticket," "write up a ticket," "draft a story," "spec out a feature," or asks for a ticket/implementation plan for a piece of work — even if they only give a rough description of what they want built. Always use this skill rather than freehand ticket-writing, since the output format and quality bar are fixed by this skill's templates.
---

# Ticket Creator

Produces tickets that are consistent regardless of which session or model instance writes them. Every open-ended judgment call in this workflow has been pinned down to a fixed procedure, template, or checklist in the `references/` files — read the relevant one at the point it's needed rather than improvising the format.

**Load `references/ticket-template.md` before drafting anything.** It defines the exact section structure, in order, that every ticket must follow.

## Workflow

Follow these steps in order. Do not skip the interview to save time — the entire point of this skill is consistent inputs producing consistent outputs.

### Step 1: Detect ticketing destinations

Check your available tools for any ticketing-system MCP tools (Jira, Linear, GitHub Issues, Asana, etc.).

- If one or more are found, list them to the user as destination options, plus a "local files only" option.
- If none are found, tell the user plainly: no ticketing MCP is connected. Offer exactly two options: (a) create a local directory with the ticket files for them to move manually, or (b) they enable/connect a ticketing MCP and re-run.

Don't guess which system to use — always ask, even if only one is available, since "local files only" should remain an explicit option every time.

### Step 2: Interview

Ask the user for (batch these efficiently, don't drip-feed one at a time):

1. **Template**: use the default template (`references/ticket-template.md`) or paste a custom one? If custom, map their headings onto the fixed template's slots as closely as possible and note any sections their template is missing — don't silently drop required sections (Security Assessment, Skills Required, Scrutiny) even if their pasted template omits them.
2. **Implementation plan**: do they want a separate agent-targeted implementation plan file? (See `references/implementation-plan-template.md`.)
3. **The actual ask**: what's the feature/fix, and what's the acceptance criteria (what must be true for this to be done)?
4. **Designs**: are there design files/links to reference?
5. **Anything underspecified**: after hearing the ask, actively identify gaps — ambiguous scope, missing edge cases, unclear "done" conditions — and ask about those specifically rather than filling gaps with assumptions. This is the one place where asking more than usual is correct: an underspecified ticket is worse than a slightly slower interview.

### Step 3: Detect cross-repo scope

Read `references/scope-detection.md` and follow its procedure exactly — it's a fixed checklist of greps and checks, not a vibe judgment. Produce a verdict (Yes / No / Unclear) with the evidence that supports it. Never assert "No" without having actually run the checks.

### Step 4: Draft the ticket (and implementation plan, if requested)

Write `Ticket.md` following `references/ticket-template.md` exactly, in the style defined by `references/style-guide.md` (the deterministic replacement for "humanizer" — concrete rules, not a vibe pass). Leave the **Security Assessment** and **Skills Required** sections marked `Pending — completed in Steps 5–6` for now; everything else should be fully drafted, since the next steps need real content to review.

If an implementation plan was requested, write `ImplementationPlan.md` per `references/implementation-plan-template.md`. Keep a hard boundary: the ticket's "Technical Instructions" section stays lightweight and human-readable (approach, not steps); the implementation plan is where step-by-step, agent-executable detail lives. Don't duplicate the same content in both.

### Step 5: Security assessment (independent subagent)

Spawn a subagent using `agents/artifact-security-review.md` — adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s diff-scoped `--pr` mode, retargeted to review the drafted `Ticket.md` and `ImplementationPlan.md` themselves rather than a code diff, since there's usually no diff yet at ticket-creation time. It evaluates the *described* change against the OWASP-style checklist in `references/security-checklist.md`, checks the specific files/areas the ticket names (not the whole repo), and flags risky patterns named directly in the description or plan (e.g. "store the token in localStorage").

Paste its output into `Ticket.md`'s Security Assessment section, replacing the `Pending` placeholder.

### Step 6: Resolve the Skills Required table

Read `assets/skills-config.yaml` and evaluate every entry's `trigger` against the ticket's actual content — including the Security Assessment just written in Step 5, since some triggers reference it (e.g. Sensitive Data Exposure being Applicable).

Skills that apply get a table row with a justification tied to something specific in *this* ticket — "changes the `/orders/{id}/cancel` response contract", not a restatement of the trigger. Everything else is accounted for on the single "Evaluated and not required" line, so a long config doesn't produce a long ticket. Evaluate every entry; only report the ones that hit.

This file is user-maintained. If it's missing, or still contains `example-*` entries from an unedited copy, tell the user and offer to help populate it rather than inventing entries yourself.

### Step 7: Validate before scrutiny

Read `references/validation-checklist.md` and work through it against the draft. It checks structural completeness only — required sections present and in order, tables actually filled in, no placeholder text left behind.

Two rules make this worth doing rather than a formality:

- **Quote your evidence.** The checklist requires the line from the ticket that satisfies each item. An item you can't quote is failing. Reading the ticket and forming an impression that it looks complete is the failure mode this step exists to prevent — you drafted it, so you already believe it's fine.
- **Fix before proceeding.** Any failing item gets fixed and re-checked now. Don't pass a draft with known gaps to Step 8; the scrutiny subagent's value is in finding what you *didn't* already know about.

This is a self-check and can't be more than that — it's the same session that wrote the ticket. It is not a substitute for the scrutiny pass in Step 8, which is independent by design for exactly that reason.

### Step 8: Scrutiny pass (independent subagent)

Spawn a subagent using `agents/scrutiny-reviewer.md` — adapted from [obra/superpowers](https://github.com/obra/superpowers)' task-reviewer pattern — giving it the drafted `Ticket.md`, `ImplementationPlan.md` (if present), the Step 5 security review output, and the original ask from Step 2. The subagent should have no access to your reasoning about *why* you made choices — only the artifacts themselves — so it's actually evaluating the ticket as written, not rubber-stamping your intent. It treats any rationale embedded in the ticket the same way: as an unverified claim, not evidence the choice was correct.

Append its findings to the ticket under **Scrutiny** using the fixed format in `references/ticket-template.md`. If the subagent flags Critical or Important issues, fix them and note what changed; don't just append criticism you didn't act on. Minor findings can be noted without necessarily being actioned.

### Step 9: Deliver

- If a ticketing MCP destination was chosen: create the ticket via that tool, then attach or link the implementation plan (as a comment, attachment, or linked doc depending on what the tool supports).
- If local files: write `Ticket.md` / `ImplementationPlan.md` to the directory the user specified (or create one, named after the ticket's short title).

Tell the user where it ended up and summarize the cross-repo verdict, security assessment outcome, and any scrutiny findings in a few lines — don't just say "done."

## Iterating on this skill

If the user wants to tweak how tickets come out (more/less strict security checklist, different sign-off roles, different style rules), edit the relevant `references/` file directly rather than patching behavior into `SKILL.md` — keeping the fixed rules in dedicated files is what makes output reproducible across sessions.
