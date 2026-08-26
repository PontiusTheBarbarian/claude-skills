# claude-skills

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace.

## What's included

| Plugin | Skills | Description |
|--------|--------|-------------|
| [dotnet](plugins/dotnet/) | 5 | C#, ASP.NET Core and .NET architecture skills: Clean Architecture, DDD tactical patterns, REST API design, and GoF/SOLID design patterns. |
| [web-frontend](plugins/web-frontend/) | 4 | Frontend skills for Vue 3, WCAG 2.2 AA accessibility, and Core Web Vitals performance. |
| [devops](plugins/devops/) | 5 | Azure Bicep infrastructure, GitHub Actions CI/CD, Docker, Debian administration, and secrets/.gitignore hygiene. |
| [rust](plugins/rust/) | 2 | Rust coding conventions and application architecture skills, including async design and multi-crate workspaces. |
| [workflow](plugins/workflow/) | 1 | Cross-project working practices for coding agents, starting with the Memory Bank persistent-context pattern. |

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
   /plugin install workflow@claude-skills
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
    agents/
      <agent-name>.md       # a subagent definition
    commands/
      <command-name>.md     # a slash command
```

`skills/`, `agents/` and `commands/` are discovered automatically - you do not
need to list their contents in `plugin.json`.

Skill folder names must be unique across the whole marketplace, not just within
a plugin, because two plugins can be installed side by side.

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
2. Add `skills/`, `agents/` or `commands/` folders alongside it.
3. Register it in `.claude-plugin/marketplace.json` under `plugins`:
   ```json
   {
     "name": "<name>",
     "source": "./plugins/<name>",
     "description": "One line on what this plugin is for."
   }
   ```
4. Commit and push, then `/plugin marketplace update claude-skills`.

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
