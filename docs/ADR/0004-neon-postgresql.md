# ADR-0004: Neon Serverless PostgreSQL

## Status
Accepted

## Context
The application runs on Hostinger (Node.js) and may scale to serverless edge functions.
A traditional PostgreSQL instance requires persistent connections, which is problematic in serverless environments.
Neon provides a serverless PostgreSQL with HTTP and WebSocket connection pooling.

## Decision
Use Neon as the PostgreSQL provider. Connect via the pooler endpoint (`@neondatabase/serverless`).
Connection string stored in `DATABASE_URL` environment variable.
Drizzle ORM uses the Neon serverless driver for all queries.

## Consequences
**Positive:** Serverless-compatible connection pooling. Database branching for staging environments. Auto-suspend on idle reduces cost.
**Negative:** WebSocket connections have a cold start latency (~100-300ms on first request after idle). Not suitable for long-running transactions.

## References
- `lib/db/index.ts`
- Neon dashboard: console.neon.tech
- `@neondatabase/serverless` package

## Date
2026-03-01
