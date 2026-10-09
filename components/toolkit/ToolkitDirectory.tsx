/**
 * @file ToolkitDirectory.tsx
 * @purpose /toolkit v2 — hero with search, group tabs (Xərc / Gəlir / Açılış / Kadr), the editorial
 *          «Ən çox lazım olan 3 alət» row and all 17 unique tools (owner-approved mockup, 09.10.2026).
 * @pattern A (useTranslations) — innerV2.common / innerV2.toolkit
 * @task TASK-0514
 */

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon, whatsappHref } from '@/components/home/v2/shared';
import { BackLink, Eyebrow, LiveStatus, TOOL_GROUP_CLASS } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import {
  FEATURED_TOOL_SLUGS,
  TOOL_DIRECTORY,
  TOOL_GROUPS,
  type ToolGroup,
} from '@/lib/toolkit/tool-directory';

type GroupKey = 'all' | ToolGroup;
const CHIPS = ['food', 'wolt', 'aqta', 'shift'] as const;

export default function ToolkitDirectory() {
  const t = useTranslations('innerV2.toolkit');
  const tc = useTranslations('innerV2.common');
  const locale = normalizeLocale(useLocale());
  const [group, setGroup] = useState<GroupKey>('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // «/» focuses the search box (not while typing in another field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const tools = useMemo(
    () =>
      TOOL_DIRECTORY.map((tool) => ({
        ...tool,
        title: t(`tools.${tool.slug}.t`),
        desc: t(`tools.${tool.slug}.d`),
        result: t(`tools.${tool.slug}.r`),
        keywords: t(`tools.${tool.slug}.kw`),
      })),
    [t]
  );

  const q = query.trim().toLocaleLowerCase(locale);
  const list = tools.filter((tool) => {
    if (group !== 'all' && tool.group !== group) return false;
    if (!q) return true;
    return `${tool.title} ${tool.desc} ${tool.result} ${tool.keywords} ${tool.slug}`
      .toLocaleLowerCase(locale)
      .includes(q);
  });
  const showFeatured = !q && group === 'all';
  const groupCount = (key: GroupKey) =>
    key === 'all' ? tools.length : tools.filter((tool) => tool.group === key).length;

  const href = (slug: string) => withLocale(locale, `/toolkit/${slug}`);

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <div className={s.crumbs}>
          <BackLink href={withLocale(locale, '/')} label={tc('home')} />
        </div>
      </div>

      <div className={`${home.wrap} ${s.tkHero}`}>
        <div className={s.tkGrid}>
          <div>
            <Eyebrow>{t('eyebrow', { count: tools.length })}</Eyebrow>
            <h1 className={s.hBig}>
              {t('title1')}
              <br />
              {t.rich('title2', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className={s.lead}>{t('lead')}</p>
            <label className={s.search}>
              <Icon name="search" />
              <span className="sr-only">{t('searchLabel')}</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                autoComplete="off"
              />
              <kbd>/</kbd>
            </label>
            <div className={s.chips} role="group" aria-label={t('chipsLabel')}>
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={s.chip}
                  onClick={() => {
                    setQuery(t(`chips.${chip}.q`));
                    setGroup('all');
                  }}
                >
                  {t(`chips.${chip}.l`)}
                </button>
              ))}
            </div>
          </div>

          <div aria-label={t('preview.label')} role="group">
            <div className={s.pvCard}>
              <div className={s.pvHead}>
                <div>
                  <b>{t('preview.dish')}</b>
                  <small>{t('preview.sub')}</small>
                </div>
                <span className={s.pvKpi}>45%</span>
              </div>
              <div className={s.band} aria-hidden="true">
                <span className={s.bandZone} style={{ left: '46.6%', width: '6.7%' }} />
                <span className={s.bandMk} style={{ left: '75%' }} />
              </div>
              <div className={s.bandL}>
                <span>0%</span>
                <span>{t('preview.target')}</span>
                <span>60%</span>
              </div>
              <div className={s.agent}>
                <div className={s.agentTag}>
                  <span className={s.agentSq}>
                    <Icon name="check" />
                  </span>
                  {t('preview.tag')}
                </div>
                <p className={s.agentMsg}>{t('preview.msg')}</p>
              </div>
            </div>
            <div className={s.sample} style={{ textAlign: 'right' }}>
              {tc('sample')}
            </div>
          </div>
        </div>
      </div>

      <div className={s.tabbar}>
        <div className={home.wrap}>
          <div className={s.tabs} role="tablist" aria-label={t('tabsLabel')}>
            {(['all', ...TOOL_GROUPS] as GroupKey[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={s.tab}
                aria-selected={group === key}
                onClick={() => setGroup(key)}
              >
                {tc(`groups.${key}`)}
                <span className={s.tabN}>{t('tabCount', { count: groupCount(key) })}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={home.wrap}>
        {showFeatured ? (
          <section className={s.sec} style={{ paddingTop: 36, paddingBottom: 28 }}>
            <div className={s.secHead}>
              <div>
                <Eyebrow>{t('featured.eyebrow')}</Eyebrow>
                <h2 className={s.h2}>{t('featured.title')}</h2>
              </div>
              <p>{t('featured.desc')}</p>
            </div>
            <div className={s.feat}>
              {FEATURED_TOOL_SLUGS.map((slug, i) => (
                <Link key={slug} href={href(slug)} className={s.fcard}>
                  <span className={s.fRank}>
                    {`0${i + 1}`} · {tc('groups.xerc').toLocaleUpperCase(locale)}
                  </span>
                  <span className={s.fGo} aria-hidden="true">
                    <Icon name="up" />
                  </span>
                  <h3>{t(`featured.${slug}.t`)}</h3>
                  <p>{t(`featured.${slug}.d`)}</p>
                  <FeaturedViz slug={slug} />
                </Link>
              ))}
            </div>
            <div className={s.sample}>{t('featured.sample')}</div>
          </section>
        ) : null}

        <section aria-labelledby="tk-all-title" style={showFeatured ? undefined : { paddingTop: 36 }}>
          <div className={s.secHead} style={{ marginBottom: 18 }}>
            <div>
              <Eyebrow>{t('all.eyebrow')}</Eyebrow>
              <h2 id="tk-all-title" className={s.h2}>
                {q ? t('all.searchResults', { count: list.length }) : tc(`groups.${group}`)}
              </h2>
            </div>
            <p>
              {t(`groupDesc.${group}`)}{' '}
              {t.rich('all.statusNote', { b: (chunks) => <b>{chunks}</b> })}
            </p>
          </div>
          <div className={s.tools}>
            {list.length === 0 ? (
              <div className={s.empty}>
                {t.rich('all.empty', {
                  q: query.trim(),
                  link: (chunks) => (
                    <a
                      href={whatsappHref(t('all.emptyWa', { q: query.trim() }))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </div>
            ) : (
              list.map((tool) => (
                <Link key={tool.slug} href={href(tool.slug)} className={s.tool}>
                  <div className={s.toolTop}>
                    <span className={`${s.toolIc} ${TOOL_GROUP_CLASS[tool.group]}`}>
                      <Icon name={tool.icon} />
                    </span>
                    {tool.hospitality ? <span className={s.tagMini}>{t('tagHospitality')}</span> : null}
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  <div className={s.res}>
                    <Icon name="arrow" />
                    <span>{tool.result}</span>
                  </div>
                  <div className={s.toolFoot}>
                    <LiveStatus label={tc('live')} />
                    <span className={s.toolGo}>
                      {t('open')}
                      <Icon name="arrow" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className={s.sec}>
          <div className={s.cta}>
            <div>
              <span className={`${home.eyebrow} ${s.ctaEyebrow}`}>{t('cta.eyebrow')}</span>
              <h2 className={s.h2}>{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
            <div className={s.ctaBtns}>
              <a
                className={`${home.btn} ${home.btnRed} ${s.btnBlock}`}
                href={whatsappHref(t('cta.waText'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                {t('cta.wa')}
              </a>
              <Link
                className={`${home.btn} ${home.btnGhost} ${s.btnBlock} ${s.ctaGhost}`}
                href={withLocale(locale, '/tanitim')}
              >
                {t('cta.diag')}
              </Link>
              <span className={s.ctaNote}>+994 50 256 62 79</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeaturedViz({ slug }: { slug: (typeof FEATURED_TOOL_SLUGS)[number] }) {
  const t = useTranslations('innerV2.toolkit.featured');
  if (slug === 'food-cost') {
    return (
      <div className={s.fViz}>
        <b>45% → 38%</b>
        <br />
        {t('food-cost.viz')}
      </div>
    );
  }
  if (slug === 'delivery-calc') {
    return (
      <div className={s.fViz}>
        {t('delivery-calc.viz')}
        <div className={s.split} aria-hidden="true">
          <span style={{ width: '30%', background: '#94A3B8' }} />
          <span style={{ width: '22%', background: 'var(--red)' }} />
          <span style={{ width: '48%', background: '#6EE7B7' }} />
        </div>
        <div className={s.splitL}>
          <span>{t('delivery-calc.food')}</span>
          <span>{t('delivery-calc.commission')}</span>
          <span>{t('delivery-calc.left')}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={s.fViz}>
      {t('pnl.viz')}
      <div className={s.miniBars} aria-hidden="true">
        {[55, 70, 48, 80, 35, 66].map((h, i) => (
          <span key={i} className={i === 4 ? s.miniBarRed : undefined} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
