import { FileCheck2 } from 'lucide-react';

export const metadata = {
  title: 'Member Env Checklist | DK Agency',
  description: 'Membership, paywall, checkout və webhook üçün env checklist.',
};

export default function MemberEnvChecklistPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <FileCheck2 className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-black text-slate-900">Member Env Checklist</h1>
          </div>

          <div className="space-y-8 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900">1. Auth</h2>
              <p>`NEXT_PUBLIC_SUPABASE_URL` və `NEXT_PUBLIC_SUPABASE_ANON_KEY` varsa auth adapter avtomatik `supabase` moduna keçir.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">2. Payment</h2>
              <p>`PAYMENT_CHECKOUT_URL` varsa `/api/member/checkout` plan parametrini əlavə edib checkout URL qaytarır.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">3. Webhook</h2>
              <p>`MEMBER_WEBHOOK_SECRET` lazımdır. `/api/member/webhook` endpoint-i `x-member-webhook-secret` header-i ilə qorunur.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">4. App URL</h2>
              <p>`NEXT_PUBLIC_APP_URL` checkout fallback və canonical redirect-lər üçün istifadə olunur.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">5. Son qalan iş</h2>
              <p>Webhook payload-un DB-yə yazılması, entitlement update, billing history UI və failed payment edge-case handling.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
