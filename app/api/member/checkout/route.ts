import { NextRequest, NextResponse } from 'next/server';
import { resolveCheckoutUrl, type BillingPlan } from '@/lib/members/billing';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { plan?: BillingPlan };
  const plan = body.plan === 'annual' ? 'annual' : 'member';
  const origin = request.nextUrl.origin;
  const resolved = resolveCheckoutUrl(plan, origin);

  return NextResponse.json({
    ok: true,
    plan,
    mode: resolved.mode,
    checkoutUrl: resolved.checkoutUrl,
  });
}
