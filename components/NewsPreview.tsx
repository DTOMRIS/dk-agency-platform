/**
 * @file NewsPreview.tsx
 * @purpose Homepage «Sektor Nəbzi» — the 4 latest news from GET /api/news: one lead story and
 *          three side items, plus the weekly newsletter form (POST /api/newsletter/subscribe).
 *          A story without a usable image gets a branded generated cover (category gradient +
 *          category icon + source name) instead of an empty dark box.
 * @pattern A (useTranslations) — homeV2.news
 * @task TASK-0501 · TASK-0512 (2026-10-08: restyled in place to the v2 cream/ink design)
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';
import styles from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon, Reveal, type IconName } from '@/components/home/v2/shared';

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  publishedAt: string;
  sourceName?: string | null;
  author?: string | null;
  externalUrl?: string | null;
}

const dateLocaleMap: Record<Locale, string> = {
  az: 'az-AZ',
  ru: 'ru-RU',
  en: 'en-US',
  tr: 'tr-TR',
};

type CatKey = 'market' | 'technology' | 'finance' | 'other';

/** Category → icon + cover tone. Categories come from the news pipeline (market/technology/finance). */
const CATEGORY_STYLE: Record<CatKey, { icon: IconName; tone: string }> = {
  market: { icon: 'trend', tone: styles.nwToneMarket },
  technology: { icon: 'spark', tone: styles.nwToneTech },
  finance: { icon: 'coin', tone: styles.nwToneFinance },
  other: { icon: 'globe', tone: styles.nwToneOther },
};

function catKey(category: string): CatKey {
  const c = category.toLowerCase();
  return c === 'market' || c === 'technology' || c === 'finance' ? c : 'other';
}

/** Source shown on the card: explicit source name, else the feed author, else the link's host. */
function sourceOf(item: NewsItem): string {
  if (item.sourceName) return item.sourceName;
  if (item.author) return item.author;
  if (item.externalUrl) {
    try {
      return new URL(item.externalUrl).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
  return '';
}

function NewsCover({ item, label, big }: { item: NewsItem; label: string; big?: boolean }) {
  const [failed, setFailed] = useState(false);
  const cat = CATEGORY_STYLE[catKey(item.category)];

  if (item.imageUrl && !failed) {
    // TASK-0516: feed images go through next/image (resized; next.config allows any https host).
    // Plain http URLs are not in remotePatterns, so they are passed through unoptimized.
    return (
      <Image
        src={item.imageUrl}
        alt=""
        fill
        sizes={big ? '(max-width: 980px) 100vw, 700px' : '104px'}
        unoptimized={!item.imageUrl.startsWith('https://')}
        className={styles.nwImg}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  const source = sourceOf(item);
  return (
    <div
      className={`${styles.nwCover} ${cat.tone} ${big ? styles.nwCoverBig : ''}`}
      aria-hidden="true"
    >
      <span className={styles.nwCoverIc}>
        <Icon name={cat.icon} />
      </span>
      {/* The category already sits on the pill above the cover — the cover names the source. */}
      {big ? <span className={styles.nwCoverCat}>{source || label}</span> : null}
    </div>
  );
}

export default function NewsPreview() {
  const t = useTranslations('homeV2.news');
  const locale = normalizeLocale(useLocale());
  const [items, setItems] = useState<NewsItem[]>([]);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/news?limit=4&locale=${locale}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data)) {
          setItems(json.data.filter((n: NewsItem) => n.slug));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const formatDate = (iso: string) => {
    try {
      const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
      // TASK-0462: Chrome ICU-da `az` yoxdur — az üçün ICU-suz formatlayıcı
      return locale === 'az'
        ? formatAzDate(iso, options)
        : new Date(iso).toLocaleDateString(dateLocaleMap[locale], options);
    } catch {
      return '';
    }
  };

  const featuredNews = items[0];
  const sideNews = items.slice(1, 4);
  const catLabel = (item: NewsItem) => t(`cats.${catKey(item.category)}`);

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage_newsletter' }),
      });
      if (!response.ok) throw new Error('Subscription failed');
      setEmail('');
      setNewsletterStatus('success');
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <section
      id="news"
      className={`${styles.v2} ${inter.className} ${styles.nw}`}
      aria-labelledby="news-title"
    >
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <Reveal className={styles.headRow}>
            <div className={styles.secHead}>
              <span className={styles.eyebrow}>
                <span className={styles.dot} />
                {t('eyebrow')}
              </span>
              <h2 id="news-title" className={styles.h2}>
                {t('title')}
              </h2>
              <p>{t('sub')}</p>
            </div>
            <Link
              href={withLocale(locale, '/haberler')}
              className={`${styles.btn} ${styles.btnDark} ${styles.headBtn}`}
            >
              {t('cta')}
              <Icon name="arrow" />
            </Link>
          </Reveal>

          {featuredNews ? (
            <div className={styles.nwGrid}>
              <Link
                href={withLocale(locale, `/haberler/${featuredNews.slug}`)}
                className={styles.nwLead}
              >
                <div className={styles.nwLeadMedia}>
                  <NewsCover item={featuredNews} label={catLabel(featuredNews)} big />
                  <span className={styles.nwPill}>{catLabel(featuredNews)}</span>
                </div>
                <div className={styles.nwLeadBody}>
                  <div className={styles.nwMeta}>
                    <span>{formatDate(featuredNews.publishedAt)}</span>
                    {sourceOf(featuredNews) ? <span>{sourceOf(featuredNews)}</span> : null}
                  </div>
                  <h3 className={styles.nwLeadTitle}>{featuredNews.title}</h3>
                  <p className={styles.nwLeadSum}>{featuredNews.summary}</p>
                  <span className={styles.nwMore}>
                    {t('readMore')}
                    <Icon name="arrow" />
                  </span>
                </div>
              </Link>

              <ul className={styles.nwSide}>
                {sideNews.map((news) => (
                  <li key={news.id}>
                    <Link
                      href={withLocale(locale, `/haberler/${news.slug}`)}
                      className={styles.nwItem}
                    >
                      <span className={styles.nwThumb}>
                        <NewsCover item={news} label={catLabel(news)} />
                      </span>
                      <span className={styles.nwItemText}>
                        <span className={styles.nwCat}>{catLabel(news)}</span>
                        <span className={styles.nwItemTitle}>{news.title}</span>
                        <span className={styles.nwItemMeta}>
                          {formatDate(news.publishedAt)}
                          {sourceOf(news) ? ` · ${sourceOf(news)}` : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.nwLetter}>
            <span className={styles.nwLetterIc}>
              <Icon name="mail" />
            </span>
            <div className={styles.nwLetterText}>
              <b>{t('newsletterTitle')}</b>
              <span>{t('newsletterBody')}</span>
            </div>
            <form className={styles.nwForm} onSubmit={subscribe}>
              <label htmlFor="news-letter-email" className={styles.srOnly}>
                {t('emailPlaceholder')}
              </label>
              <input
                id="news-letter-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={styles.nwInput}
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className={`${styles.btn} ${styles.btnRed} ${styles.nwSubmit}`}
              >
                {newsletterStatus === 'loading' ? t('loading') : t('subscribe')}
              </button>
              {newsletterStatus === 'success' && (
                <p className={styles.nwOk} role="status">
                  {t('success')}
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className={styles.nwErr} role="alert">
                  {t('error')}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
