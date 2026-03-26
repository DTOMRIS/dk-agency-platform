import Link from 'next/link';
import { Crown, Lock, Sparkles, TrendingUp } from 'lucide-react';
import { getCheckoutUrl, getMembershipCapability } from '@/lib/members/provider';
import { getServerMemberSession } from '@/lib/members/server-session';

export const metadata = {
  title: 'Üzvlük | DK Agency',
  description: 'DK Agency member access, premium blog, KAZAN AI və gələcək subscription qatları.',
};

export default async function MembershipPage() {
  const session = await getServerMemberSession();
  const capability = getMembershipCapability();
  const hasAccess = session.loggedIn && (session.plan === 'member' || session.plan === 'admin');

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-red-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
            DK Membership
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
            Premium məqalə, KAZAN AI və satış yönümlü üzvlük qatı
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Bu səhifə member-flow üçün baza qatı kimi quruldu. İndi paywall işləyir, növbəti mərhələdə Supabase auth və ödəniş bu qatın üzərinə bağlanacaq.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Lock className="h-6 w-6 text-red-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Member status</h2>
            <p className="mt-3 text-sm text-slate-600">
              {hasAccess
                ? `Aktiv giriş: ${session.name || session.email} (${session.plan})`
                : 'Hazırda qonaq rejimindəsən. Premium yazılarda 40% sonrası kilid açmaq üçün üzvlük lazımdır.'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Provider mode</h2>
            <p className="mt-3 text-sm text-slate-600">
              Cari rejim: <span className="font-semibold">{capability.provider}</span>. Supabase env gələndə provider avtomatik `supabase` olacaq.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Sales layer</h2>
            <p className="mt-3 text-sm text-slate-600">
              Premium content, KAZAN AI və konsultasiya CTA-ları bu member qatı üzərindən satışa bağlanacaq.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-black text-slate-900">Üzvlük planı</h2>
            </div>

            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Member Monthly</p>
              <p className="mt-3 text-4xl font-black text-slate-900">Tezliklə</p>
              <p className="mt-3 text-sm text-slate-600">
                Bu turda checkout placeholder saxlanır. Ödəniş provideri veriləndə bu CTA birbaşa checkout-a çıxacaq.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={getCheckoutUrl('member')}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Monthly checkout placeholder
                </Link>
                <Link
                  href={getCheckoutUrl('annual')}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  Annual checkout placeholder
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
            <h2 className="text-2xl font-black">Növbəti inteqrasiya planı</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              <li>1. Supabase auth provider və magic link / email-password flow</li>
              <li>2. `member_profiles`, `member_subscriptions`, `member_entitlements` cədvəlləri</li>
              <li>3. Payment webhook ilə entitlement açılması</li>
              <li>4. KAZAN AI usage log və premium analytics</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
