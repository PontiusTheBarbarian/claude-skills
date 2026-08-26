# dotnet

C#, ASP.NET Core and .NET architecture skills: Clean Architecture, DDD tactical patterns, REST API design, and GoF/SOLID design patterns.

## Skills

| Name | Description |
|------|-------------|
| [csharp](skills/csharp/SKILL.md) | Guidelines for building C# applications |
| [dotnet-architecture-good-practices](skills/dotnet-architecture-good-practices/SKILL.md) | DDD and .NET architecture guidelines |
| [dotnet-clean-architecture](skills/dotnet-clean-architecture/SKILL.md) | Use when creating or reviewing .NET solution structure, domain models, or business logic — enforces Clean Architecture layering, DDD tactical patterns, SOLID, and avoiding anemic domain models. Applies to new projects, new features, and code review of C# backend code. |
| [dotnet-rest-api-design](skills/dotnet-rest-api-design/SKILL.md) | Use when designing, adding, or reviewing ASP.NET Core Web API endpoints — resource naming, HTTP verbs/status codes, versioning, pagination, DTOs, error responses, and OpenAPI documentation. Applies to controllers, minimal APIs, and API review. |
| [oop-design-patterns](skills/oop-design-patterns/SKILL.md) | Best practices for applying Object-Oriented Programming (OOP) design patterns, including Gang of Four (GoF) patterns and SOLID principles, to ensure clean, maintainable, and scalable code. |

## Commands

| Name | Description |
|------|-------------|
| [`/dotnet:review-api`](commands/review-api.md) | Review ASP.NET Core endpoints against the REST design skill |

## Agents

| Name | Description |
|------|-------------|
| [`dotnet:dotnet-reviewer`](agents/dotnet-reviewer.md) | Use this agent when reviewing C# backend changes for architectural and API design problems — layering violations, anemic domain models, leaked EF or domain types at the API boundary, and REST contract mistakes. Invoke it after a logical chunk of backend work is complete, not mid-edit. |

## Workflows

| Name | Description |
|------|-------------|
| [`dotnet-api-audit`](workflows/dotnet-api-audit.js) | Audit ASP.NET Core endpoints in parallel against the REST design and Clean Architecture skills, then adversarially verify each finding. |

## Install

```
/plugin marketplace add PontiusTheBarbarian/claude-skills
/plugin install dotnet@claude-skills
```
