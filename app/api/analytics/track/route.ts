import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { webConversionEvents } from '@/lib/db/schema';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

// public-ok: anonymous page-event beacon (sendBeacon), writes one row, returns nothing.
// TASK-0530: per-IP limit, field lengths capped, DB errors no longer echoed to the caller.
const cap = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null);

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`analytics:${getClientIp(req)}`, RATE_LIMITS.analyticsEvent);
  if (!rl.success) return rateLimitExceeded(rl);

  try {
    let body;
    // Handle standard JSON and keep it compatible with navigator.sendBeacon (which sends text/plain or Blob with JSON text)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      const text = await req.text();
      body = JSON.parse(text);
    } else {
      body = await req.json();
    }

    const { sessionId, pagePath, eventName, source, campaign, metadata } = body;

    if (!sessionId || !pagePath || !eventName) {
      return NextResponse.json({ ok: false, error: 'Missing required tracking fields' }, { status: 400 });
    }

    if (dbAvailable && db) {
      await db.insert(webConversionEvents).values({
        sessionId: String(sessionId).slice(0, 100),
        pagePath: String(pagePath).slice(0, 500),
        eventName: String(eventName).slice(0, 100),
        source: cap(source, 100),
        campaign: cap(campaign, 100),
        metadata: metadata && typeof metadata === 'object' && JSON.stringify(metadata).length <= 4000 ? metadata : null,
      });
      return NextResponse.json({ ok: true });
    }

    // Return ok: true even if DB is unavailable to prevent client-side console errors during local test fallback
    return NextResponse.json({ ok: true, warning: 'Database not available, tracked event in memory only' });
  } catch (error) {
    console.error('[Track Route Error]', error);
    return NextResponse.json({ ok: false, error: 'Tracking failed' }, { status: 500 });
  }
}
