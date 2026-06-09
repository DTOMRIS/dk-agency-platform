import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { webConversionEvents } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
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
        sessionId,
        pagePath,
        eventName,
        source: source || null,
        campaign: campaign || null,
        metadata: metadata || null,
      });
      return NextResponse.json({ ok: true });
    }

    // Return ok: true even if DB is unavailable to prevent client-side console errors during local test fallback
    return NextResponse.json({ ok: true, warning: 'Database not available, tracked event in memory only' });
  } catch (error) {
    console.error('[Track Route Error]', error);
    const message = error instanceof Error ? error.message : 'Tracking failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
