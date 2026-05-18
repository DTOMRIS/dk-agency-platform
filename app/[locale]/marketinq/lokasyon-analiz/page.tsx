import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import LokasyonAnalizPage from '@/components/marketinq-ocagi/lokasyon-analiz/LokasyonAnalizPage';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { normalizeLocale, withLocalePrefix } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LokasyonAnalizRoute({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect(withLocalePrefix(locale, '/auth/login?next=/marketinq/lokasyon-analiz'));
  }

  const access = await checkToolAccess(auth.userId, 'lokasyon-analiz', auth.role);
  const t = await getTranslations('marketinq.lokasyonAnaliz');

  if (!access.allowed) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            {t('tier')}
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[var(--dk-navy)]">{t('lockedTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t('lockedBody')}</p>
          <a href={withLocalePrefix(locale, '/uzvluk')} className="mt-5 inline-flex rounded-xl bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white">
            {t('upgradeCta')}
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <LokasyonAnalizPage backHref="/dashboard/marketinq-ocagi" />
    </main>
  );
}
