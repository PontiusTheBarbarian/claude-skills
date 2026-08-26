---
name: dotnet-rest-api-design
description: Use when designing, adding, or reviewing ASP.NET Core Web API endpoints — resource naming, HTTP verbs/status codes, versioning, pagination, DTOs, error responses, and OpenAPI documentation. Applies to controllers, minimal APIs, and API review.
---

# REST API design for ASP.NET Core

## Resource naming

- Plural nouns, not verbs: `/api/orders`, not `/api/getOrders`.
- Hierarchy reflects ownership: `/api/customers/{customerId}/orders`.
- Lowercase, kebab-case for multi-word resources: `/api/shipping-addresses`.
- Actions that don't map to a CRUD verb are a sub-resource or a POST with an
  intent-revealing name: `POST /api/orders/{id}/cancel`, not
  `PATCH /api/orders/{id}?status=cancelled`.

## HTTP verbs and status codes

| Verb | Use | Success | Common errors |
|---|---|---|---|
| GET | Read, no side effects | 200 | 404 |
| POST | Create, or an action | 201 (+ `Location`) or 200 for actions | 400, 409 |
| PUT | Full replace | 200/204 | 400, 404, 409 |
| PATCH | Partial update | 200/204 | 400, 404, 409 |
| DELETE | Remove | 204 | 404 |

- `201 Created` responses include a `Location` header pointing at the new
  resource, and the body is the created resource (via
  `CreatedAtAction`/`CreatedAtRoute`, not a hand-built URL string).
- `204 No Content` for successful operations with nothing meaningful to
  return — don't invent an empty `{}` body.
- Never return `200` with an error payload; use the status code the error
  actually represents.

## Errors: `ProblemDetails`, not ad hoc shapes

Every error response uses RFC 7807 `ProblemDetails` so every client (and the
frontend's error handling in `vue-component-standards`) deals with one
shape:

```csharp
app.UseExceptionHandler(errApp => errApp.Run(async context =>
{
    var feature = context.Features.Get<IExceptionHandlerFeature>();
    var problem = new ProblemDetails
    {
        Status = StatusCodes.Status500InternalServerError,
        Title = "An unexpected error occurred.",
        Type = "https://httpstatuses.com/500",
    };
    context.Response.StatusCode = problem.Status.Value;
    await context.Response.WriteAsJsonAsync(problem);
}));
```

For validation failures, use `ValidationProblemDetails` with a 400 and a
field → error-messages dictionary. Never leak exception messages or stack
traces into a response body — log them server-side instead.

## DTOs, not domain entities, at the boundary

Controllers/endpoints accept and return DTOs (request/response records),
never `Domain` entities directly:

```csharp
public sealed record CreateOrderRequest(Guid CustomerId, IReadOnlyList<OrderLineRequest> Lines);
public sealed record OrderResponse(Guid Id, string Status, decimal Total, DateTimeOffset CreatedAt);
```

This keeps the wire format stable even as the domain model evolves, and
stops internal invariants/fields from leaking to clients.

## Versioning

Version from day one, even for `v1`: `/api/v1/orders`, using
`Asp.Versioning.Http`. Add a new version when a change would break existing
clients (removed/renamed field, changed semantics) — additive, optional
fields don't need a new version.

## Pagination, filtering, sorting

List endpoints are paginated by default — never return an unbounded
collection:

```
GET /api/v1/orders?page=1&pageSize=25&sort=-createdAt&status=paid
```

Response wraps the page with metadata rather than returning a bare array:

```csharp
public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);
```

## OpenAPI

Every endpoint has a summary, and request/response types are explicit
(`Produces<T>`, `[ProducesResponseType]`) so the generated OpenAPI document
is accurate — the frontend and any external integrator relies on it, not on
reading the controller source.

## Review checklist

- [ ] Verb and status code match the table above.
- [ ] Errors are `ProblemDetails`, no raw exception text in the response.
- [ ] Request/response types are DTOs, not `Domain` entities.
- [ ] List endpoints are paginated.
- [ ] Endpoint is under a versioned route.
- [ ] Response types are declared for OpenAPI generation.
