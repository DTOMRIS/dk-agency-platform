'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Briefcase, Clock, Mail, MapPin } from 'lucide-react';
import { ContactFunnel } from '@/components/contact/ContactFunnel';
import { normalizeLocale, withLocale } from '@/i18n/config';

const CONTACT_EMAIL = 'info@dkagency.com.tr';

export default function ElaqePage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const t = useTranslations('contact');

  return (
    <div className="bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={withLocale(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--dk-muted)] transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          {t('back')}
        </Link>

        <div className="max-w-2xl">
          <h1 className="mb-4 font-display text-4xl font-bold text-[var(--dk-navy)]">{t('title')}</h1>
          <p className="mb-10 text-lg leading-8 text-slate-600">{t('lead')}</p>
        </div>

        <section aria-labelledby="contact-funnel-title" className="mb-8">
          <h2 id="contact-funnel-title" className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">
            {t('funnelTitle')}
          </h2>
          <ContactFunnel />
        </section>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <Mail size={22} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{t('emailLabel')}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-slate-900 hover:text-brand-red">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <MapPin size={22} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{t('addressLabel')}</p>
              <p className="font-semibold text-slate-900">{t('address')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <Clock size={22} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{t('hoursLabel')}</p>
              <p className="font-semibold text-slate-900">{t('hours')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <Briefcase size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">{t('b2bTitle')}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{t('b2bText')}</p>
        </div>
      </div>
    </div>
  );
}
