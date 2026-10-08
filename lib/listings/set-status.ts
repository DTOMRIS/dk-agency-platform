/**
 * @file lib/listings/set-status.ts
 * @purpose Single status-transition path for listings — used by the admin batch route
 *          (/api/listings/batch-status) and the Telegram approve/reject buttons (TASK-0511).
 */

import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { canTransition, type ListingWorkflowStatus } from '@/lib/utils/listingStatus';

export type SetStatusResult = { updated: number; skipped: number; errors: string[] };

/** Moves every id whose current status allows `targetStatus`; others are skipped with a reason. */
export async function setListingsStatus(
  ids: number[],
  targetStatus: ListingWorkflowStatus,
  rejectedReason?: string
): Promise<SetStatusResult> {
  const results: SetStatusResult = { updated: 0, skipped: 0, errors: [] };
  if (!db || ids.length === 0) return results;

  const rows = await db
    .select({ id: listings.id, status: listings.status })
    .from(listings)
    .where(inArray(listings.id, ids));

  const validIds: number[] = [];
  for (const row of rows) {
    const currentStatus = row.status as ListingWorkflowStatus;
    if (!canTransition(currentStatus, targetStatus)) {
      results.skipped++;
      results.errors.push(`#${row.id}: ${currentStatus} → ${targetStatus} keçid mümkün deyil`);
      continue;
    }
    validIds.push(row.id);
  }

  if (validIds.length > 0) {
    const set: Record<string, unknown> = {
      status: targetStatus,
      updatedAt: new Date(),
      publishedAt: targetStatus === 'showcase_ready' ? new Date() : null,
    };
    if (targetStatus === 'rejected' && rejectedReason) set.rejectedReason = rejectedReason;
    if (targetStatus === 'showcase_ready') set.approvedAt = new Date();

    await db.update(listings).set(set).where(inArray(listings.id, validIds));
    results.updated = validIds.length;
  }
  return results;
}

/**
 * Telegram "approve": walks the allowed transitions (submitted/ai_checked → committee_review →
 * showcase_ready) so the listing ends up published exactly as if an admin had clicked both steps.
 */
export async function approveListingFromTelegram(
  id: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'already_decided' }> {
  if (!db) return { ok: false, reason: 'not_found' };
  const [row] = await db.select({ status: listings.status }).from(listings).where(inArray(listings.id, [id]));
  if (!row) return { ok: false, reason: 'not_found' };
  if (row.status === 'showcase_ready') return { ok: false, reason: 'already_decided' };

  const current = row.status as ListingWorkflowStatus;
  if (current === 'submitted' || current === 'ai_checked' || current === 'docs_requested' || current === 'rejected') {
    const first = await setListingsStatus([id], 'committee_review');
    if (first.updated === 0) return { ok: false, reason: 'already_decided' };
  }
  const done = await setListingsStatus([id], 'showcase_ready');
  return done.updated > 0 ? { ok: true } : { ok: false, reason: 'already_decided' };
}

export async function rejectListingFromTelegram(
  id: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'already_decided' }> {
  if (!db) return { ok: false, reason: 'not_found' };
  const [row] = await db.select({ status: listings.status }).from(listings).where(inArray(listings.id, [id]));
  if (!row) return { ok: false, reason: 'not_found' };
  const done = await setListingsStatus([id], 'rejected', 'Telegram üzərindən rədd edildi');
  return done.updated > 0 ? { ok: true } : { ok: false, reason: 'already_decided' };
}
