import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSecret } from '@/lib/members/billing';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-member-webhook-secret');

  if (!validateWebhookSecret(secret)) {
    return NextResponse.json({ ok: false, error: 'Webhook secret yanlışdır.' }, { status: 401 });
  }

  const body = await request.json();
  const provider = typeof body?.provider === 'string' ? body.provider : 'manual';
  const action = typeof body?.action === 'string' ? body.action : 'subscription.updated';

  console.log('[member-webhook]', {
    provider,
    action,
    timestamp: new Date().toISOString(),
    payload: body,
  });

  return NextResponse.json({
    ok: true,
    provider,
    action,
  });
}
