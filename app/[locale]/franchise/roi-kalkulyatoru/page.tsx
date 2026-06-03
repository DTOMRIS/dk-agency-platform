import { useTranslations } from 'next-intl';
import RoiCalculator from '@/components/franchise/RoiCalculator';
import LeadForm from '@/components/franchise/LeadForm';

export default function RoiPage() {
  const t = useTranslations('franchiseRoi');
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 border border-amber-200">
            {t('badge')}
          </span>
          <h1 className="mb-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">{t('title')}</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500">{t('subtitle')}</p>
        </div>
        <RoiCalculator />
        <div className="mt-8">
          <LeadForm toolSource="roi_calc" />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
