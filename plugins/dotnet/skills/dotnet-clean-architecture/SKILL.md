---
name: dotnet-clean-architecture
description: Use when creating or reviewing .NET solution structure, domain models, or business logic — enforces Clean Architecture layering, DDD tactical patterns, SOLID, and avoiding anemic domain models. Applies to new projects, new features, and code review of C# backend code.
---

# .NET Clean Architecture & DDD

## Solution layering

Four projects, dependencies point inward only:

```
src/
  Domain/          Entities, value objects, aggregates, domain events, domain
                    interfaces (e.g. IOrderRepository). No dependencies on
                    anything else in the solution. No EF Core, no ASP.NET.
  Application/      Use cases (commands/queries), DTOs, interfaces for
                    infrastructure (IEmailSender, IClock). Depends on Domain
                    only.
  Infrastructure/   EF Core DbContext, repository implementations, external
                    service clients. Implements Application's interfaces.
                    Depends on Application + Domain.
  Api/              ASP.NET Core host: controllers/minimal APIs, DI wiring,
                    middleware. Depends on all three above.
```

Rule of thumb: if `Domain` needs a `using` statement pointing at a NuGet
package other than the BCL, something is misplaced.

## Domain modeling

- **Entities** have identity and a lifecycle; equality is by ID.
- **Value objects** have no identity; equality is by value. Make them
  `readonly record struct` or `sealed record` — e.g. `Money`, `Address`,
  `EmailAddress`. Validate invariants in the constructor so an invalid value
  object can't exist.
- **Aggregates** are a cluster of entities/value objects with one root that
  is the only object the outside world holds a reference to. Enforce
  invariants inside the aggregate root's methods, not in a service class
  reaching in and mutating child collections directly.
- **Avoid anemic models.** If a class is only public getters/setters and all
  the logic lives in a separate `*Service`, the behavior belongs on the
  entity/aggregate instead. Example:

  ```csharp
  // Anemic — logic lives outside the entity, invariant can be bypassed
  public class Order { public OrderStatus Status { get; set; } }
  orderService.Ship(order); // nothing stops Status being set directly elsewhere

  // Rich — the aggregate protects its own invariant
  public class Order
  {
      public OrderStatus Status { get; private set; }
      public void Ship()
      {
          if (Status != OrderStatus.Paid)
              throw new InvalidOperationException("Cannot ship an unpaid order.");
          Status = OrderStatus.Shipped;
      }
  }
  ```

- **Domain events** (`OrderShipped`, `CustomerRegistered`) for side effects
  that cross aggregate boundaries (e.g. send an email when an order ships).
  Raise them from the aggregate, dispatch them after the transaction commits.

## Application layer

- One class per use case (command or query handler) rather than fat
  "service" classes with a dozen unrelated methods — easier to test, easier
  to see what the system actually does.
- Application layer depends on **interfaces**, never on `Infrastructure`
  concrete types. Register implementations in `Api`'s DI container.
- DTOs cross the Application boundary; domain entities never get returned
  directly from a use case to the API layer (see `dotnet-rest-api-design`).

## SOLID, applied practically

- **SRP**: a class that changes for two unrelated reasons should be two
  classes. If a code review comment starts with "and also this handles...",
  that's a signal.
- **OCP**: prefer adding a new implementation of an existing interface over
  adding an `if (type == X)` branch to an existing class.
- **LSP**: a derived class/implementation must be usable anywhere the base
  type is expected without surprising the caller — no throwing
  `NotImplementedException` from an overridden method.
- **ISP**: keep interfaces small and role-specific (`IOrderRepository`, not
  a single `IRepository` with 20 methods spanning every aggregate).
- **DIP**: `Application` and `Domain` define the interfaces;
  `Infrastructure` implements them. Never the reverse.

## Review checklist

- [ ] No EF Core / ASP.NET / HTTP types leak into `Domain`.
- [ ] Aggregate invariants are enforced by methods on the aggregate, not by
      a caller setting properties directly.
- [ ] Value objects validate themselves at construction.
- [ ] Use case classes are named for what they do (`PlaceOrder`,
      `GetOrderById`), not generic (`OrderService`).
- [ ] New behavior added to an existing class doesn't violate its single
      responsibility — consider a new class instead.
