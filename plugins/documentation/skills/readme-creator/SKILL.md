---
name: readme-creator
description: Interactively create an outstanding, polished README.md for a code project by analyzing the actual repository (structure, language, dependencies, entry points, license, CI config) and drafting a tailored README, then refining it with the user. Use this whenever the user asks to "write a README," "create a README," "make my README better/awesome," "document this repo," or "add a README" — for any kind of project (open source library, personal/hobby project, or internal tool). Also trigger if the user is clearly about to publish or share a repo and has no README, or asks for help making their project look professional/polished for GitHub. Do not use this for general prose writing, API reference docs, or docs sites — this skill is specifically for the top-level README.md.
---

# README Creator

Create a genuinely great README by grounding it in what the repository actually contains, then iterating with the user until they're happy — rather than generating a generic template and asking them to fill in blanks.

## Core loop

1. **Analyze the repo** (always do this first, automatically, without asking permission)
2. **Draft a complete README** based on what you found
3. **Present it to the user** and iterate based on their feedback
4. **Save the final version** to `README.md`

Never start by asking the user twenty questions about their project — read the code first. Only ask questions for things you genuinely cannot infer (see "Things you can't infer" below).

---

## Step 1: Analyze the repository

Use `bash_tool` and `view` to build a picture of the project before writing anything. Work through this checklist, skipping what doesn't apply:

- **Project identity**: name (from package manifest, folder name, or existing README), one-line purpose (infer from code comments, main module docstring, or ask if genuinely unclear)
- **Language & ecosystem**: look for `package.json`, `pyproject.toml`/`setup.py`, `Cargo.toml`, `go.mod`, `Gemfile`, `pom.xml`/`build.gradle`, etc. This tells you install commands, the package manager, and likely badges.
- **Entry points**: main script, CLI commands defined (check `bin` fields, `console_scripts`, `main()` functions), or exported library API (check `__init__.py`, `index.js`/`index.ts` exports)
- **Dependencies & requirements**: runtime dependencies, minimum language version, any system-level prerequisites (databases, native libs)
- **Existing docs**: an existing README (to preserve tone/content worth keeping), `docs/` folder, inline docstrings/comments worth pulling examples from, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- **License**: check for a `LICENSE`/`LICENSE.md` file and identify which license
- **CI/tooling**: `.github/workflows/`, `.gitlab-ci.yml`, `tox.ini`, `Makefile`, test framework config — these inform badges and a "running tests" section
- **Existing tests/examples**: a `tests/` or `examples/` folder is a goldmine for realistic usage snippets — pull real, working code from there rather than inventing pseudocode
- **Screenshots/demo assets**: check for existing images in `assets/`, `docs/images/`, etc. that could be embedded

Run these checks with real commands, e.g.:
```bash
find . -maxdepth 2 -type f \( -iname "*.json" -o -iname "*.toml" -o -iname "*.cfg" -o -iname "Makefile" -o -iname "LICENSE*" \) | head -50
```
Then `view` the manifest files and a sample of source files (especially the main entry point and one or two files under `tests/` or `examples/`) to ground the description and usage examples in real code — don't guess at function signatures or CLI flags.

If no repo/files are present in this conversation (e.g. the user is starting from scratch or just describing a project verbally), skip to "Things you can't infer" and ask directly instead.

## Step 2: Draft the README

Read `references/sections.md` for the full menu of sections, what makes each one good vs. generic, and badge/formatting snippets — load it before writing the draft.

Defaults, unless the user has said otherwise:
- Include: title + one-line tagline, badges (only ones you can back with real info — don't fabricate a build-passing badge if there's no CI), short description, installation, usage/quickstart with a real working example, and a license section if a LICENSE file exists.
- Include if applicable: features list, configuration/options, CLI reference, API reference (short — link out to full docs if they exist), contributing section (only if `CONTRIBUTING.md` exists or it's clearly open-source), table of contents (only if the README is long, roughly 8+ sections).
- Skip by default unless requested or clearly warranted: elaborate contributor covenant text, changelog (link to `CHANGELOG.md` instead of duplicating it), screenshots/GIFs you don't actually have (never invent placeholder image links — ask the user if visuals would help, or note where they could add one).

Write the draft directly to `README.md` in the project root (or to the workspace if there's no clear project root). Use the file-editing tools, not just chat output — the user should get an actual file they can review and that's already in place.

## Step 3: Iterate with the user

Show the user what you produced (a brief summary of the sections, and the file itself). Ask what to change. Common refinements:
- Tone (more playful vs. more formal/professional)
- Trim or expand specific sections
- Add badges, visuals, or a demo GIF (if they can supply the asset or a URL)
- Adjust the tagline/positioning of what the project does

Keep revising in place with `str_replace` rather than regenerating the whole file each time, unless the user asks for a full rewrite.

## Step 4: Wrap up

Once the user is satisfied, confirm the final `README.md` is saved in the project root. If this is inside a computer-use environment where outputs need to be surfaced (e.g. `/mnt/user-data/outputs`), copy it there and present it; if you're editing a repo in place, just confirm the file path.

---

## Things you can't infer — ask directly

Only ask about what genuinely isn't in the repo:
- The project's intended audience or positioning if the purpose is genuinely ambiguous from the code
- Whether it's meant to be open-source-public-facing vs. an internal/private tool (changes tone and whether to include contribution sections)
- Screenshots, GIFs, or logo assets — you can't generate real product screenshots, so ask if they have one to include or want a placeholder noted
- Any roadmap/future plans content — this isn't in the code
- Deployment/hosting specifics not evident from config files (e.g. which cloud provider)

Ask these as a short batch up front if the repo analysis leaves real gaps — don't drip-feed single questions across multiple turns.
