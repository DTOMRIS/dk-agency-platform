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
        className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--dk-navy)] text-sm font-black tracking-wide text-[var(--dk-gold)]"
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
  const chipIdle = `${chipBase} border-slate-200 bg-white text-slate-700 hover:border-[var(--dk-gold)] hover:text-slate-900`;
  const chipActive = `${chipBase} border-[var(--dk-navy)] bg-[var(--dk-navy)] text-white`;

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-24">
      {/* ── Hero (dark surface) ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[var(--dk-navy)] to-slate-950 py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[var(--dk-gold)]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-gold)]/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--dk-gold)]">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {t('badge')}
            </span>
            <h1 className="mt-5 font-display text-4xl font-black text-white lg:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`#${LIST_ANCHOR}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:opacity-90"
              >
                {t('ctaBrowse')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#isegoturen"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-gold)]"
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
                  className="flex flex-col-reverse justify-end rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center backdrop-blur-sm"
                >
                  <dt className="mt-1 text-xs font-semibold text-slate-300">{stat.label}</dt>
                  <dd className="font-display text-3xl font-black text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Certified staff strip ───────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-700">
              <strong className="font-bold text-slate-900">{t('certTitle')}.</strong>{' '}
              {t('certBody')}
            </p>
          </div>
          <a
            href={TQTA_HOME_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[var(--dk-navy)] underline-offset-4 hover:underline"
          >
            {t('certCta')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ── Listing ─────────────────────────────────────────── */}
      <section
        id={LIST_ANCHOR}
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8"
      >
        {!ok ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <CircleAlert className="h-8 w-8 text-amber-700" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-black text-[var(--dk-navy)]">
              {t('unavailableTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700">
              {t('unavailableBody')}
            </p>
            <a
              href={TQTA_CAREER_URL}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-navy)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              {t('unavailableCta')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)] sm:text-3xl">
                  {t('listTitle')}
                </h2>
                <p className="mt-1 text-sm text-slate-700">{t('sourceNote')}</p>
              </div>
              <p className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-800">
                {t('resultCount', { count: filtered.length })}
              </p>
            </div>

            {/* Filters — links (server-side, no JS); chips wrap (L-045) */}
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                  className="inline-flex text-sm font-bold text-slate-700 underline underline-offset-4 hover:text-[var(--dk-red)]"
                >
                  {t('filterReset')}
                </Link>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                  <SearchX className="h-8 w-8 text-[var(--dk-gold)]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black text-[var(--dk-navy)]">
                  {t('emptyFilteredTitle')}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700">
                  {t('emptyFilteredBody')}
                </p>
                <Link
                  href={`${basePath}#${LIST_ANCHOR}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)]"
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
                      className={`flex min-w-0 flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        job.featured ? 'border-[var(--dk-gold)]/60' : 'border-slate-200'
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
                          <h3 className="mt-1 break-words font-display text-lg font-black leading-snug text-slate-900">
                            {job.title}
                          </h3>
                        </div>
                        {job.featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-800">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            {t('featured')}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        {job.city && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-800">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {job.city}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-800">
                          <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                          {t(`types.${job.type}`)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-800">
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
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--dk-red)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red-strong)]"
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
      <section id="isegoturen" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--dk-navy)] via-slate-900 to-slate-950 p-6 sm:p-10 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-10">
          <div>
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
              {t('employerTitle')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{t('employerBody')}</p>
            <a
              href={TQTA_EMPLOYER_URL}
              target="_blank"
              rel="noopener"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:opacity-90"
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
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dk-gold)]"
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
