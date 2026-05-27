# ADR-0002: Custom JWT Auth Instead of NextAuth

## Status
Accepted

## Context
The platform requires 7+ roles (super_admin, admin, member, consultant, viewer, finance, auditor).
NextAuth imposes its own session shape and adapter constraints that conflict with our role/permission model.
KVKK compliance requires explicit consent tracking tied to auth events.

## Decision
Implement custom JWT auth via `lib/auth/jwt.ts` and `lib/member-access.ts`.
Tokens are signed server-side. Role claims are embedded in the JWT payload.
Consent timestamps are stored in the database and validated on each protected route.

## Consequences
**Positive:** Full control over token claims and role logic. KVKK consent can be enforced at the auth layer. No third-party session adapter lock-in.
**Negative:** Social login (Google, GitHub) requires manual OAuth implementation. More code to maintain. Token rotation must be handled manually.

## References
- `lib/auth/jwt.ts`
- `lib/member-access.ts`
- `middleware.ts` (route guards)

## Date
2026-03-15
