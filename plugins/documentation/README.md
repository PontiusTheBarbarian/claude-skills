# documentation

Skills for writing project documentation, starting with an interactive README author that grounds every section in what the repository actually contains.

## Skills

| Name | Description |
|------|-------------|
| [readme-creator](skills/readme-creator/SKILL.md) | Analyses a repo (structure, language, dependencies, entry points, license, CI) and drafts a tailored `README.md`, then refines it with you. Triggers on "write a README", "document this repo", "make my README better". |

`readme-creator` ships a reference file, [`references/sections.md`](skills/readme-creator/references/sections.md),
covering what each README section should contain and which ones are generic filler.

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install documentation@claude-skills
```

Then ask for a README in plain language - "write a README for this project" - and
the skill loads itself.
