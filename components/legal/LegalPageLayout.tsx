import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/i18n/config';
import { getLegalContent, type LegalDocument } from '@/lib/legal/getLegalContent';
import LegalRenderer from './LegalRenderer';

interface LegalPageLayoutProps {
  locale: Locale;
  document: LegalDocument;
}

export default async function LegalPageLayout({
  locale,
  document,
}: LegalPageLayoutProps) {
  const [{ content, isFallback }, t] = await Promise.all([
    getLegalContent(locale, document),
    getTranslations({ locale, namespace: 'legal' }),
  ]);

  return (
    <div className="min-h-[70vh] px-4 py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-8">
        {isFallback && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('fallbackNotice')}
          </div>
        )}
        <LegalRenderer content={content} />
      </div>
    </div>
  );
}
