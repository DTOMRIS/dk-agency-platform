/**
 * @file BlogDirectory.tsx
 * @purpose /blog v2 list — hero, featured post, sticky group tabs (Xərc / Gəlir / Açılış / Kadr)
 *          and the card grid with «Daha çox yazı». Data is prepared on the server (app/[locale]/blog).
 * @pattern A (useTranslations) — innerV2.blog / innerV2.common
 * @task TASK-0514
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon, type IconName } from '@/components/home/v2/shared';
import { BackLink, Eyebrow } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import type { BlogCategoryKey, BlogTab } from '@/lib/blog/category-groups';

export interface BlogCardItem {
  slug: string;
  title: string;
  summary: string;
  category: BlogCategoryKey | null;
  categoryLabel: string;
  tab: BlogTab | null;
  minutes: number;
  date: string;
  author: string;
  image: string | null;
  imageAlt: string;
}

const TABS: ReadonlyArray<'all' | BlogTab> = ['all', 'xerc', 'gelir', 'acilis', 'kadr'];
const PAGE = 9;
const CAT_ICON: Record<BlogCategoryKey, IconName> = {
  maliyye: 'pie',
  emeliyyat: 'brief',
  satis: 'trend',
  marketinq: 'chat',
  acilis: 'hat',
  konsept: 'palette',
  huquqi: 'scale',
  kadr: 'team',
};

function Cover({ item }: { item: BlogCardItem }) {
  return (
    <div className={s.ph}>
      {item.image ? (
        // Covers are local /images/* or editor-uploaded URLs on any host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.imageAlt} loading="lazy" />
      ) : (
        <span className={s.phFallback} aria-hidden="true">
          <Icon name={item.category ? CAT_ICON[item.category] : 'book'} />
        </span>
      )}
    </div>
  );
}

export default function BlogDirectory({ items }: { items: BlogCardItem[] }) {
  const t = useTranslations('innerV2.blog');
  const tc = useTranslations('innerV2.common');
  const locale = normalizeLocale(useLocale());
  const [tab, setTab] = useState<'all' | BlogTab>('all');
  const [limit, setLimit] = useState(PAGE);

  const [featured, ...rest] = items;
  const list = rest.filter((item) => tab === 'all' || item.tab === tab);
  const count = (key: 'all' | BlogTab) =>
    key === 'all' ? rest.length : rest.filter((item) => item.tab === key).length;
  const href = (slug: string) => withLocale(locale, `/blog/${slug}`);

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <div className={s.crumbs}>
          <BackLink href={withLocale(locale, '/')} label={tc('home')} />
        </div>
        <div className={s.blHero}>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className={s.hBig}>
            {t('title1')}
            <br />
            {t.rich('title2', { em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className={s.lead}>{t('lead')}</p>

          {featured ? (
            <Link className={s.blFeat} href={href(featured.slug)}>
              <Cover item={featured} />
              <div className={s.bfBody}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={s.ctag}>{featured.categoryLabel}</span>
                  <span className={s.stageT}>{t('featuredTag')}</span>
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <div className={s.bmeta}>
                  <span>
                    <Icon name="clock" />
                    {tc('minRead', { n: featured.minutes })}
                  </span>
                  <span>{featured.date}</span>
                  <span>{featured.author}</span>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>

      <div className={s.tabbar}>
        <div className={home.wrap}>
          <div className={s.tabs} role="tablist" aria-label={t('tabsLabel')}>
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={s.tab}
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setLimit(PAGE);
                }}
              >
                {tc(`groups.${key}`)}
                <span className={s.tabNPlain}>{count(key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={home.wrap} style={{ paddingTop: 26 }}>
        <div className={s.blogGrid}>
          {list.length === 0 ? <div className={s.empty}>{t('empty')}</div> : null}
          {list.slice(0, limit).map((item) => (
            <Link key={item.slug} className={s.bcard} href={href(item.slug)}>
              <Cover item={item} />
              <div className={s.bb}>
                <span className={s.ctag}>{item.categoryLabel}</span>
                <h3>{item.title}</h3>
                <div className={s.bmeta}>
                  <span>
                    <Icon name="clock" />
                    {tc('minRead', { n: item.minutes })}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {list.length > limit ? (
          <div className={s.more}>
            <button
              type="button"
              className={`${home.btn} ${home.btnGhost}`}
              onClick={() => setLimit((n) => n + PAGE)}
            >
              {t('more')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
