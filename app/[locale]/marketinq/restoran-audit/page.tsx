import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AuditHub from '@/components/marketinq-ocagi/hubs/AuditHub';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { normalizeLocale, withLocalePrefix } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RestoranAuditRoute({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect(withLocalePrefix(locale, '/auth/login?next=/marketinq/restoran-audit'));
  }

  const access = await checkToolAccess(auth.userId, 'restoran-audit', auth.role);
  const t = await getTranslations('marketinq.restoranAudit');

  if (!access.allowed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-[#F6F1E9] px-3 py-1 text-xs font-bold uppercase text-red-700">
            {t('tier')}
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{t('tier_required_title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{t('tier_required_body')}</p>
          <Link
            href={withLocalePrefix(locale, '/pricing')}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90"
          >
            {t('upgrade_cta')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <AuditHub initialTab="business" backHref={withLocalePrefix(locale, '/marketinq')} />
    </main>
  );
}
