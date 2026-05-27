# ADR-0003: Drizzle ORM Over Prisma

## Status
Accepted

## Context
The project uses PostgreSQL (Neon). ORM choice affects type safety, bundle size, and migration workflow.
Prisma generates a large runtime client and requires a binary query engine.
Drizzle is a TypeScript-first SQL builder with zero runtime dependencies beyond the driver.

## Decision
Use Drizzle ORM. Schema defined in `lib/db/schema.ts` (30 tables).
Migrations managed via `drizzle-kit generate` + `drizzle-kit migrate`.
Queries written in Drizzle's typed query builder; raw SQL allowed for complex joins.

## Consequences
**Positive:** Fully type-safe queries without code generation step. Lightweight bundle. SQL is explicit and readable.
**Negative:** Migrations are manual — drizzle-kit does not auto-apply on deploy. Schema drift risk if `migrate` step is skipped in CI.

## References
- `lib/db/schema.ts`
- `drizzle.config.ts`
- `drizzle/` migrations directory

## Date
2026-03-01
