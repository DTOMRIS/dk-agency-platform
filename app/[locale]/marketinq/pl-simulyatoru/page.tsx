import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PLSimulator from '@/components/marketinq/PLSimulator';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { normalizeLocale, withLocalePrefix } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PLSimulatorPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect(withLocalePrefix(locale, '/auth/login?next=/marketinq/pl-simulyatoru'));
  }

  const access = await checkToolAccess(auth.userId, 'pnl-simulator', auth.role);
  const t = await getTranslations('marketinq.plSimulator');

  if (!access.allowed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-amber-700">
            USTA
          </div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{t('tier_required_title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{t('tier_required_body')}</p>
          <Link
            href={withLocalePrefix(locale, '/qiymet')}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--dk-red)] px-5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90"
          >
            {t('upgrade_cta')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PLSimulator backHref="/dashboard/marketinq-ocagi" />
    </main>
  );
}
