/**
 * @file rules.ts
 * @purpose Rule-based daily nudge engine (Hooked model: Trigger → Action).
 * v1: no AI cost, pure logic. First matching rule wins.
 */

import { db, dbAvailable } from '@/lib/db';
import { listings, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { type PriorityKey, getSuggestedToolSlugs, getToolRoute } from '@/lib/data/priorities';

export interface NudgeMessage {
  key: string;
  ctaHref: string | null;
  ctaAction?: 'open_modal';
}

interface NudgeContext {
  userId: number;
  email: string;
  priorities: PriorityKey[] | null;
  locale: string;
}

export async function pickNudge(ctx: NudgeContext): Promise<NudgeMessage | null> {
  // Rule 1: No priorities set → prompt onboarding
  if (!ctx.priorities || ctx.priorities.length === 0) {
    return { key: 'set_priorities', ctaHref: null, ctaAction: 'open_modal' };
  }

  // Rule 2: Has priorities but hasn't tried a tool yet → suggest first tool
  const slugs = getSuggestedToolSlugs(ctx.priorities);
  if (slugs.length > 0) {
    // Check if user has any listing (proxy for engagement)
    if (dbAvailable && db) {
      const userListings = await db
        .select({ id: listings.id })
        .from(listings)
        .where(eq(listings.ownerId, ctx.userId))
        .limit(1);

      if (userListings.length === 0) {
        return {
          key: 'try_first_tool',
          ctaHref: `/${ctx.locale}/marketinq/${getToolRoute(slugs[0])}`,
        };
      }

      // Rule 3-5: Listing status nudges
      const recentListings = await db
        .select({
          id: listings.id,
          status: listings.status,
          createdAt: listings.createdAt,
        })
        .from(listings)
        .where(eq(listings.ownerId, ctx.userId))
        .orderBy(desc(listings.createdAt))
        .limit(5);

      for (const listing of recentListings) {
        const ageMs = Date.now() - new Date(listing.createdAt!).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);

        if (listing.status === 'submitted' && ageHours > 24) {
          return {
            key: 'listing_pending',
            ctaHref: `/b2b-panel/ilanlarim`,
          };
        }

        if (listing.status === 'docs_requested') {
          return {
            key: 'docs_needed',
            ctaHref: `/b2b-panel/ilanlarim`,
          };
        }

        if (listing.status === 'showcase_ready' && ageHours < 48) {
          return {
            key: 'listing_live',
            ctaHref: `/b2b-panel/ilanlarim`,
          };
        }
      }
    }
  }

  // Rule 6: Fallback — comeback nudge (generic)
  return { key: 'comeback', ctaHref: `/${ctx.locale}/marketinq` };
}
