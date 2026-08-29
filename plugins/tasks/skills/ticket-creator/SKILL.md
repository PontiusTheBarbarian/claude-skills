---
name: ticket-creator
description: Interactively create well-formed, deterministic engineering tickets (and optional agent-targeted implementation plans) through a structured interview, cross-repo scope detection, an independent subagent security review written to a companion file, an interactive pass that answers or pins an assumption to every risk and unknown, and a second independent subagent scrutiny pass, before writing to a ticketing system MCP or to the current directory. Use this whenever the user wants to "create a ticket," "write up a ticket," "draft a story," "spec out a feature," or asks for a ticket/implementation plan for a piece of work — even if they only give a rough description of what they want built. Always use this skill rather than freehand ticket-writing, since the output format and quality bar are fixed by this skill's templates.
---

# Ticket Creator

Produces tickets that are consistent regardless of which session or model instance writes them. Every open-ended judgment call in this workflow has been pinned down to a fixed procedure, template, or checklist in the `references/` files — read the relevant one at the point it's needed rather than improvising the format.

**Load `references/ticket-template.md` before drafting anything.** It defines the exact section structure, in order, that every ticket must follow.

## The ticket's structure is a closed set

The eight headings in `references/ticket-template.md` are the only headings a ticket may contain. This is the rule most likely to erode under drafting pressure, because adding a heading always feels like adding rigour — a "Background," a "Rollout Plan," an "Alternatives Considered," a `###` breaking up a long section. It isn't. It's process output moved into a document someone has to read before they can start work.

When you have content that doesn't fit one of the eight, exactly two moves are available:

1. Fold it into the closest existing section as a sentence or two.
2. Cut it.

Cut is the more common right answer. A reader who needed the paragraph you cut will ask; a reader who skims past three sections they didn't need will misread the ones that mattered. Process artifacts in particular — the checks you ran, the options you weighed, the review you commissioned — stay out. Their *conclusions* reach the ticket as ordinary content under an existing heading; their working goes in a companion file or nowhere.

## Workflow

Follow these steps in order. Do not skip the interview to save time — the entire point of this skill is consistent inputs producing consistent outputs.

### Step 1: Detect ticketing destinations

Check your available tools for any ticketing-system MCP tools (Jira, Linear, GitHub Issues, Asana, etc.).

- If one or more are found, list them to the user as destination options, plus a "local files only" option.
- If none are found, tell the user plainly: no ticketing MCP is connected, so the files land in the current directory.

Don't guess which system to use — always ask, even if only one is available, since "local files only" should remain an explicit option every time.

### Step 2: Interview

Ask the user for (batch these efficiently, don't drip-feed one at a time):

1. **Template**: use the default template (`references/ticket-template.md`) or paste a custom one? If custom, map their headings onto the fixed template's slots as closely as possible. Tell them which of their headings have no slot and what you'll fold that content into — a custom template narrows or renames the section list, it doesn't license adding to it.
2. **Implementation plan**: do they want a separate agent-targeted implementation plan file? (See `references/implementation-plan-template.md`.)
3. **The actual ask**: what's the feature/fix, and what's the acceptance criteria (what must be true for this to be done)?
4. **Designs**: are there design files/links to reference?
5. **Anything underspecified**: after hearing the ask, actively identify gaps — ambiguous scope, missing edge cases, unclear "done" conditions — and ask about those specifically rather than filling gaps with assumptions. This is the one place where asking more than usual is correct: an underspecified ticket is worse than a slightly slower interview.

### Step 3: Detect cross-repo scope

Read `references/scope-detection.md` and follow its procedure exactly — it's a fixed checklist of greps and checks, not a vibe judgment.

The output is deliberately small. Work contained to this repo produces **nothing** in the ticket: no section, no sentence, no note that it was checked. Genuine cross-repo work produces one sentence in Technical Instructions naming the other repo(s) and who coordinates. Coupling you found but couldn't verify the far side of produces one bullet in Risks / Unknowns.

Run the checks anyway. A clean check and a skipped check look identical in the ticket now, which is exactly why skipping isn't available.

### Step 4: Draft the ticket (and implementation plan, if requested)

Write the ticket following `references/ticket-template.md` exactly, in the style defined by `references/style-guide.md` (the deterministic replacement for "humanizer" — concrete rules, not a vibe pass). Draft every section fully; the next steps need real content to review. The only thing left open is whether the Cyber Security Officer box under Review / Sign-off is checked, which Step 5 decides — mark that one line `Pending — completed in Step 5`.

If an implementation plan was requested, write it per `references/implementation-plan-template.md`. Keep a hard boundary: the ticket's Technical Instructions section stays lightweight and human-readable (approach, not steps); the implementation plan is where step-by-step, agent-executable detail lives. Don't duplicate the same content in both.

Draft in the current working directory as `Ticket.md` and `ImplementationPlan.md`.

### Step 5: Security assessment (independent subagent)

Spawn a subagent using `agents/artifact-security-review.md` — adapted from [Consensys/repo-security-review](https://github.com/Consensys/repo-security-review)'s diff-scoped `--pr` mode, retargeted to review the drafted ticket and plan themselves rather than a code diff, since there's usually no diff yet at ticket-creation time. It evaluates the *described* change against the OWASP-style checklist in `references/security-checklist.md`, checks the specific files/areas the ticket names (not the whole repo), and flags risky patterns named directly in the description or plan (e.g. "store the token in localStorage").

Its output is a companion file, `SecurityAssessment.md`, written next to the ticket. It is not a ticket section — the checklist ran to eleven Applicable/Not Applicable lines in every ticket regardless of the change, which buried the sections readers actually needed.

Two things cross back into the ticket:

- The assessment's Recommended Sign-off line decides the Cyber Security Officer box, replacing the Step 4 marker.
- A finding the ticket has to act on becomes an acceptance criterion or a Risks / Unknowns bullet, written as the requirement itself. Not a quote from the assessment, and not under a new heading. A finding that lands in Risks / Unknowns goes into Step 6 with everything else — it gets answered or it gets an assumption, same as any other unknown.

Everything else stays in the companion file. Don't summarise the assessment in the ticket "for convenience" — that's the section you just removed, growing back.

### Step 6: Resolve the risks and unknowns with the user

You now have a Risks / Unknowns list from Step 4, plus anything Step 5 added. Most of it is resolvable, and resolving it is cheaper here than after someone has started the work. Put every item to the user and settle it one way or the other.

**Check what you can check first.** An unknown you can answer by reading the repo — which library version is in use, whether an endpoint already exists, what the current retry limit is — is not a question for the user. Run the check, fold the answer in, and never raise it. Asking the user something you could have grepped is how an interview loses their patience for the questions that actually need them.

**Then ask, one question per unknown.** Batch up to four per prompt so a long list doesn't turn into a long interrogation, but never merge two unknowns into one question — a single answer covering both resolves neither cleanly. Where the plausible answers are enumerable, offer them as options rather than leaving it open; "which of these three" is faster to answer than "what should happen here?" and produces a sharper answer.

Each item ends in exactly one of three states:

- **Answered.** Delete the bullet and fold the answer into the section it belongs in — an acceptance criterion, a sentence in Description, a line of Technical Instructions. The bullet does not stay with the answer appended to it: a resolved question sitting in a risk list still reads to the next person as a reason to hesitate.
- **Answered, and it changes the scope.** Say so explicitly rather than quietly absorbing it, then update the Acceptance Criteria and anything downstream of them, including the implementation plan.
- **Nobody can answer it today.** The bullet stays, and you write the assumption with the user rather than for them: "if this can't be settled now, what should the ticket assume?" Record it on the bullet as `**Assumption:** ...`. An unknown with an assumption lets work start; an unknown without one stops the reader and sends them looking for someone.

One pass, not a negotiation. Don't re-open an answer you already have, and don't manufacture unknowns so the step has something to do — if drafting genuinely produced none, say that to the user and move on. Where the ticket had no real unknowns, Risks / Unknowns says "N/A" with a reason, and that's a legitimate outcome rather than a gap.

Finish by re-rating confidence at the bottom of the section. Answers should push it up; assumptions you had to write should push it down.

### Step 7: Validate before scrutiny

Read `references/validation-checklist.md` and work through it against the draft. It checks structure only — the eight required sections present and in order, no unlisted headings, no placeholder text, an assumption on every surviving unknown, companion files where they should be.

Three rules make this worth doing rather than a formality:

- **Quote your evidence.** The checklist requires the line from the ticket that satisfies each item. An item you can't quote is failing. Reading the ticket and forming an impression that it looks complete is the failure mode this step exists to prevent — you drafted it, so you already believe it's fine.
- **Enumerate the headings, don't scan for odd ones.** Grep every heading in the file and compare the result against the list of eight. A heading that looks like it belongs is exactly the one a scan misses.
- **Fix before proceeding.** Any failing item gets fixed and re-checked now. Don't pass a draft with known gaps to Step 8; the scrutiny subagent's value is in finding what you *didn't* already know about.

This is a self-check and can't be more than that — it's the same session that wrote the ticket. It is not a substitute for the scrutiny pass in Step 8, which is independent by design for exactly that reason.

### Step 8: Scrutiny pass (independent subagent)

Spawn a subagent using `agents/scrutiny-reviewer.md` — adapted from [obra/superpowers](https://github.com/obra/superpowers)' task-reviewer pattern — giving it the drafted ticket, the implementation plan (if present), `SecurityAssessment.md`, and the original ask from Step 2. The subagent should have no access to your reasoning about *why* you made choices — only the artifacts themselves — so it's actually evaluating the ticket as written, not rubber-stamping your intent. It treats any rationale embedded in the ticket the same way: as an unverified claim, not evidence the choice was correct.

**The review leaves no artifact — not a ticket section, not a companion file.** Act on it instead:

- Critical and Important findings get fixed in the ticket, and the fix is the record that the review happened.
- A finding you're deliberately not fixing becomes ordinary ticket content under an existing heading — usually a Risks / Unknowns bullet with its assumption — written as the risk itself, not as "the reviewer said X."
- Minor findings are yours to judge. Fix the cheap ones, drop the rest.
- If a fix opens a new unknown, settle it the way Step 6 does: ask the user, or write the assumption.

Report what it found to the user in the terminal at Step 9 and nowhere else. A Scrutiny section listing what a reviewer objected to and how you answered is process output; the person picking this ticket up needs the corrected ticket, not the correction history.

### Step 9: Deliver

- **Local files:** they're already in the current working directory — `Ticket.md`, `SecurityAssessment.md`, and `ImplementationPlan.md` if one was requested. Don't create a subdirectory for them, and don't move them somewhere tidier unless the user asks.
- **Ticketing MCP:** create the ticket via that tool from `Ticket.md`, then attach or link the implementation plan and the security assessment (as a comment, attachment, or linked doc depending on what the tool supports). Leave the local files in place as well.

Tell the user where it ended up and summarize, in a line or two each: the cross-repo outcome, the security assessment outcome, which unknowns got answered in Step 6 and which are standing on an assumption, and what the scrutiny pass found and what you did about it. Don't just say "done."

## Iterating on this skill

If the user wants to tweak how tickets come out (more/less strict security checklist, different sign-off roles, different style rules), edit the relevant `references/` file directly rather than patching behavior into `SKILL.md` — keeping the fixed rules in dedicated files is what makes output reproducible across sessions.
