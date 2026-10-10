/**
 * /haberler — Sektor Nəbzi list, v2 inner design (TASK-0514, owner-approved mockup 09.10.2026).
 * Lead story (manşet/top order from getVitrinNewsArticles), category pills, card grid with the
 * article image or a generated category cover, Telegram band (t.me/dkagenc), pagination.
 * Hero counters are real DB counts (getPublicNewsStats) and hidden when the DB is unavailable.
 *
 * TASK-0515 — admin controls that feed this page (dashboard/xeberler → NewsEditorForm):
 * - «Xəbər manşet olsun?» (isManset, fresh ≤ 7 days) → MansetVitrin slider in the lead area;
 *   no manşet → single lead story (getVitrinNewsArticles: manşet/top first, then newest).
 * - «Xəbər top olsun?» (isTop) → those cards come first in the grid.
 * - dashboard/reklamlar placement «news-inline» → AdSlot between the lead and the grid
 *   (renders nothing when no active ad).
 *
 * TASK-0529 (owner 10.10, «xəbərlər axmalı, sağda trend — biznesmerkezi kimi»): the first «all» page is a
 * newsroom front — lead/manşet on the left, «Xəbər axını» rail (newest stories, scrolls inside) on the
 * right, then a «Trend xəbərlər» strip (top / gündəm / editor pick, getTrendNewsArticles). Category and
 * later pages keep the card grid; page 2 continues right after the stories the rail showed.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import AdSlot from '@/components/ads/AdSlot';
import MansetVitrin from '@/components/news/MansetVitrin';
import NewsFeedRail from '@/components/news/NewsFeedRail';
import {
  getApprovedNewsArticles,
  getMansetNewsArticles,
  getPublicNewsStats,
  getTrendNewsArticles,
  getVitrinNewsArticles,
  type NewsCategoryKey,
  type PublicNewsArticle,
} from '@/lib/repositories/newsRepository';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import {
  BackLink,
  Eyebrow,
  NewsCover,
  TelegramBand,
  formatInnerDate,
  stripMarkdown,
} from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';

const PAGE_SIZE = 12;
const CATEGORIES: Array<Exclude<NewsCategoryKey, 'all'>> = [
  'finance',
  'operations',
  'growth',
  'market',
  'technology',
];
const SWATCH: Record<Exclude<NewsCategoryKey, 'all'>, string> = {
  finance: '#3B5BDB',
  operations: '#64748B',
  growth: '#16A34A',
  market: '#D4A017',
  technology: '#3B82F6',
};

export const metadata: Metadata = {
  title: 'Sektor Nəbzi — HoReCa xəbərləri | DK Agency',
  description: 'HoReCa sektorundan seçilmiş xəbərlər — restoran, kafe və otel sahibi üçün qısa izah.',
};

export default async function HaberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations({ locale, namespace: 'innerV2.news' });
  const tc = await getTranslations({ locale, namespace: 'innerV2.common' });

  const category: NewsCategoryKey = (CATEGORIES as string[]).includes(params.category ?? '')
    ? (params.category as NewsCategoryKey)
    : 'all';
  const page = Math.max(1, Number(params.page || '1') || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const firstAllPage = category === 'all' && page === 1;

  const [result, vitrin, manset, stats, trendPool] = await Promise.all([
    getApprovedNewsArticles({ category, limit: PAGE_SIZE, offset }, locale),
    firstAllPage ? getVitrinNewsArticles(1, locale) : Promise.resolve([] as PublicNewsArticle[]),
    firstAllPage ? getMansetNewsArticles(6, locale).catch(() => [] as PublicNewsArticle[]) : Promise.resolve([] as PublicNewsArticle[]),
    getPublicNewsStats().catch(() => null),
    firstAllPage ? getTrendNewsArticles(10, locale).catch(() => [] as PublicNewsArticle[]) : Promise.resolve([] as PublicNewsArticle[]),
  ]);

  const lead: PublicNewsArticle | undefined = manset.length > 0 ? undefined : (vitrin[0] ?? result.items[0]);
  const shownInLead = new Set<number>([...manset.map((m) => m.id), ...(lead ? [lead.id] : [])]);
  // «Xəbər top olsun?» cards first; stable otherwise (Array.prototype.sort is stable).
  const grid = result.items
    .filter((item) => !shownInLead.has(item.id))
    .sort((a, b) => Number('isTop' in b && b.isTop) - Number('isTop' in a && a.isTop));
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  // TASK-0529: front page = lead + feed rail + trend strip (no grid, so nothing shows twice side by side).
  const rail = firstAllPage ? result.items.filter((item) => !shownInLead.has(item.id)) : [];
  const trend = (() => {
    type Story = (typeof result.items)[number];
    if (!firstAllPage) return [] as Story[];
    const picked: Story[] = trendPool.filter((item) => !shownInLead.has(item.id));
    const seen = new Set(picked.map((item) => item.id));
    for (const item of result.items) {
      if (picked.length >= 4) break;
      if (!shownInLead.has(item.id) && !seen.has(item.id)) picked.push(item);
    }
    return picked.slice(0, 10);
  })();

  const listHref = (cat: NewsCategoryKey, p = 1) => {
    const qs = new URLSearchParams();
    if (cat !== 'all') qs.set('category', cat);
    if (p > 1) qs.set('page', String(p));
    const q = qs.toString();
    return withLocale(locale, `/haberler${q ? `?${q}` : ''}`);
  };
  const articleHref = (slug: string) => withLocale(locale, `/haberler/${slug}`);
  const catLabel = (cat: string) =>
    (CATEGORIES as string[]).includes(cat) ? t(`cats.${cat}`) : cat;
  const source = (item: Pick<PublicNewsArticle, 'sourceName'>) => item.sourceName || t('noSource');
  const date = (iso: string) => formatInnerDate(iso, locale, false);

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <div className={s.crumbs}>
          <BackLink href={withLocale(locale, '/')} label={tc('home')} />
        </div>
        <div className={s.nwHero}>
          <div>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h1 className={s.hBig}>
              {t('title1')}
              <br />
              {t.rich('title2', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className={s.lead}>{t('lead')}</p>
          </div>
          {stats ? (
            <div className={s.counters} role="group" aria-label={t('countersLabel')}>
              <div className={s.ctr}>
                <b>{stats.last7Days}</b>
                <span>{t('last7')}</span>
              </div>
              <div className={s.ctr}>
                <b>{stats.total}</b>
                <span>{t('total')}</span>
              </div>
              <div className={s.ctr}>
                <b>{stats.activeSources}</b>
                <span>{t('sources')}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={s.tabbar}>
        <div className={home.wrap}>
          <nav className={s.tabs} aria-label={t('catsLabel')}>
            {(['all', ...CATEGORIES] as NewsCategoryKey[]).map((cat) => (
              <Link
                key={cat}
                href={listHref(cat)}
                className={s.pillB}
                aria-current={category === cat ? 'page' : undefined}
              >
                {cat !== 'all' ? (
                  <span className={s.sw} style={{ background: SWATCH[cat] }} aria-hidden="true" />
                ) : null}
                {t(`cats.${cat}`)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className={home.wrap}>
        <div className={firstAllPage && rail.length > 0 ? s.nwTop : undefined}>
          <div className="min-w-0">
            {manset.length > 0 ? (
              <MansetVitrin
                label={t('mansetLabel')}
                featuredLabel={t('featured')}
                prevLabel={t('mansetPrev')}
                nextLabel={t('mansetNext')}
                slideLabels={manset.map((_, i) => t('mansetSlide', { n: i + 1, total: manset.length }))}
                slides={manset.map((item, i) => ({
                  id: item.id,
                  href: articleHref(item.slug),
                  title: item.title,
                  summary: stripMarkdown(item.summary),
                  meta: `${source(item)} · ${date(item.publishedAt)}`,
                  cover: (
                    <NewsCover
                      category={item.category}
                      categoryLabel={catLabel(item.category)}
                      source={source(item)}
                      brand={t('brand')}
                      imageUrl={item.imageUrl}
                      alt={item.title}
                      priority={i === 0}
                      sizes="(max-width: 980px) 100vw, 640px"
                    />
                  ),
                }))}
              />
            ) : !lead ? (
              <div className={s.empty} style={{ marginTop: 26 }}>
                {category === 'all' ? t('empty') : t('emptyCat')}
              </div>
            ) : (
              <Link href={articleHref(lead.slug)} className={s.leadStory}>
                <NewsCover
                  category={lead.category}
                  categoryLabel={catLabel(lead.category)}
                  source={source(lead)}
                  brand={t('brand')}
                  imageUrl={lead.imageUrl}
                  alt={lead.title}
                  priority
                  sizes="(max-width: 980px) 100vw, 640px"
                />
                <div className={s.lsBody}>
                  <div className={s.metaRow}>
                    <span className={s.cat}>{t('featured')}</span>
                    <span>
                      {source(lead)} · {date(lead.publishedAt)}
                    </span>
                  </div>
                  <h2>{lead.title}</h2>
                  <p>{stripMarkdown(lead.summary)}</p>
                </div>
              </Link>
            )}
          </div>
          {firstAllPage ? (
            <NewsFeedRail
              eyebrow={t('feedEyebrow')}
              title={t('feedTitle')}
              upLabel={t('feedUp')}
              downLabel={t('feedDown')}
              items={rail.map((item) => ({
                id: item.id,
                href: articleHref(item.slug),
                title: item.title,
                category: catLabel(item.category),
                date: date(item.publishedAt),
                thumb: (
                  <NewsCover
                    category={item.category}
                    categoryLabel={catLabel(item.category)}
                    source={source(item)}
                    brand={t('brand')}
                    imageUrl={item.imageUrl}
                    alt=""
                    compact
                    sizes="96px"
                  />
                ),
              }))}
            />
          ) : null}
        </div>

        <AdSlot placement="news-inline" className={s.adInline} />

        {trend.length > 0 ? (
          <section className={s.trendSec} aria-labelledby="news-trend-title" data-testid="news-trend">
            <div className={s.trendHead}>
              <div>
                <p className={s.trendEyebrow}>{t('trendEyebrow')}</p>
                <h2 id="news-trend-title">{t('trendTitle')}</h2>
              </div>
              {totalPages > 1 ? (
                <Link href={listHref('all', 2)} className={s.trendMore}>
                  {t('moreNews')} →
                </Link>
              ) : null}
            </div>
            <div className={s.trendRow}>
              {trend.map((item) => (
                <Link key={item.id} href={articleHref(item.slug)} className={s.trendCard}>
                  <NewsCover
                    category={item.category}
                    categoryLabel={catLabel(item.category)}
                    source={source(item)}
                    brand={t('brand')}
                    imageUrl={item.imageUrl}
                    alt={item.title}
                    sizes="260px"
                  />
                  <div className={s.nb}>
                    <div className={s.metaRow}>
                      <span>{catLabel(item.category)}</span>
                      <span>·</span>
                      <span>{date(item.publishedAt)}</span>
                    </div>
                    <h3>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!firstAllPage && grid.length > 0 ? (
          <div className={s.newsGrid}>
            {grid.map((item) => (
              <Link key={item.id} href={articleHref(item.slug)} className={s.ncard}>
                <NewsCover
                  category={item.category}
                  categoryLabel={catLabel(item.category)}
                  source={source(item)}
                  brand={t('brand')}
                  imageUrl={item.imageUrl}
                  alt={item.title}
                />
                <div className={s.nb}>
                  <div className={s.metaRow}>
                    <span>{catLabel(item.category)}</span>
                    <span>·</span>
                    <span>{source(item)}</span>
                    <span>·</span>
                    <span>{date(item.publishedAt)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{stripMarkdown(item.summary)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {totalPages > 1 ? (
          <nav className={s.pager} aria-label={t('pagerLabel')}>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={listHref(category, p)}
                  className={s.pillB}
                  aria-current={page === p ? 'page' : undefined}
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <TelegramBand title={t('tgTitle')} body={t('tgBody')} cta={t('tgCta')} />
      </div>
    </div>
  );
}
