---
name: github-actions-cicd
description: Use when a project needs GitHub Actions CI/CD - generate .github/workflows/dotnet-ci.yml, vue-ci.yml, and azure-deploy.yml following this pattern, tailored to the actual project's paths and Azure resource names. Also use when reviewing existing workflow YAML.
acknowledgments: |
  The OIDC azure/login pattern and the general shape of the infra-deploy
  job are cross-checked against microsoft/skills
  (https://github.com/microsoft/skills, MIT License), specifically
  azure-deploy's cicd/examples/github-bicep.yml. The .NET/Vue CI jobs and
  the App Service + Static Web Apps deploy jobs were authored for this
  toolkit.
---

# GitHub Actions CI/CD standards

This skill doesn't ship a copy of `.github/workflows/` for you to inherit -
generate it fresh for each project, using the templates below, with the
project's actual paths (solution location, frontend location) and Azure
resource names filled in.

## Authenticate to Azure with OIDC — never a stored client secret/password

Use `azure/login@v2` with a federated identity credential instead of a
service principal password. `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and
`AZURE_SUBSCRIPTION_ID` are identifiers, not credentials — the federated
trust relationship (scoped to this exact repo + environment) is what
actually grants access. Store them as GitHub **Secrets** anyway, per
Microsoft's documented recommendation, for defense-in-depth even though
they aren't exploitable on their own.

Set this up once per repo: create an Azure AD app registration, add a
federated credential scoped to
`repo:<org>/<repo>:environment:production` (or `:ref:refs/heads/main`), and
grant it least-privilege RBAC on only the resource group this project
deploys to. See `azure-bicep-deploy` for the resource-side setup.

## The one deployment secret that's a genuine exception: Static Web Apps

`Azure/static-web-apps-deploy@v1` doesn't support OIDC — it authenticates
with a deployment token (`AZURE_STATIC_WEB_APPS_API_TOKEN`), which is a
real secret, scoped only to that one Static Web App, and rotatable from the
Azure portal without touching anything else. Store it as a GitHub Secret
like any other credential: never print it in a log, never write it to a
file in the repo, and rotate it immediately if it's ever exposed.

## `.github/workflows/dotnet-ci.yml`

Adjust `SOLUTION_PATH` and the `paths:` filters to match the real project
layout (see `dotnet-clean-architecture` for the expected `src/` shape).

```yaml
name: .NET CI

on:
  pull_request:
    paths: ["src/Api/**", "src/Application/**", "src/Domain/**", "src/Infrastructure/**", ".github/workflows/dotnet-ci.yml"]
  push:
    branches: [main]
    paths: ["src/Api/**", "src/Application/**", "src/Domain/**", "src/Infrastructure/**"]

permissions:
  contents: read

env:
  SOLUTION_PATH: "*.sln"

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
          cache: true
          cache-dependency-path: "**/*.csproj"
      - run: dotnet restore ${{ env.SOLUTION_PATH }}
      - run: dotnet build ${{ env.SOLUTION_PATH }} --no-restore --configuration Release
      - run: dotnet format ${{ env.SOLUTION_PATH }} --verify-no-changes --no-restore
      - run: dotnet test ${{ env.SOLUTION_PATH }} --no-build --configuration Release --logger "trx" --results-directory ./test-results
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: dotnet-test-results
          path: ./test-results
```

A workflow that only builds and never runs tests/format-check isn't CI —
it's a false sense of security.

## `.github/workflows/vue-ci.yml`

Adjust `working-directory`/`cache-dependency-path` to the real frontend
location (see `vue-component-standards`).

```yaml
name: Vue CI

on:
  pull_request:
    paths: ["src/Web/**", ".github/workflows/vue-ci.yml"]
  push:
    branches: [main]
    paths: ["src/Web/**"]

permissions:
  contents: read

defaults:
  run:
    working-directory: src/Web

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"
          cache-dependency-path: src/Web/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx vue-tsc --noEmit
      - run: npm run test:unit -- --run
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: vue-dist
          path: src/Web/dist
```

## `.github/workflows/azure-deploy.yml`

Runs both CI workflows, deploys infra via Bicep `what-if` + `create`, then
deploys the API and the frontend — gated behind a protected `production`
environment (required reviewers) so a bad merge can't auto-deploy:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  workflow_dispatch: {}

permissions:
  id-token: write
  contents: read

env:
  SOLUTION_PATH: "*.sln"
  RESOURCE_GROUP: "rg-CHANGE-ME-prod"
  API_APP_NAME: "app-CHANGE-ME-prod"

jobs:
  dotnet-ci:
    uses: ./.github/workflows/dotnet-ci.yml
  vue-ci:
    uses: ./.github/workflows/vue-ci.yml

  deploy-infra:
    needs: [dotnet-ci, vue-ci]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - run: |
          az deployment group what-if \
            --resource-group "${{ env.RESOURCE_GROUP }}" \
            --template-file infra/bicep/main.bicep \
            --parameters infra/bicep/main.parameters.json
      - run: |
          az deployment group create \
            --resource-group "${{ env.RESOURCE_GROUP }}" \
            --template-file infra/bicep/main.bicep \
            --parameters infra/bicep/main.parameters.json

  deploy-api:
    needs: deploy-infra
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
      - run: dotnet publish ${{ env.SOLUTION_PATH }} --configuration Release --output ./publish
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.API_APP_NAME }}
          package: ./publish

  deploy-web:
    needs: deploy-infra
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"
          cache-dependency-path: src/Web/package-lock.json
      - working-directory: src/Web
        run: |
          npm ci
          npm run build
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "src/Web/dist"
          skip_app_build: true
```

## Caching

Use `actions/setup-dotnet` and `actions/setup-node`'s built-in `cache:`
option rather than hand-rolled `actions/cache` steps — less to maintain,
and it's keyed correctly already.

## Least privilege for `GITHUB_TOKEN`

Set `permissions` explicitly at the workflow or job level instead of
relying on the repo default. Most CI jobs only need `contents: read`; only
jobs doing Azure login need `id-token: write`.

## Branch protection

Configure `main` to require the `dotnet-ci`/`vue-ci` status checks and
disallow force-push, so `azure-deploy.yml` can never fire against
unreviewed code.

## Review checklist

- [ ] Azure login uses OIDC (`azure/login@v2` + federated credential), never
      a service principal password or publish profile.
- [ ] PR-triggered workflow actually runs tests/lint, not just build.
- [ ] `permissions:` block is explicit and minimal per job.
- [ ] Deploy jobs are gated behind a protected environment and depend on
      the CI workflows passing.
- [ ] Dependency setup steps use built-in caching.
