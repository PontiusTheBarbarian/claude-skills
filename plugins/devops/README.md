# devops

Azure Bicep infrastructure, GitHub Actions CI/CD, Docker, Debian administration, and secrets/.gitignore hygiene.

## Skills

| Skill | Description |
|-------|-------------|
| [azure-bicep-deploy](skills/azure-bicep-deploy/SKILL.md) | Use when a project needs Azure infrastructure - generate infra/bicep/main.bicep and its modules (App Service, Static Web Apps, Key Vault, monitoring) following this pattern, tailored to the actual project name and environments. Also use when reviewing existing Bicep in infra/bicep/*.bicep. |
| [debian-linux](skills/debian-linux/SKILL.md) | Guidance for Debian-based Linux administration, apt workflows, and Debian policy conventions. |
| [docker-development](skills/docker-development/SKILL.md) | Use when writing or reviewing a Dockerfile, .dockerignore, or docker-compose.yml for the API or frontend, or when building/running containers inside this Docker Sandbox (Docker-in-Docker). Generate these files following this pattern rather than copying one from elsewhere in the project. |
| [github-actions-cicd](skills/github-actions-cicd/SKILL.md) | Use when a project needs GitHub Actions CI/CD - generate .github/workflows/dotnet-ci.yml, vue-ci.yml, and azure-deploy.yml following this pattern, tailored to the actual project's paths and Azure resource names. Also use when reviewing existing workflow YAML. |
| [secrets-and-gitignore-hygiene](skills/secrets-and-gitignore-hygiene/SKILL.md) | Use before committing any configuration, connection string, API key, or new file type — what belongs in .gitignore, where real secrets live instead (dotnet user-secrets, Key Vault, GitHub OIDC), and how to check a diff for accidental secret exposure. Also use when adding a new kind of config file to the project. |

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install devops@claude-skills
```
