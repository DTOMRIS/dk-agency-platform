/**
 * @file lib/analytics/attribution-server.ts
 * @purpose TASK-0541: read the `dk_attr` cookie in a lead endpoint and record one `lead` row in
 *          `web_conversion_events` (eventName 'lead', source, campaign, metadata.type). Never throws.
 */

import type { NextRequest } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { webConversionEvents } from '@/lib/db/schema';
import { ATTR_COOKIE, parseAttribution, type Attribution } from '@/lib/analytics/attribution';

export type LeadType =
  | 'register'
  | 'whatsapp_click'
  | 'channel_click'
  | 'kazan_lead'
  | 'ota_guide'
  | 'franchise_radar'
  | 'franchise_lead'
  | 'newsletter'
  | 'listing_created'
  | 'listing_lead';

export function readAttribution(req: Pick<NextRequest, 'cookies'>): Attribution | null {
  try {
    return parseAttribution(req.cookies.get(ATTR_COOKIE)?.value);
  } catch {
    return null;
  }
}

/**
 * Records the lead's source. Read the attribution with `readAttribution(req)` in the handler (before
 * `after()`), pass it here and to `attributionLine()` for the owner message.
 */
export async function recordLeadSource(
  a: Attribution | null,
  type: LeadType,
  pagePath?: string | null,
): Promise<void> {
  try {
    if (dbAvailable && db) {
      await db.insert(webConversionEvents).values({
        sessionId: a?.id ?? 'no-cookie',
        pagePath: (pagePath || a?.l || '/').slice(0, 500),
        eventName: 'lead',
        source: a?.s ?? 'unknown',
        campaign: a?.c ?? null,
        metadata: { type, medium: a?.m ?? null, referrer: a?.r ?? null, landing: a?.l ?? null, touchAt: a?.t ?? null },
      });
    }
  } catch {
    // attribution is best-effort — never block a lead
  }
}
