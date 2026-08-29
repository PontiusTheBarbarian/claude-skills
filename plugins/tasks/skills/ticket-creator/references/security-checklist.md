# Security Assessment Checklist

Evaluate every item against the change described in the ticket. Mark each **Applicable** or **Not Applicable**, with a one-line reason either way — "Not Applicable" without a reason is not acceptable, since it's indistinguishable from having skipped the check.

This list is deliberately fixed so the same change gets the same checklist treatment regardless of who or what drafts the ticket. If you think an item should be added or removed permanently, that's a change to this file, not a one-off skip.

1. **Injection** — Does this change introduce or touch any user-controllable input that reaches a query, command, template, or interpreter (SQL, shell, template engines, deserialization)?
2. **Authentication** — Does this change affect how a user or service proves identity (login, tokens, session handling, SSO)?
3. **Authorization / Access Control** — Does this change affect who can access what (permission checks, role logic, object-level access, IDOR risk)?
4. **Sensitive Data Exposure** — Does this change log, transmit, store, or display data that should be protected (PII, credentials, secrets, financial data)?
5. **Security Misconfiguration** — Does this change touch config defaults, environment variables, CORS, headers, or infrastructure-as-code that could weaken a default posture?
6. **Vulnerable Dependencies** — Does this change add, upgrade, or downgrade a third-party dependency?
7. **Insufficient Logging & Monitoring** — Will this change need new logging/alerting to detect misuse, or does it remove/alter existing security-relevant logs?
8. **Server-Side Request Forgery (SSRF)** — Does this change cause the server to make outbound requests based on user-supplied input (URLs, webhooks, callbacks)?
9. **Cryptographic Failures** — Does this change touch encryption, hashing, key management, or data-in-transit/at-rest protections?
10. **Input Validation** — Does this change accept new external input that needs bounds/format/type validation before use?
11. **Rate Limiting / Abuse Potential** — Could this change be abused via automation, scraping, or high-volume misuse if unthrottled?

If 3 or more items are Applicable, or any of Injection / Authentication / Authorization / Sensitive Data Exposure are Applicable, the "Cyber Security Officer (CSO)" box in Review/Sign-off should default to checked — override only with an explicit reason.

## Where the assessment goes

The assessment is a companion file, `SecurityAssessment.md`, written next to
`Ticket.md`. It is not a ticket section — the full checklist ran to eleven
Applicable/Not Applicable lines in every ticket regardless of the change, which
buried the sections a reader actually needed.

The file is a standalone document, so it repeats the ticket title and links back
to it rather than assuming the reader has the ticket open:

```markdown
# Security Assessment: [Ticket Title]

**Ticket:** [./Ticket.md](./Ticket.md)
**Scope:** Design-time review of the ticket and implementation plan. Not a code scan.

## Checklist
| # | Item | Verdict | Reason |
|---|---|---|---|
| 1 | Injection | Not Applicable | No user input reaches a query or interpreter; the change is read-only over a fixed enum. |

## Findings
[Only if there are any. Each: what was found, where in the ticket or plan, why it matters, suggested mitigation.]

## Cannot Assess
[Only if there is anything genuinely undetermined. Omit the heading otherwise.]

## Recommended Sign-off
CSO review required: Yes / No — [the specific items driving the recommendation].
```

Two things cross back into the ticket, and nothing else:

- The **Recommended Sign-off** outcome decides whether the Cyber Security Officer
  box is checked under Review / Sign-off.
- A finding the ticket has to act on becomes ordinary ticket content — an
  acceptance criterion, or a bullet in Risks / Unknowns. It goes in as the
  requirement itself, not as a quote from the assessment, and it does not get a
  new heading.
