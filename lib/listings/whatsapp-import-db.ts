/**
 * @file lib/listings/whatsapp-import-db.ts
 * @purpose TASK-0497 — DB side of the WhatsApp import: read-only duplicate check and draft
 *          creation through the shared createListing() path.
 *
 * Contact privacy: the poster's name/phone/e-mail go to contact_name/contact_phone/contact_email,
 * which the public listing mapper (lib/db/listings-repository.ts mapDbListing) never exposes.
 * The legacy public fields (owner_name/phone/email — used by the public "WhatsApp ilə yaz"
 * button) point to DK Agency, so inquiries come through DK, never to the poster directly.
 */

import { desc, isNull } from 'drizzle-orm';

import { WHATSAPP_NUMBER } from '@/lib/contact-channels';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { createListing, type CreateListingValues } from '@/lib/listings/create-listing';
import {
  normalizePhone,
  sanitizeTypeSpecific,
  stripContacts,
  type ConfirmItem,
} from '@/lib/listings/whatsapp-import';
import { generateTrackingCode } from '@/lib/utils/tracking';

export const SITE_URL = 'https://dkagency.com.tr';
const DK_OWNER_NAME = 'DK Agency';
const DK_EMAIL = 'info@dkagency.com.tr';
/** Fallback for the NOT NULL city column when the message names no city (owner edits it). */
export const UNKNOWN_CITY = 'Naməlum';

export interface DuplicateHit {
  id: number;
  trackingCode: string;
  title: string;
  reason: 'phone' | 'title';
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLocaleLowerCase('az')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / Math.min(a.size, b.size);
}

function lastDigits(phone: string | null | undefined): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : '';
}

/**
 * Read-only: compares each candidate with the 1000 most recent listings by contact phone
 * (last 9 digits) and title token overlap (≥ 0.7). Returns hits keyed by candidate index.
 */
export async function findDuplicates(
  candidates: Array<{ title: string; contactPhone: string | null }>
): Promise<Record<number, DuplicateHit>> {
  if (!db || !candidates.length) return {};
  const rows = await db
    .select({
      id: listings.id,
      trackingCode: listings.trackingCode,
      title: listings.title,
      phone: listings.phone,
      contactPhone: listings.contactPhone,
    })
    .from(listings)
    .where(isNull(listings.deletedAt))
    .orderBy(desc(listings.id))
    .limit(1000);

  const dkDigits = lastDigits(WHATSAPP_NUMBER);
  const prepared = rows.map((row) => ({ ...row, words: tokens(row.title) }));
  const hits: Record<number, DuplicateHit> = {};
  candidates.forEach((candidate, index) => {
    const phone = lastDigits(candidate.contactPhone);
    const words = tokens(candidate.title);
    for (const row of prepared) {
      const rowPhones = [lastDigits(row.contactPhone), lastDigits(row.phone)].filter(
        (p) => p && p !== dkDigits
      );
      if (phone && rowPhones.includes(phone)) {
        hits[index] = {
          id: row.id,
          trackingCode: row.trackingCode,
          title: row.title,
          reason: 'phone',
        };
        return;
      }
      if (words.size >= 3 && similarity(words, row.words) >= 0.7) {
        hits[index] = {
          id: row.id,
          trackingCode: row.trackingCode,
          title: row.title,
          reason: 'title',
        };
        return;
      }
    }
  });
  return hits;
}

export function importOriginNote(channel: 'admin' | 'telegram', now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return channel === 'telegram'
    ? `Mənbə: WhatsApp import (Telegram forward), ${date}`
    : `Mənbə: WhatsApp import, ${date}`;
}

/** tracking_code has a random 4-digit suffix and a UNIQUE constraint — retry on collision. */
async function createWithFreshCode(values: CreateListingValues) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await createListing(attempt === 0 ? values : { ...values, trackingCode: generateTrackingCode() });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (attempt >= 2 || !/tracking_code|unique|duplicate/i.test(message)) throw err;
    }
  }
}

export interface CreatedDraft {
  id: number;
  trackingCode: string;
  title: string;
  adminUrl: string;
}

/**
 * Row for one imported draft: status 'submitted' (never published), not showcased, no slug (so it
 * is not reachable on the public /ilanlar/<slug> route until the owner publishes it). The poster's
 * contact goes to the private contact_* columns; the public owner/phone/email point to DK Agency.
 */
export function buildDraftValues(item: ConfirmItem, note: string): CreateListingValues {
  // Re-validate against the config for the (possibly owner-changed) type.
  const { data } = sanitizeTypeSpecific(item.type, item.typeSpecificData);
  const title = stripContacts(item.title).slice(0, 200) || item.title;
  return {
    trackingCode: generateTrackingCode(),
    type: item.type,
    sector: null,
    status: 'submitted',
    isShowcase: false,
    isFeatured: false,
    ownerId: null,
    slug: null,
    title,
    description: stripContacts(item.description) || title,
    price: item.price ? Math.round(item.price) : null,
    priceLabel: null,
    currency: item.currency,
    city: item.city?.trim() || UNKNOWN_CITY,
    district: item.district?.trim() || null,
    ownerName: DK_OWNER_NAME,
    phone: WHATSAPP_NUMBER,
    email: DK_EMAIL,
    contactName: item.contactName?.trim() || null,
    contactPhone: normalizePhone(item.contactPhone),
    contactEmail: item.contactEmail?.trim() || null,
    typeSpecificData: data,
    equipment: item.equipment,
    aiAnalysis: null,
    committeeNotes: note,
  };
}

/** Creates one draft per item through the shared createListing() path. */
export async function createImportedDrafts(
  items: ConfirmItem[],
  channel: 'admin' | 'telegram'
): Promise<{ created: CreatedDraft[]; failed: Array<{ title: string; error: string }> }> {
  const created: CreatedDraft[] = [];
  const failed: Array<{ title: string; error: string }> = [];
  const note = importOriginNote(channel);

  for (const item of items) {
    try {
      const values = buildDraftValues(item, note);
      const listing = await createWithFreshCode(values);
      created.push({
        id: listing.id,
        trackingCode: listing.trackingCode,
        title: values.title,
        adminUrl: `${SITE_URL}/dashboard/ilanlar/${listing.id}`,
      });
    } catch (err) {
      failed.push({
        title: item.title,
        error: err instanceof Error ? err.message.slice(0, 200) : 'unknown',
      });
    }
  }
  return { created, failed };
}
