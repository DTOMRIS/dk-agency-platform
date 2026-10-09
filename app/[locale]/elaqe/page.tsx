'use client';

/**
 * /elaqe — əlaqə səhifəsi.
 * TASK-0513: ana səhifə v2 dilinə keçdi (krem fon, Inter 800/900 başlıq, ağ yuvarlaq kartlar).
 * Ünvan yalnız «Bakı, Azərbaycan»-dır — repoda küçə ünvanı yoxdur, ona görə xəritə qoyulmur.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Briefcase, Clock, Mail, MapPin } from 'lucide-react';
import { ContactFunnel } from '@/components/contact/ContactFunnel';
import { inter } from '@/components/home/v2/font';
import { normalizeLocale, withLocale } from '@/i18n/config';

const CONTACT_EMAIL = 'info@dkagency.com.tr';

const INFO_CARD =
  'flex items-center gap-4 rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]';
const INFO_ICON =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#F6F1E9] text-[#E94560]';

export default function ElaqePage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const t = useTranslations('contact');

  return (
    <div className={`${inter.className} bg-[#F6F1E9] text-[#0F172A]`}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={withLocale(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t('back')}
        </Link>

        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">{t('title')}</h1>
          <p className="mb-10 text-lg leading-8 text-slate-600">{t('lead')}</p>
        </div>

        <section aria-labelledby="contact-funnel-title" className="mb-4">
          <h2
            id="contact-funnel-title"
            className="mb-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600"
          >
            <span className="h-2 w-2 rounded-full bg-[#E94560]" aria-hidden="true" />
            {t('funnelTitle')}
          </h2>
          <ContactFunnel />
        </section>

        <div className="mb-8 mt-10 grid gap-4 md:grid-cols-3">
          <div className={INFO_CARD}>
            <span className={INFO_ICON}>
              <Mail size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">{t('emailLabel')}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="break-all font-bold text-slate-900 hover:text-[#E94560]"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className={INFO_CARD}>
            <span className={INFO_ICON}>
              <MapPin size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('addressLabel')}</p>
              <p className="font-bold text-slate-900">{t('address')}</p>
            </div>
          </div>

          <div className={INFO_CARD}>
            <span className={INFO_ICON}>
              <Clock size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('hoursLabel')}</p>
              <p className="font-bold text-slate-900">{t('hours')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)]">
          <div className="mb-2 flex items-center gap-3">
            <span className={INFO_ICON}>
              <Briefcase size={20} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-black text-slate-900">{t('b2bTitle')}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{t('b2bText')}</p>
        </div>
      </div>
    </div>
  );
}
