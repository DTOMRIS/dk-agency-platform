/**
 * @file app/[locale]/uzvluk/page.tsx
 * @purpose Public membership page — what an account gives, sign-up/sign-in, paid plans when payments exist.
 *          Replaces the internal developer status page that was publicly visible (TASK-0472).
 * @pattern A (getTranslations) — membershipPage
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Inbox, LayoutDashboard, Megaphone } from 'lucide-react';
import CheckoutActions from '@/components/members/CheckoutActions';
import MemberLogoutButton from '@/components/members/MemberLogoutButton';
import { getMembershipCapability } from '@/lib/members/provider';
import { getServerMemberSession } from '@/lib/members/server-session';
import { normalizeLocale, withLocale } from '@/i18n/config';
import PageBack from '@/components/inner/PageBack';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('membershipPage');
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function MembershipPage() {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations('membershipPage');
  const session = await getServerMemberSession();
  const capability = getMembershipCapability();

  const benefits = [
    { key: 'listings', icon: Megaphone },
    { key: 'leads', icon: Inbox },
    { key: 'panel', icon: LayoutDashboard },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <PageBack />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <span className="text-[13px] font-semibold tracking-[0.1em] text-rose-700">{t('eyebrow')}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{t('lead')}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {benefits.map(({ key, icon: Icon }) => (
            <div key={key} className="rounded-2xl border border-stone-200 bg-white p-6">
              <Icon className="h-6 w-6 text-rose-700" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{t(`benefits.${key}.title`)}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{t(`benefits.${key}.body`)}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[15px] text-slate-700">
          {t('freeNote')}{' '}
          <Link href={withLocale(locale, '/toolkit')} className="font-semibold text-rose-700 hover:text-rose-800">
            {t('toolsCta')} →
          </Link>
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" aria-labelledby="membership-status">
            <h2 id="membership-status" className="text-xl font-bold text-slate-900">{t('statusTitle')}</h2>
            {session.loggedIn ? (
              <>
                <p className="mt-3 text-[15px] text-slate-700">{t('activeText', { name: session.name || session.email || '' })}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href={withLocale(locale, '/b2b-panel')}
                    className="inline-flex h-12 items-center rounded-xl bg-[#E11D48] px-5 font-semibold text-white hover:bg-[#BE123C]"
                  >
                    {t('panelCta')}
                  </Link>
                  <MemberLogoutButton />
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-[15px] text-slate-700">{t('guestText')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={withLocale(locale, '/auth/register')}
                    className="inline-flex h-12 items-center rounded-xl bg-[#E11D48] px-5 font-semibold text-white hover:bg-[#BE123C]"
                  >
                    {t('registerCta')}
                  </Link>
                  <Link
                    href={withLocale(locale, '/auth/login')}
                    className="inline-flex h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold text-slate-900 hover:border-slate-500"
                  >
                    {t('loginCta')}
                  </Link>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" aria-labelledby="membership-plans">
            <h2 id="membership-plans" className="text-xl font-bold text-slate-900">{t('plansTitle')}</h2>
            <p className="mt-3 text-[15px] text-slate-700">{capability.hasPayment ? t('plansReady') : t('plansSoon')}</p>
            {capability.hasPayment && <CheckoutActions />}
          </section>
        </div>
      </div>
    </div>
  );
}
