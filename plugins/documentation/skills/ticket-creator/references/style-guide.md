# Ticket Style Guide

Concrete, checkable rules for writing the ticket — this replaces "run it through a humanizer" with rules you apply the same way every time.

Adapted from the **deslop** skill ([github.com/stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop), MIT license), which itself synthesizes [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya and the [tropes.fyi](https://tropes.fyi/) AI-writing-tropes catalog by Ossama Hassanein. The rules below are re-derived for ticket-writing specifically — a ticket needs precision and scannability more than voice, so some of the source material's blog/creative guidance is dropped in favor of the technical-writing register.

## Core rules

**1. Cut filler.** No throat-clearing openers ("Here's the thing:"), emphasis crutches ("Let that sink in," "It's worth noting"), business jargon ("leverage," "navigate the landscape," "ecosystem"), or meta-commentary ("In this section we'll cover..."). A ticket states things; it doesn't announce that it's about to state things.

**2. Break formulaic structures.** Avoid binary contrasts ("Not X. Y."), negative listings ("Not a bug. Not a regression. A design flaw."), dramatic fragmentation ("Speed. That's the tradeoff."), and self-posed rhetorical questions ("The impact? Significant."). These read as filler in a document meant to be scanned for facts.

**3. Active voice, named actors.** "The API returns a 400" not "A 400 is returned." "The migration script drops the column" not "The column gets dropped." Exception: when the actor is genuinely unknown or irrelevant to the point being made.

**4. Be specific — no vague declaratives.** "The reasons are structural" says nothing; name the structural reason. "Experts recommend..." is not a source; name the source or cut the claim. No lazy extremes ("always," "never," "every") standing in for a real bound — say what the actual bound is.

**5. Vary rhythm, but don't perform it.** Mix sentence lengths naturally. Don't stack short punchy fragments for manufactured emphasis, and don't let three sentences in a row land at the same length — but this is a side effect of writing plainly, not something to engineer for its own sake in a ticket.

**6. Trust the reader.** State facts directly. Skip "Let's break this down," "Think of it as...", and other hand-holding — the audience is engineers who will read the Technical Instructions section, not a lay reader who needs an analogy.

**7. Watch formatting tells.** No bold-first bullets where every item opens with a bolded keyword for decoration rather than structure. No em dashes — use a comma, period, or parenthetical. No "In conclusion..." or "Despite these challenges..." formula closers.

**8. Don't dilute.** One point per section, stated once. Don't restate the same acceptance criterion three ways across three bullets. Don't stack analogies or historical comparisons for false authority — a ticket doesn't need rhetorical weight, it needs to be correct and checkable.

## Quick pre-submit checks

Run through these before finalizing the ticket:

- Any adverb doing the work a concrete fact should do ("significantly," "dramatically")? Cut it, name the number or fact instead.
- Any passive voice hiding who/what does the action? Find the actor.
- Any "not X, it's Y" construction? State Y directly.
- Three sentences in a row the same length? Break one up.
- Em dash anywhere? Remove it.
- A vague declarative anywhere ("this has important implications")? Name the specific implication or cut the sentence.
- A section that just restates the User Story in different words? Cut the restatement, add real information instead.
- Bold-first bullets used purely for visual rhythm rather than to flag a genuinely scannable keyword? Remove the bold.

## What's different from the source material

The original deslop rules cover blog-voice concerns (matching "you" register, varying tone for reader engagement) that don't apply here — a ticket isn't trying to hold a reader's attention, it's trying to be unambiguous and fast to scan. Domain/technical terminology is always fine and expected in a ticket (same as deslop's carve-out for scientific writing) — the target is filler and AI-tell phrasing, not precise technical vocabulary.

## Terminology

Define any acronym or internal-tool name the first time it's used in the ticket, even if it seems obvious to the team — tickets get read by people outside the immediate context (new hires, other teams, auditors). Prefer the term already used in the codebase/existing tickets over inventing a new one for the same concept.

## Length calibration

The ticket should feel proportionate to the actual size of the work:
- A single-file config or copy change: most sections can be one line or "N/A — [reason]."
- A cross-cutting feature: Human Test Instructions and Risks/Unknowns will legitimately run long. Don't compress real complexity just to look concise — these rules ban filler, not substance.
