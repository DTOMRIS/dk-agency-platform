/**
 * @file lib/listings/create-listing.ts
 * @purpose Single server-side insert path for listings (TASK-0497).
 *
 * Used by POST /api/listings (member + admin "Yeni elan yarat" form) and by the WhatsApp /
 * Telegram import (lib/listings/whatsapp-import-db.ts), so every listing gets the same
 * defaults, media rows and the fire-and-forget DeepSeek analysis.
 */

import { db } from '@/lib/db';
import { listingMedia, listings } from '@/lib/db/schema';

type ListingInsert = typeof listings.$inferInsert;

export type CreateListingValues = Omit<ListingInsert, 'id' | 'createdAt' | 'updatedAt'>;

export interface CreateListingOptions {
  /** Image URLs (first one becomes the showcase image). */
  images?: unknown[];
  /** Run lib/listings/ai-analyze in the background (default true). */
  analyze?: boolean;
}

export async function createListing(
  values: CreateListingValues,
  options: CreateListingOptions = {}
): Promise<{ id: number; trackingCode: string }> {
  if (!db) throw new Error('Database is not available');

  const inserted = await db
    .insert(listings)
    .values(values)
    .returning({ id: listings.id, trackingCode: listings.trackingCode });
  const listing = inserted[0];

  for (const [index, image] of (options.images ?? []).entries()) {
    const record = image as { url?: string; preview?: string } | string;
    await db.insert(listingMedia).values({
      listingId: listing.id,
      url: typeof record === 'string' ? record : record.url || record.preview || '',
      type: 'image',
      isShowcase: index === 0,
      sortOrder: index,
    });
  }

  if (options.analyze !== false) {
    // Fire-and-forget: AI analysis via DeepSeek
    import('@/lib/listings/ai-analyze')
      .then(({ analyzeListingAsync }) => {
        analyzeListingAsync(listing.id).catch((err) =>
          console.error('[ai] Listing analysis failed:', err)
        );
      })
      .catch((err) => console.error('[ai] Listing analysis import failed:', err));
  }

  return listing;
}
