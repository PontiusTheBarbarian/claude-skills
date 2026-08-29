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

6. **If step 4 or 5 finds a hit but the consuming repo isn't accessible from this environment**, the verdict is **Unclear**, not "No." Say explicitly what you found and that you couldn't verify the other side — this is exactly the kind of thing that belongs in Risks/Unknowns too.

7. **If none of the above produce any hits after actually running the searches**, the verdict is **No**, with a one-line note of what was checked (not just "nothing found" — name the searches run).

## Verdict format

```
Verdict: Yes / No / Unclear
Evidence:
- [Check run] → [result]
- [Check run] → [result]
```

Never write a verdict without at least the checks in steps 2–5 having actually been attempted.
