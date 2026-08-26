---
description: Review ASP.NET Core endpoints against the REST design skill
argument-hint: [path-or-glob]
allowed-tools: [Read, Glob, Grep]
---

# Review API

Review ASP.NET Core endpoints for REST design problems.

## Target

The user asked to review: `$ARGUMENTS`

If that is empty, find the endpoints yourself — glob for `**/*Controller.cs`
first, then for minimal-API registrations (`MapGet`, `MapPost`, `MapPut`,
`MapDelete`, `MapPatch`) across the solution. If both come back empty, say so
and stop rather than guessing at what to review.

## Instructions

1. Load the `dotnet-rest-api-design` skill from this plugin. It holds the actual
   standards — resource naming, HTTP verbs and status codes, versioning,
   pagination, DTO boundaries, error responses, OpenAPI documentation. Do not
   restate those rules from memory; read them.
2. Read every endpoint in scope. For controllers, read the whole file — attribute
   routing and filters at class level change how the actions behave.
3. Check each endpoint against the skill, in this order:
   - **Routing** — resource-noun paths, plural collections, no verbs in the URL
   - **Verbs and status codes** — correct verb, correct success code, `201` with
     a `Location` header on create, `204` on delete
   - **Contracts** — DTOs at the boundary rather than domain entities or EF models
   - **Errors** — `ProblemDetails` over ad-hoc shapes; no leaked exception detail
   - **Collections** — pagination on anything unbounded
   - **Docs** — `[ProducesResponseType]` covering the codes actually returned
4. Report findings grouped by file, most severe first. Give each one a
   `file.cs:line` reference, one sentence on what is wrong, and the concrete fix.
5. If an endpoint is clean, do not invent a finding for it. Say the file is clean
   and move on.

Report only. Do not edit files unless the user asks for the fixes to be applied.
