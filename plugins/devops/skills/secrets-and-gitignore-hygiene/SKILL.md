---
name: secrets-and-gitignore-hygiene
description: Use before committing any configuration, connection string, API key, or new file type — what belongs in .gitignore, where real secrets live instead (dotnet user-secrets, Key Vault, GitHub OIDC), and how to check a diff for accidental secret exposure. Also use when adding a new kind of config file to the project.
---

# Secrets & `.gitignore` hygiene

This repository is written as though it will be made public. That's not a
hypothetical — treat every commit as if it's already on a public GitHub repo.

## Where secrets actually live

| Context | Where the real value lives |
|---|---|
| Local .NET dev | `dotnet user-secrets set "Key" "value"` — stored outside the repo under your user profile, never in a file the repo tracks |
| Local Vue dev | `.env.local` (gitignored) with `VITE_`-prefixed vars for anything the browser needs; never put a server-only secret in a `VITE_` var — it ships to the client bundle |
| CI/CD → Azure auth | GitHub OIDC federated credential (see `github-actions-cicd`) — no client secret exists to leak |
| Runtime app config (API keys, connection strings) | Azure Key Vault, read via a managed-identity Key Vault reference in App Service settings (see `azure-bicep-deploy`) |

If you find yourself typing a real API key or connection string into a file
under source control at any point, stop — it belongs in one of the rows
above instead.

## What the shipped `.gitignore` already blocks

The kit's `.gitignore` covers `.env*` (except `.env.example`), `*.pem`/
`*.pfx`/`*.key`, `secrets.json`, `appsettings.*.local.json`,
`local.settings.json`, and publish profiles. `appsettings.json` and
`appsettings.Development.json` themselves **are** committed by design —
that's standard ASP.NET Core convention — which is exactly why they must
never contain a real secret.

## Adding a new kind of config file

Before introducing a new file type that might carry credentials (a new
integration's SDK config, a service account JSON, a `.npmrc` with an auth
token), check whether the shipped `.gitignore` already covers its pattern.
If not, add a pattern for it in the same change that introduces the file —
don't leave that as a follow-up.

## Before committing

- Read your own diff for anything that looks like a key, token, connection
  string, or password — `git diff --staged` — before running `git commit`.
  Don't rely on tooling alone to catch it.
- If a secret does get committed, rotating/revoking the credential is
  mandatory even after removing it from the file — it's already in git
  history and, if pushed, potentially public. Rewriting history
  (`git filter-repo`, force-push) does not substitute for rotation.
- Consider adding [pre-commit](https://pre-commit.com/) with the
  [gitleaks](https://github.com/gitleaks/gitleaks) hook for automated
  scanning on every commit — install via the standard `pre-commit`
  framework rather than piping an installer script into `sh`.

## Review checklist

- [ ] No literal secret, key, token, or connection string in the diff.
- [ ] Any new local-only config file matches an existing `.gitignore`
      pattern, or a new pattern was added alongside it.
- [ ] `VITE_`-prefixed env vars contain nothing that isn't safe to ship to
      a browser.
- [ ] Sensitive runtime config flows through Key Vault + managed identity,
      not a plain setting or a file.
