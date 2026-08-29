# Cross-Repo Scope Detection

A fixed procedure for answering "does this ticket touch more than one repository," since the setup varies (monorepo, polyrepo, or mixed) and guessing produces inconsistent tickets. Run every step that applies to what you can actually see on disk — don't stop at the first negative result.

## Procedure

1. **Establish the repo root.**
   ```bash
   git rev-parse --show-toplevel
   ```
   This is your reference point for "inside" vs "outside" the current repo.

2. **Check for monorepo workspace boundaries.** A monorepo can still have effectively separate "repos" in the form of independently-owned packages/services. Look for:
   ```bash
   find . -maxdepth 3 -iname "package.json" -o -iname "pnpm-workspace.yaml" -o -iname "lerna.json" -o -iname "nx.json" -o -iname "go.work" -o -iname "*.sln"
   ```
   If the change touches files in more than one workspace/package root that has its own manifest and, more importantly, its own deploy/release lifecycle, treat it as cross-boundary even within one git repo.

3. **Search for the specific service/interface names mentioned in the acceptance criteria.** Take the concrete nouns from the ticket's ask (service names, API names, event names, table names) and grep for them outside the immediately-changed area:
   ```bash
   grep -rl "SERVICE_OR_API_NAME" --include="*.{ext}" . | grep -v <changed-path>
   ```
   Hits outside the changed path are evidence of coupling, not proof — read enough context to tell whether it's a real dependency or a coincidental name match.

4. **Check shared contract/schema locations.** These are the highest-signal indicator of cross-repo impact:
   - OpenAPI/Swagger specs (`openapi.yaml`, `swagger.json`, `*/spec/*.yaml`)
   - Protobuf/gRPC definitions (`*.proto`)
   - GraphQL schemas (`*.graphql`, `schema.gql`)
   - Shared types/client packages (`shared-types/`, `*-client/`, `*-sdk/`, generated client code)

   If the change modifies any of these, cross-repo impact is very likely — anything consuming that contract externally is affected even if you can't see the consumer's repo from here.

5. **Check for outbound calls to other known services.** Grep the changed files for HTTP client calls, message queue publishes, or RPC calls referencing hostnames/service names that aren't part of this repo.

6. **If step 4 or 5 finds a hit but the consuming repo isn't accessible from this environment**, treat the scope as unconfirmed rather than clear. You found coupling you couldn't verify the far side of — that is an unknown, and it goes in the ticket's Risks / Unknowns.

7. **If none of the above produce any hits after actually running the searches**, the scope is contained to this repo.

## What reaches the ticket

Nothing in this file's working does. There is no Cross-Repo Scope section, no
verdict line, and no evidence list — those produced a block of process output
that readers skipped. The procedure decides which one of three things happens:

| Outcome | What goes in the ticket |
|---|---|
| Contained to this repo | Nothing. No sentence, no mention of scope at all. |
| Genuinely cross-repo | One sentence in **Technical Instructions**: which other repo(s) change, and who coordinates it. No evidence. |
| Coupling found, far side unverifiable | One bullet in **Risks / Unknowns** naming the contract and what couldn't be checked. Still no evidence list. |

If an implementation plan is being written, its **Affected Areas** section is
where the concrete detail lives — repo names, paths, what changes where. That's
the right home for specifics, since an agent executing the plan needs them and a
human skimming the ticket does not.

**Run the checks even though the output is short.** The one-sentence outcome is
worth less than a verdict block only if it's still evidence-backed. Steps 2-5
must actually have been attempted before you conclude the work is contained to
this repo — an unrun check and a clean check produce the same silence in the
ticket, which is exactly why the running of them can't be skipped.
