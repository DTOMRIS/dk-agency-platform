export type BillingPlan = 'member' | 'annual';

export interface CheckoutResult {
  ok: boolean;
  mode: 'external' | 'placeholder';
  checkoutUrl: string;
}

export interface WebhookAck {
  ok: boolean;
  provider: string;
  action: string;
}

export function resolveCheckoutUrl(plan: BillingPlan, origin?: string) {
  const external = process.env.PAYMENT_CHECKOUT_URL;

  if (external) {
    const url = new URL(external);
    url.searchParams.set('plan', plan);
    return {
      mode: 'external' as const,
      checkoutUrl: url.toString(),
    };
  }

  const fallbackBase = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://dkagency.az';
  const url = new URL('/uzvluk', fallbackBase);
  url.searchParams.set('plan', plan);
  url.searchParams.set('checkout', 'placeholder');

  return {
    mode: 'placeholder' as const,
    checkoutUrl: url.toString(),
  };
}

export function validateWebhookSecret(secret: string | null) {
  const expected = process.env.MEMBER_WEBHOOK_SECRET;

  if (!expected) {
    return false;
  }

  return secret === expected;
}
