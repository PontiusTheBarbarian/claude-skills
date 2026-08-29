# README Section Guide

Detailed guidance on each section: what makes it good, what makes it generic filler, and ready-to-adapt snippets.

## Table of contents
- [Title & tagline](#title--tagline)
- [Badges](#badges)
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage / Quickstart](#usage--quickstart)
- [Configuration](#configuration)
- [CLI reference](#cli-reference)
- [API reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Table of contents (for the README itself)](#table-of-contents-for-the-readme-itself)

---

## Title & tagline

Bad: `# my-project` with no tagline.
Good: a one-line tagline immediately under the title that says what it does and, ideally, why it's different — not just a restatement of the name.

```markdown
# httpsnoop

A tiny, zero-dependency HTTP request logger for Node.js that just works with any framework.
```

Avoid vague taglines like "A powerful tool for all your X needs." Be concrete about what it actually does.

## Badges

Only include badges you can back with real signal from the repo. Never fabricate a "build: passing" badge — if there's real CI config, link to the actual workflow badge URL pattern; otherwise omit it rather than inventing one.

Common shields.io patterns (adapt owner/repo/package name from what you found):
```markdown
![npm version](https://img.shields.io/npm/v/PACKAGE_NAME)
![PyPI version](https://img.shields.io/pypi/v/PACKAGE_NAME)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/WORKFLOW_FILE.yml)
```
Only emit the license badge if you actually found a matching LICENSE file, and only the build badge if you found an actual workflow file (use its real filename).

## Description

2-4 sentences. Answer: what problem does this solve, and for whom? Pull real vocabulary from the code/docstrings rather than boilerplate marketing language. If the project already had a README with a good description, preserve its voice rather than overwriting it with something blander.

## Features

A bulleted list only earns its place if there are genuinely distinct capabilities (3+) worth calling out. Don't pad a 1-feature tool with a features section. Each bullet should be concrete, not adjective soup:

Bad: "Fast, reliable, and easy to use."
Good: "Streams large files instead of loading them into memory."

## Installation

Use the real package manager and real package name you found in the manifest. Include the minimum language/runtime version if one is specified (e.g. `engines` in package.json, `python_requires` in setup.py).

```markdown
## Installation

\`\`\`bash
npm install package-name
\`\`\`

Requires Node.js 18+.
```

If there are system-level prerequisites (a database, a native library, an API key), state them explicitly — this is one of the most common gaps in real-world READMEs.

## Usage / Quickstart

This is the section users read first after installation — get a **real, working example** from the repo's own tests or examples folder rather than inventing one. If you must write a new example, make sure it matches the actual function/CLI signatures you found by reading the source — a plausible-looking but wrong example is worse than none.

```markdown
## Quickstart

\`\`\`python
from mylib import Client

client = Client(api_key="...")
result = client.fetch("some-resource")
print(result)
\`\`\`
```

For CLIs, show the actual `--help` output or a real invocation, not a hypothetical one.

## Configuration

Only include if the project reads config from env vars, a config file, or CLI flags with non-obvious defaults. A table works well for several options:

```markdown
| Option | Env var | Default | Description |
|---|---|---|---|
| `timeout` | `MYLIB_TIMEOUT` | `30` | Request timeout in seconds |
```

## CLI reference

If the project defines multiple subcommands, list them with a one-line description each, generated from the actual `--help` text or argument parser definitions found in the source — don't guess flag names.

## API reference

Keep this short in the README — a few of the most-used functions/classes with a one-line signature and description. If a fuller reference/docs site exists (Sphinx, TypeDoc, docs/ folder), link to it instead of duplicating.

## Contributing

Only include if the project looks open-source (has a LICENSE, is clearly meant to be shared) or already has a `CONTRIBUTING.md`. For internal tools, skip this or replace with an "Internal" note about who owns/maintains it.

```markdown
## Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
```

## License

State the license plainly and link to the LICENSE file. Don't guess the license — only state it if a LICENSE file (or a `license` field in the manifest) actually confirms it.

```markdown
## License

[MIT](LICENSE)
```

## Table of contents (for the README itself)

Only add one if the README has ~8+ sections/headers — for shorter READMEs it's dead weight. Use anchor links matching the actual headers.
