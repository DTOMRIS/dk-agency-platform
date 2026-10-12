/**
 * @file JobsPage.tsx
 * @purpose «İş elanları» vitrini — TQTA (tqta.az) elanlarını göstərir, müraciət TQTA-da tamamlanır.
 * @pattern A (getTranslations) — jobs
 * TASK-0495
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CircleAlert,
  GraduationCap,
  MapPin,
  SearchX,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { withLocale, type Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';
import {
  JOB_CATEGORIES,
  TQTA_CAREER_URL,
  TQTA_EMPLOYER_URL,
  TQTA_HOME_URL,
  getTqtaJobs,
  type JobCategory,
  type TqtaJob,
} from '@/lib/tqta/jobs';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

export interface JobsSearchParams {
  kategori?: string | string[];
  city?: string | string[];
}

const BASE_PATH = '/is-elanlari';
const LIST_ANCHOR = 'vakansiyalar';

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function formatPosted(value: string | null, locale: Locale): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (locale === 'az')
    return formatAzDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Baku',
  }).format(date);
}

function countBy<T extends string>(items: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) map.set(item, (map.get(item) ?? 0) + 1);
  return map;
}

function CompanyMark({ job }: { job: TqtaJob }) {
  if (job.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- xarici TQTA logosu, next/image domen siyahısında deyil
      <img
        src={job.logoUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-12 w-12 shrink-0 rounded-xl border border-[#E4DCCD] bg-white object-contain p-1"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-sm font-black tracking-wide text-white"
    >
      {job.initials}
    </span>
  );
}

export default async function JobsPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: JobsSearchParams;
}) {
  const t = await getTranslations({ locale, namespace: 'jobs' });
  const { ok, jobs } = await getTqtaJobs();

  const basePath = withLocale(locale, BASE_PATH);
  const rawCategory = firstParam(searchParams.kategori);
  const activeCategory = (JOB_CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as JobCategory)
    : null;
  const rawCity = firstParam(searchParams.city);
  const activeCity = jobs.some((j) => j.cityKey === rawCity) ? rawCity : null;

  const filtered = jobs.filter(
    (j) =>
      (!activeCategory || j.category === activeCategory) &&
      (!activeCity || j.cityKey === activeCity)
  );

  const categoryCounts = countBy(
    jobs.filter((j) => !activeCity || j.cityKey === activeCity).map((j) => j.category)
  );
  const categoryOptions = JOB_CATEGORIES.filter((c) => (categoryCounts.get(c) ?? 0) > 0);

  const cityLabels = new Map<string, string>();
  for (const j of jobs) if (j.cityKey) cityLabels.set(j.cityKey, j.city);
  const cityCounts = countBy(
    jobs
      .filter((j) => j.cityKey && (!activeCategory || j.category === activeCategory))
      .map((j) => j.cityKey)
  );
  const cityOptions = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]);

  const companyCount = new Set(jobs.map((j) => j.company.toLocaleLowerCase('az'))).size;

  function filterHref(next: { kategori?: string | null; city?: string | null }): string {
    const category = next.kategori === undefined ? activeCategory : next.kategori;
    const city = next.city === undefined ? activeCity : next.city;
    const params = new URLSearchParams();
    if (category) params.set('kategori', category);
    if (city) params.set('city', city);
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ''}#${LIST_ANCHOR}`;
  }

  const chipBase =
    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition';
  const chipIdle = `${chipBase} border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A] hover:text-[#0F172A]`;
  const chipActive = `${chipBase} border-[#0F172A] bg-[#0F172A] text-white`;

  return (
    <div className={`${s.page} pb-24`}>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className={home.wrap}>
        <div className="grid items-end gap-10 pb-10 pt-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <span className={home.eyebrow}>
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {t('badge')}
            </span>
            <h1 className="mt-4 text-[clamp(34px,4.6vw,56px)] font-black leading-none tracking-[-0.05em] text-[#0F172A]">
              {t('title')}
            </h1>
            <p className={`${s.lead} mt-4`}>{t('subtitle')}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href={`#${LIST_ANCHOR}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white transition hover:bg-dk-red-deep"
              >
                {t('ctaBrowse')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#isegoturen"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-bold text-[#0F172A] transition hover:border-[#0F172A]"
              >
                {t('ctaEmployer')}
              </a>
            </div>
          </div>
          {ok && jobs.length > 0 && (
            <dl className="grid grid-cols-3 gap-3">
              {[
                { value: jobs.length, label: t('statJobs') },
                { value: companyCount, label: t('statCompanies') },
                { value: cityLabels.size, label: t('statCities') },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse justify-end rounded-[22px] border border-[#E4DCCD] bg-white px-3 py-4 text-center"
                >
                  <dt className="mt-1 text-xs font-semibold text-[#5B6474]">{stat.label}</dt>
                  <dd className="text-3xl font-black tabular-nums tracking-[-0.03em] text-[#0F172A] [font-variant-numeric:lining-nums_tabular-nums]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Certified staff strip ───────────────────────────── */}
      <section className="border-y border-[#E4DCCD] bg-white">
        <div className={`${home.wrap} flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <p className="text-sm leading-6 text-[#334155]">
              <strong className="font-bold text-[#0F172A]">{t('certTitle')}.</strong>{' '}
              {t('certBody')}
            </p>
          </div>
          <a
            href={TQTA_HOME_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#0F172A] underline-offset-4 hover:text-[#BE2F47] hover:underline"
          >
            {t('certCta')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ── Listing ─────────────────────────────────────────── */}
      <section
        id={LIST_ANCHOR}
        className={`${home.wrap} scroll-mt-24 py-10`}
      >
        {!ok ? (
          <div className="rounded-[22px] border border-dashed border-[#E4DCCD] bg-white px-6 py-14 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <CircleAlert className="h-8 w-8 text-amber-700" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-[22px] font-black tracking-[-0.02em] text-[#0F172A]">
              {t('unavailableTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5B6474]">
              {t('unavailableBody')}
            </p>
            <a
              href={TQTA_CAREER_URL}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
            >
              {t('unavailableCta')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[clamp(22px,2.6vw,30px)] font-black leading-tight tracking-[-0.03em] text-[#0F172A]">
                  {t('listTitle')}
                </h2>
                <p className="mt-1 text-sm text-[#5B6474]">{t('sourceNote')}</p>
              </div>
              <p className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-800">
                {t('resultCount', { count: filtered.length })}
              </p>
            </div>

            {/* Filters — links (server-side, no JS); chips wrap (L-045) */}
            <div className="mt-6 space-y-4 rounded-[22px] border border-[#E4DCCD] bg-white p-4 sm:p-5">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                  {t('filterCategory')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={filterHref({ kategori: null })}
                    className={activeCategory ? chipIdle : chipActive}
                    aria-current={activeCategory ? undefined : 'true'}
                  >
                    {t('filterAll')}
                  </Link>
                  {categoryOptions.map((c) => (
                    <Link
                      key={c}
                      href={filterHref({ kategori: c })}
                      className={activeCategory === c ? chipActive : chipIdle}
                      aria-current={activeCategory === c ? 'true' : undefined}
                    >
                      {t(`categories.${c}`)}
                      <span
                        className={
                          activeCategory === c ? 'text-xs text-slate-200' : 'text-xs text-slate-600'
                        }
                      >
                        {categoryCounts.get(c)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              {cityOptions.length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                    {t('filterCity')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={filterHref({ city: null })}
                      className={activeCity ? chipIdle : chipActive}
                      aria-current={activeCity ? undefined : 'true'}
                    >
                      {t('filterAll')}
                    </Link>
                    {cityOptions.map(([key, count]) => (
                      <Link
                        key={key}
                        href={filterHref({ city: key })}
                        className={activeCity === key ? chipActive : chipIdle}
                        aria-current={activeCity === key ? 'true' : undefined}
                      >
                        {cityLabels.get(key)}
                        <span
                          className={
                            activeCity === key ? 'text-xs text-slate-200' : 'text-xs text-slate-600'
                          }
                        >
                          {count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {(activeCategory || activeCity) && (
                <Link
                  href={`${basePath}#${LIST_ANCHOR}`}
                  className="inline-flex text-sm font-bold text-[#334155] underline underline-offset-4 hover:text-[#BE2F47]"
                >
                  {t('filterReset')}
                </Link>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-8 rounded-[22px] border border-dashed border-[#E4DCCD] bg-white px-6 py-14 text-center">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FBF8F3] ring-1 ring-[#E4DCCD]">
                  <SearchX className="h-8 w-8 text-[#BE2F47]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-[22px] font-black tracking-[-0.02em] text-[#0F172A]">
                  {t('emptyFilteredTitle')}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5B6474]">
                  {t('emptyFilteredBody')}
                </p>
                <Link
                  href={`${basePath}#${LIST_ANCHOR}`}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
                >
                  {t('filterReset')}
                </Link>
              </div>
            ) : (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((job) => {
                  const posted = formatPosted(job.postedAt, locale);
                  return (
                    <li
                      key={job.id}
                      className={`flex min-w-0 flex-col rounded-[22px] border bg-white p-5 transition hover:border-[#0F172A] ${
                        job.featured ? 'border-[#F4B8C3]' : 'border-[#E4DCCD]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <CompanyMark job={job} />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-700">
                            <Building2
                              className="h-3.5 w-3.5 shrink-0 text-slate-500"
                              aria-hidden="true"
                            />
                            <span className="truncate">{job.company}</span>
                          </p>
                          <h3 className="mt-1 break-words text-lg font-black leading-snug tracking-[-0.01em] text-[#0F172A]">
                            {job.title}
                          </h3>
                        </div>
                        {job.featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FDECEF] px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-[#BE2F47]">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            {t('featured')}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        {job.city && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF8F3] px-2.5 py-1 text-[#334155] ring-1 ring-[#EFE9DE]">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {job.city}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF8F3] px-2.5 py-1 text-[#334155] ring-1 ring-[#EFE9DE]">
                          <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                          {t(`types.${job.type}`)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF8F3] px-2.5 py-1 text-[#334155] ring-1 ring-[#EFE9DE]">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          {t(`categories.${job.category}`)}
                        </span>
                      </div>

                      {job.salary && (
                        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-800">
                          <Wallet className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                          <span className="font-semibold text-slate-700">{t('salary')}:</span>
                          <span className="font-bold text-slate-900">{job.salary}</span>
                        </p>
                      )}

                      {job.excerpt && (
                        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-slate-700">
                          {job.excerpt}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        {posted ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('posted', { date: posted })}
                          </p>
                        ) : (
                          <span />
                        )}
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener"
                          aria-label={t('applyAria', { title: job.title, company: job.company })}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-dk-red-strong px-4 py-2.5 text-sm font-bold text-white transition hover:bg-dk-red-deep"
                        >
                          {t('apply')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ── Employer CTA (dark surface) ─────────────────────── */}
      <section id="isegoturen" className={`${home.wrap} scroll-mt-24`}>
        <div className="overflow-hidden rounded-[22px] bg-[#0F172A] p-6 sm:p-10 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-10">
          <div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-black leading-tight tracking-[-0.035em] text-white">
              {t('employerTitle')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{t('employerBody')}</p>
            <a
              href={TQTA_EMPLOYER_URL}
              target="_blank"
              rel="noopener"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
            >
              {t('employerCta')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <ul className="mt-8 space-y-3 lg:mt-0">
            {[t('employerPoint1'), t('employerPoint2'), t('employerPoint3')].map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100"
              >
                <BadgeCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#F28A9B]"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
