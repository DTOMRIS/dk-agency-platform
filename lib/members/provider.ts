export type MembershipProvider = 'local' | 'supabase';

export interface MembershipCapability {
  provider: MembershipProvider;
  hasSupabase: boolean;
  hasPayment: boolean;
  checkoutMode: 'placeholder' | 'external';
}

export function getMembershipCapability(): MembershipCapability {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasPayment = Boolean(process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_CHECKOUT_URL);

  return {
    provider: hasSupabase ? 'supabase' : 'local',
    hasSupabase,
    hasPayment,
    checkoutMode: hasPayment ? 'external' : 'placeholder',
  };
}

export function getCheckoutUrl(plan: 'member' | 'annual') {
  const external = process.env.PAYMENT_CHECKOUT_URL;

  if (external) {
    const url = new URL(external);
    url.searchParams.set('plan', plan);
    return url.toString();
  }

  return `/uzvluk?plan=${plan}`;
}
