# claude-skills

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace.

## What's included

| Plugin | Skills | Description |
|--------|--------|-------------|
| [dotnet](plugins/dotnet/) | 5 | C#, ASP.NET Core and .NET architecture skills: Clean Architecture, DDD tactical patterns, REST API design, and GoF/SOLID design patterns. |
| [web-frontend](plugins/web-frontend/) | 4 | Frontend skills for Vue 3, WCAG 2.2 AA accessibility, and Core Web Vitals performance. |
| [devops](plugins/devops/) | 5 | Azure Bicep infrastructure, GitHub Actions CI/CD, Docker, Debian administration, and secrets/.gitignore hygiene. |
| [rust](plugins/rust/) | 2 | Rust coding conventions and application architecture skills, including async design and multi-crate workspaces. |
| [practices](plugins/practices/) | 1 | Cross-project working practices for coding agents, starting with the Memory Bank persistent-context pattern. |
| [tasks](plugins/tasks/) | 2 | Ticket and documentation authoring: a deterministic engineering-ticket author with built-in security and scrutiny review passes, and an interactive README author. |

## Installation

1. Launch Claude Code.
2. Add the marketplace:
   ```
   /plugin marketplace add PontiusTheBarbarian/claude-skills
   ```
   Or, to test changes before pushing, point it at your local checkout:
   ```
   /plugin marketplace add /path/to/your/local/claude-skills
   ```
3. Install the plugins you want:
   ```
   /plugin install dotnet@claude-skills
   /plugin install web-frontend@claude-skills
   /plugin install devops@claude-skills
   /plugin install rust@claude-skills
   /plugin install practices@claude-skills
   /plugin install tasks@claude-skills
   ```
4. Restart Claude Code so the plugin loads.
5. Check what you got:
   ```
   /skills
   /agents
   ```

To pick up changes after editing a plugin:

```
/plugin marketplace update claude-skills
```

## Repository layout

```
.claude-plugin/
  marketplace.json          # the marketplace manifest - lists every plugin
plugins/
  <plugin-name>/
    .claude-plugin/
      plugin.json           # the plugin manifest - name, version, description
    skills/
      <skill-name>/
        SKILL.md            # a skill (frontmatter + instructions)
        references/         # detail SKILL.md loads on demand
        scripts/            # helper scripts the skill runs
        assets/             # config or templates the skill reads
        agents/             # subagent prompts the skill spawns (see below)
    agents/
      <agent-name>.md       # a subagent definition
    commands/
      <command-name>.md     # a slash command
    workflows/
      <workflow-name>.js    # a Workflow-tool script
```

All four component directories are discovered automatically. **Do not list them
in `plugin.json`** - for `commands`, `agents` and `workflows` those manifest keys
*replace* the default directory rather than adding to it, so declaring
`"commands": "./commands/"` and then adding a second location silently stops the
first from loading. Claude Code warns about this as
`folder-shadowed-by-manifest`. Every one of Anthropic's own reference plugins
omits the keys entirely.

### Naming

Skills, commands and agents are **namespaced per plugin**, so two plugins can
each define a `review` without conflict - they resolve as `/dotnet:review` and
`/devops:review`. You do not need marketplace-wide unique names for these.

Workflows are the exception: **workflow names are flat and global**. A collision
between two installed plugins is a real risk, so always self-prefix `meta.name`
with the plugin name (`dotnet-api-audit`, not `api-audit`).

## Adding a plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "<name>",
     "version": "0.1.0",
     "description": "One line on what this plugin is for.",
     "author": { "name": "Liam Appleyard" }
   }
   ```
2. Add `skills/`, `agents/`, `commands/` or `workflows/` folders alongside it.
3. Register it in `.claude-plugin/marketplace.json` under `plugins`:
   ```json
   {
     "name": "<name>",
     "source": "./plugins/<name>",
     "description": "One line on what this plugin is for."
   }
   ```
4. Bump the plugin's `version` (see below), commit and push, then
   `/plugin marketplace update claude-skills`.

## Bump the version when you change a plugin

An installed plugin is cached as a **version-pinned snapshot** under
`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Updating the
marketplace refreshes the marketplace clone but does **not** re-fetch an
installed plugin whose `version` is unchanged - so your edits stay invisible to
anyone who already has it installed, with no error to tell you why.

Always bump `version` in `plugin.json` when a plugin's contents change. To check
what a plugin is actually serving:

```
claude plugin details <plugin>@claude-skills
```

That prints the resolved version and the full component inventory, which is the
quickest way to confirm a new command, agent or workflow is really loading.

## Adding a skill

A skill is a folder with a `SKILL.md` inside it:

```markdown
---
name: my-skill
description: Use when <trigger condition>. Describe when Claude should reach for this.
---

# My Skill

Instructions for Claude go here.
```

The `description` is what Claude reads to decide whether to load the skill, so
write it as a *trigger* ("Use when ..."), not as a summary.

### Supporting files

`SKILL.md` is loaded in full whenever the skill triggers, so keep it to the
workflow and push the detail into sibling folders that it reads at the point of
need. `plugins/tasks/skills/ticket-creator/` uses three of these:

| Folder | For |
|--------|-----|
| `references/` | Templates, checklists and rules read mid-workflow. Fixing a format here rather than in `SKILL.md` is what makes output reproducible across sessions. |
| `scripts/` | Executable helpers, when a check is genuinely mechanical and worth a runtime dependency. Invoke by absolute path (`"${CLAUDE_PLUGIN_ROOT}/skills/<name>/scripts/x.py"`) - a shell command runs in the *user's* repo, so a bare relative path won't resolve. |
| `assets/` | Config or data the skill reads - including files the *installer* is expected to edit. |
| `agents/` | System prompts the skill hands to a subagent it spawns. |

A skill-level `agents/` folder is **not** the same as the plugin-level one.
Claude Code only discovers `plugins/<name>/agents/`, so prompts under
`skills/<name>/agents/` never show up in `/agents` - they are ordinary markdown
that the skill reads and passes to a subagent, which is usually what you want
for a reviewer that only makes sense inside one workflow.

## Adding a command

A command is a single markdown file in `commands/`. It becomes
`/<plugin>:<filename>`. All frontmatter is optional.

```markdown
---
description: Short line shown in /help - start with a verb
argument-hint: [path-or-glob] [--flag]
allowed-tools: [Read, Glob, Grep]
---

The user invoked this with: $ARGUMENTS

Instructions for Claude go here.
```

| Key | Notes |
|-----|-------|
| `description` | Shown in `/help`. Defaults to the first line of the body. |
| `argument-hint` | One bracketed token per argument, in the same order as `$1 $2 $3`. |
| `allowed-tools` | Pre-approved tools, so the command prompts less. Bash needs a filter: `Bash(git:*)`, never bare `Bash`. |
| `model` | `haiku` \| `sonnet` \| `opus`. Defaults to inheriting the session model. |

Inside the body you can use `$ARGUMENTS` for the whole raw string, `$1`/`$2` for
positional arguments, `` !`cmd` `` to inline shell output at expansion time, and
`${CLAUDE_PLUGIN_ROOT}` for the plugin's own directory.

> Anthropic now treats `commands/*.md` as the legacy layout and prefers a
> user-invoked skill - `skills/<name>/SKILL.md` carrying the same
> `argument-hint` and `allowed-tools` frontmatter. Both load identically and both
> produce a slash command; only the file layout differs. See
> `plugins/dotnet/commands/review-api.md` for the classic form.

## Adding an agent

An agent is a single markdown file in `agents/`. The body is its system prompt.

```markdown
---
name: my-reviewer
description: |
  Use this agent when <trigger>. Examples:

  <example>
  Context: <situation>
  user: "<what the user says>"
  assistant: "I'll use the my-reviewer agent to ..."
  <commentary>Why this agent fits.</commentary>
  </example>
tools: Read, Glob, Grep, Bash
model: inherit
color: blue
---

You are ... (second person, this is the agent's system prompt)
```

| Key | Required | Notes |
|-----|----------|-------|
| `name` | yes | kebab-case, 3-50 chars, matches the filename. No underscores. |
| `description` | yes | The dispatch signal. Use `Use this agent when ... Examples:` plus 2-3 `<example>` blocks - including one *counter*-example showing when NOT to use it. |
| `tools` | no | Comma-separated string or array. Omit for all tools. |
| `model` | no | `inherit` \| `haiku` \| `sonnet` \| `opus`. `inherit` is usually right. |
| `color` | no | `blue` \| `cyan` \| `green` \| `yellow` \| `magenta` \| `red` |

See `plugins/dotnet/agents/dotnet-reviewer.md`.

## Adding a workflow

A workflow is a `.js` file in `workflows/` that orchestrates many subagents
deterministically. Use one when a job is too big for a single context - a
solution-wide audit, a migration across dozens of files.

```js
export const meta = {
  name: 'myplugin-thing',        // self-prefixed: workflow names are GLOBAL
  description: 'What it does.',
  whenToUse: 'When to reach for it, and what args it needs.',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

const input = typeof args === 'string' && args.trim() ? JSON.parse(args) : (args || {})

const results = await pipeline(
  input.files,
  (file) => agent(`Review ${file}`, { phase: 'Review', schema: MY_SCHEMA }),
  (review, file) => agent(`Verify the findings in ${file}`, { phase: 'Verify' }),
)
return { results }
```

The runtime is **not Node**. Hard constraints on the script body:

- no `import` or `require` - the script cannot pull in anything
- no `fs`, no `process` - **it cannot read files**; the calling session
  enumerates paths and passes them in `args`, and the spawned agents do their own
  I/O via their `Read` tool
- no `Date.now()`, `new Date()` or `Math.random()` - they break workflow resume
- `args` is an implicit global, not a parameter, and may arrive as a JSON
  *string* rather than an object - always guard the parse

Prefer `pipeline()` over `parallel()`: pipeline moves each item through every
stage independently, so item A can be verifying while item B is still under
review. Reach for `parallel()` only when a stage genuinely needs every prior
result at once.

See `plugins/dotnet/workflows/dotnet-api-audit.js`.
