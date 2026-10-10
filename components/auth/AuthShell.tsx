'use client';

/**
 * @file AuthShell.tsx
 * @purpose TASK-0524 (owner 10.10: «giriş səhifəsi şəxsiyyətsizdir, sol üstdə logo mütləq olmalı, logo
 *          dönsün»). One v2 frame for the whole auth family — login, register, forgot / reset password,
 *          verify e-mail (before: one dark glass page + three light gradient pages). Cream surface, Inter,
 *          white card with the spinning DK mark top-left, ink side panel with what membership gives.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import DkMark from '@/components/brand/DkMark';
import { normalizeLocale, withLocale } from '@/i18n/config';

/** v2 input look for auth forms (icon padding on the left). */
export const AUTH_INPUT =
  'w-full rounded-xl border border-[#E4DCCD] bg-white py-3 pl-10 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';
export const AUTH_LABEL = 'mb-1.5 block text-sm font-bold text-slate-800';
export const AUTH_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-full bg-dk-red-strong py-3.5 font-bold text-white transition-colors hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-60';
export const AUTH_LINK = 'font-bold text-[#BE2F47] transition hover:text-[#0F172A]';

export default function AuthShell({
  title,
  subtitle,
  children,
  backHref,
  narrow = false,
  showAside = true,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** default: home page */
  backHref?: string;
  /** single column card (status pages: verify e-mail, reset done) */
  narrow?: boolean;
  showAside?: boolean;
}) {
  const t = useTranslations('authShell');
  const locale = normalizeLocale(useLocale());
  const aside = showAside && !narrow;

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={backHref ?? withLocale(locale, '/')} backLabel={backHref ? t('backPrev') : t('back')} />
        <div className={`mx-auto mt-6 grid overflow-hidden rounded-[28px] border border-[#E4DCCD] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.25)] ${aside ? 'max-w-5xl md:grid-cols-[1.05fr_0.95fr]' : 'max-w-xl'}`}>
          <div className="p-7 sm:p-10">
            <Link href={withLocale(locale, '/')} aria-label="DK Agency" className="inline-flex" data-testid="auth-logo">
              <DkMark size="lg" spin withName subtitle={t('brandLine')} />
            </Link>
            <h1 className="mt-8 text-[clamp(30px,4vw,42px)] font-black leading-[1.02] tracking-[-0.045em] text-[#0F172A]">{title}</h1>
            {subtitle ? <p className="mt-3 text-[15.5px] leading-7 text-slate-600">{subtitle}</p> : null}
            <div className="mt-7">{children}</div>
          </div>

          {aside ? (
            <div className="relative flex flex-col justify-between gap-8 bg-[#0F172A] p-7 text-white sm:p-10">
              <div>
                <span className={`${home.eyebrow} !text-slate-300`}>
                  <span className={home.dot} />
                  {t('asideEyebrow')}
                </span>
                <p className="mt-4 text-[26px] font-black leading-[1.1] tracking-[-0.035em]">{t('asideTitle')}</p>
                <ul className="mt-6 space-y-3.5">
                  {(['b1', 'b2', 'b3', 'b4'] as const).map((k) => (
                    <li key={k} className="flex gap-3 text-[15px] leading-6 text-slate-200">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-emerald-300">
                        <Check size={14} aria-hidden="true" />
                      </span>
                      {t(`benefits.${k}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[13px] leading-6 text-slate-400">{t('asideNote')}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
