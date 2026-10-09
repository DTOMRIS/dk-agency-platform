'use client';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

type BillingPlan = 'member' | 'annual';

async function startCheckout(plan: BillingPlan) {
  const response = await fetch('/api/member/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });

  const data = await response.json();

  if (!response.ok || !data?.checkoutUrl) {
    throw new Error('checkout_failed');
  }

  window.location.href = data.checkoutUrl as string;
}

export default function CheckoutActions() {
  const t = useTranslations('membershipPage.checkout');
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
  const [error, setError] = useState('');

  const handleCheckout = async (plan: BillingPlan) => {
    setError('');
    setLoadingPlan(plan);

    try {
      await startCheckout(plan);
    } catch {
      setError(t('error'));
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleCheckout('member')}
          disabled={loadingPlan !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-5 py-3 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:bg-dk-red/60"
        >
          {loadingPlan === 'member' && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {t('monthly')}
        </button>
        <button
          type="button"
          onClick={() => handleCheckout('annual')}
          disabled={loadingPlan !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingPlan === 'annual' && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {t('annual')}
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
