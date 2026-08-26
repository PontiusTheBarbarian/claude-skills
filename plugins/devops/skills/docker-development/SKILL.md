---
name: docker-development
description: Use when writing or reviewing a Dockerfile, .dockerignore, or docker-compose.yml for the API or frontend, or when building/running containers inside this Docker Sandbox (Docker-in-Docker). Generate these files following this pattern rather than copying one from elsewhere in the project.
acknowledgments: |
  The per-language multi-stage Dockerfile shape (.NET base/build/final
  stages, mcr.microsoft.com images) is adapted from microsoft/skills
  (https://github.com/microsoft/skills, MIT License), azure-prepare's
  recipes/azd/docker.md. General Dockerfile best practices (layer
  ordering, non-root users, minimal bases) reflect Docker's own published
  guidance (https://docs.docker.com/build/building/best-practices/). The
  Vue/nginx stage, docker-compose layout, and the Docker-in-Docker section
  were authored for this toolkit against
  https://docs.docker.com/ai/sandboxes/customize/templates/.
---

# Docker development standards

This skill doesn't ship a Dockerfile for you to inherit — generate one per
service, following the patterns below, with the actual project's paths.

## When to containerize

| Containerize | Don't |
|---|---|
| The .NET Web API | The Vue build output when deploying straight to Static Web Apps (no container needed there) |
| The Vue app, only if deploying to a container host instead of Static Web Apps | Azure Functions (native deploy) |
| Anything you want to run identically in CI, this sandbox, and prod | A database — use a managed Azure service, not a container, in production |

For the hosting model this toolkit targets (App Service + Static Web
Apps — see `azure-bicep-deploy`), you generally only containerize the API,
and only if you're not using App Service's native `dotnet publish`
deployment. Containers are still worth having for **local development**
(docker-compose below) even when production deploys without one.

## `.NET` API — multi-stage Dockerfile

Separate SDK (build) from ASP.NET runtime (final) images so the shipped
image doesn't carry the whole SDK:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
# Non-root: the aspnet base image already ships an unprivileged "app" user
USER app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Api/Api.csproj", "src/Api/"]
COPY ["src/Application/Application.csproj", "src/Application/"]
COPY ["src/Domain/Domain.csproj", "src/Domain/"]
COPY ["src/Infrastructure/Infrastructure.csproj", "src/Infrastructure/"]
RUN dotnet restore "src/Api/Api.csproj"
COPY . .
RUN dotnet publish "src/Api/Api.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
```

Copying `.csproj` files before the rest of the source (rather than
`COPY . .` then `dotnet restore`) is deliberate — Docker's layer cache
only invalidates the `restore` layer when a project file actually
changes, not on every source edit.

## Vue frontend — multi-stage Dockerfile (only if not using Static Web Apps)

Build with Node, serve the static output with nginx — the shipped image
never contains `node_modules` or the Node runtime:

```dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` needs an SPA fallback (`try_files $uri /index.html;`) so
client-side routes don't 404 on refresh.

## `.dockerignore`

One per service, sitting next to its Dockerfile. Keeps secrets and
generated output out of the build context (Docker sends the whole context
to the daemon before evaluating `.dockerignore` rules inside a stage, but
excluding these still shrinks context size and prevents accidental `COPY .
.` leaks):

```
**/bin/
**/obj/
**/node_modules/
**/dist/
.git
.env
.env.*
!.env.example
*.pem
*.pfx
*.key
appsettings.*.local.json
secrets.json
```

## Best practices

- **Pin base image tags** (`mcr.microsoft.com/dotnet/aspnet:10.0`,
  `node:24-slim`) — never `:latest`. A floating tag means a rebuild months
  from now silently ships a different runtime.
- **Prefer slim/alpine bases** unless you have a specific reason (native
  dependency that needs glibc, etc.).
- **Run as non-root.** The .NET aspnet image ships a built-in `app` user —
  use it. For a custom base without one: `RUN useradd -m appuser` then
  `USER appuser`.
- **Order layers from least- to most-frequently-changing** (restore/install
  dependencies before copying source) so the dependency layer stays cached
  across most edits.
- **Never bake a secret into a layer**, including via `ENV` or a build
  `ARG` that ends up in a `RUN` command — it persists in the image history
  even if a later layer "removes" it. If a build genuinely needs a secret
  (a private NuGet feed token), use BuildKit's `--secret` flag, which
  never touches the image filesystem or history:
  `RUN --mount=type=secret,id=nuget_token dotnet restore`.
- **Add a health check** for anything running behind a load balancer:
  `HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1`
  (requires a `/health` endpoint — ASP.NET Core's health checks
  middleware provides one).

## docker-compose for local development

Not for production — this is for running the API + frontend + a local
database together while developing, without touching Azure:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: src/Api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__Default=Server=db;Database=app;User=sa;Password=${DB_PASSWORD};TrustServerCertificate=True
    depends_on:
      - db

  web:
    build:
      context: src/Web
    ports:
      - "5173:80"

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=${DB_PASSWORD}
    ports:
      - "1433:1433"
```

`DB_PASSWORD` comes from a local `.env` file (gitignored — see
`secrets-and-gitignore-hygiene`), never hardcoded in `docker-compose.yml`.
Ship a `.env.example` with a placeholder so the shape is documented
without a real value ever being committed.

## Docker-in-Docker in this sandbox

The `dotnet-vue-smb` template extends
`docker/sandbox-templates:claude-code-docker`, which runs a full Docker
Engine **inside the sandbox's own microVM** — isolated from your host, not
sharing its Docker socket. `dockerd` starts automatically; `docker` and
`docker compose` work out of the box. Use this to build and smoke-test
images/compose stacks before they ever reach CI:

```bash
docker build -t api:local -f src/Api/Dockerfile .
docker compose up --build
```

Docker's storage lives on a dedicated sparse block volume (50 GB default,
only consumes disk as used). If a project needs more headroom, size it
when starting the sandbox: `DOCKER_SANDBOXES_DOCKER_SIZE=20g sbx run
--template <registry>/dotnet-vue-smb:v1 claude`. See
https://docs.docker.com/ai/sandboxes/customize/templates/.

## Review checklist

- [ ] Multi-stage build — the shipped image doesn't contain SDK/
      `node_modules`/build tools.
- [ ] Base image tags are pinned, not `:latest`.
- [ ] Container runs as a non-root user.
- [ ] No secret is baked into an image layer (check `ARG`/`ENV`/`RUN`
      history, not just the final `COPY` list).
- [ ] `.dockerignore` present and excludes `.env*`, key/cert files, and
      build output directories.
- [ ] `docker-compose.yml` reads secrets from an untracked `.env`, with a
      committed `.env.example` documenting the shape.
