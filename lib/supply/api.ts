/**
 * TASK-0498 — supply API route-ları üçün ortaq köməkçilər (server-only).
 */

import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { SupplyTablesMissingError, type SupplyDb } from './repository';

/** Lokal/CI-da DATABASE_URL yoxdursa `null`. */
export function supplyDb(): SupplyDb | null {
  return (db as unknown as SupplyDb | null) ?? null;
}

export function dbUnavailable(): NextResponse {
  return NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
}

/**
 * Cədvəl yoxdursa (miqrasiya tətbiq olunmayıb) UI aydın «miqrasiyanı işə salın»
 * halını göstərsin deyə 503 + `tables_missing` kodu. Qalan xətalar 500.
 * Xəta mətni cavaba qoyulmur (SQL/şəxsi məlumat sızmasın).
 */
export function supplyErrorResponse(error: unknown): NextResponse {
  if (error instanceof SupplyTablesMissingError) {
    return NextResponse.json({ error: 'tables_missing' }, { status: 503 });
  }
  return NextResponse.json({ error: 'server_error' }, { status: 500 });
}

export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
