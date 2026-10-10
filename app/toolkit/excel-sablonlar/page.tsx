import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Check, Download, FileSpreadsheet, Lock } from 'lucide-react';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { EXCEL_TEMPLATES } from '@/lib/excel-templates/catalog';
import { getServerMemberSession } from '@/lib/members/server-session';

/**
 * /toolkit/excel-sablonlar — TASK-0532 (owner 10.10: «üye olanlara excel dosya verelim, dili düzgün, bizi
 * tanıtsın, logo olsun»). Five DK-branded Excel templates; the preview is open to everyone, the download is
 * for (free) members — the button goes through /api/member/excel-templates/[slug], guests get «Pulsuz üzv ol».
 */
export const metadata: Metadata = {
  title: 'Restoran üçün Excel şablonları — DK Agency',
  description:
    'Mənfəət və zərər (12 ay), anbar və maya dəyəri, əmək haqqı xərcləri, büdcə və faktiki, balans — formullu, Azərbaycan dilində Excel şablonları. Üzvlər üçün pulsuz.',
};

export const dynamic = 'force-dynamic';

export default async function ExcelTemplatesPage() {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations('excelTemplates');
  const session = await getServerMemberSession();
  const member = session.loggedIn;
  const here = withLocale(locale, '/toolkit/excel-sablonlar');

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/toolkit')} backLabel={t('back')} trail={t('trail')} />
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('eyebrow')}
              </span>
            </div>
            <h1>{t('title')}</h1>
            <p className={s.lead}>{t('lead')}</p>
          </div>
        </div>

        <ul className="mb-8 flex flex-wrap gap-2.5" aria-label={t('featuresLabel')}>
          {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
            <li key={k} className="inline-flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#0F172A]">
              <Check size={15} className="text-emerald-600" aria-hidden="true" />
              {t(`features.${k}`)}
            </li>
          ))}
        </ul>

        {!member ? (
          <div className="mb-8 flex flex-col gap-4 rounded-[22px] bg-[#0F172A] p-6 text-white sm:flex-row sm:items-center sm:justify-between" data-testid="templates-gate">
            <div>
              <p className="text-[17px] font-black">{t('gate.title')}</p>
              <p className="mt-1 text-[14px] leading-6 text-slate-300">{t('gate.body')}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href={`${withLocale(locale, '/auth/register')}?next=${encodeURIComponent(here)}`} className="inline-flex min-h-11 items-center rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white hover:bg-dk-red-deep">
                {t('gate.register')}
              </Link>
              <Link href={`${withLocale(locale, '/auth/login')}?next=${encodeURIComponent(here)}`} className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-[14px] font-bold text-white hover:bg-white/10">
                {t('gate.login')}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {EXCEL_TEMPLATES.map((tpl, i) => (
            <article key={tpl.slug} className="flex flex-col overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white" data-testid={`template-${tpl.slug}`}>
              <div className="relative aspect-[16/9] overflow-hidden border-b border-[#EFE9DE] bg-[#FBF8F3]">
                <Image src={tpl.preview} alt={t('previewAlt', { name: t(`items.${tpl.slug}.title`) })} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover object-top" priority={i < 2} />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="inline-flex items-center gap-1.5 text-[11.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">
                  <FileSpreadsheet size={14} aria-hidden="true" />
                  {t('format')}
                </p>
                <h2 className="mt-2 text-[20px] font-black leading-tight tracking-[-0.02em] text-[#0F172A]">{t(`items.${tpl.slug}.title`)}</h2>
                <p className="mt-2 text-[14.5px] leading-6 text-slate-600">{t(`items.${tpl.slug}.body`)}</p>
                <ul className="mt-3 space-y-1.5 text-[13.5px] text-slate-700">
                  {(['b1', 'b2', 'b3'] as const).map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                      {t(`items.${tpl.slug}.${b}`)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  {member ? (
                    <a href={`/api/member/excel-templates/${tpl.slug}`} download className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white hover:bg-dk-red-deep" data-testid="template-download">
                      <Download size={16} aria-hidden="true" />
                      {t('download')}
                    </a>
                  ) : (
                    <Link href={`${withLocale(locale, '/auth/register')}?next=${encodeURIComponent(here)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-bold text-[#0F172A] hover:border-[#0F172A]" data-testid="template-locked">
                      <Lock size={15} aria-hidden="true" />
                      {t('locked')}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-[13px] leading-6 text-slate-500">{t('note')}</p>
      </div>
    </div>
  );
}
