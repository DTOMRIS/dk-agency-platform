/**
 * @file BlogPicks.tsx
 * @purpose Homepage v2 «Bloq & Analizlər» — three real blog posts with their cover images,
 *          category pill and read time, plus a solid «Hamısını gör» button (the old outlined
 *          button was low-contrast). Replaces the inline serif blog block on `/`.
 * @pattern A (useTranslations) — home.featuredBlogs (post texts) + homeV2.blog; section
 *          title/subtitle/button come from the page copy (blogTitle/blogSubtitle/viewAll).
 * @task TASK-0512 (owner feedback 2026-10-08)
 */

'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal } from './shared';

/**
 * Posts shown on the homepage. `readMin` is the post's `readingTime` as served by
 * GET /api/blog (checked 2026-10-08: 12 min for all three). Texts: home.featuredBlogs.pN.
 */
const POSTS = [
  { key: 'p1', slug: '1-porsiya-food-cost-hesablama', image: '/images/blog-01.png', readMin: 12 },
  { key: 'p2', slug: 'menyu-muhendisliyi-satis', image: '/images/blog-04.png', readMin: 12 },
  { key: 'p3', slug: 'wolt-bolt-komissiyon', image: '/images/blog-06.png', readMin: 12 },
] as const;

export type BlogPicksCopy = { title: string; subtitle: string; viewAll: string };

export default function BlogPicks({ copy }: { copy: BlogPicksCopy }) {
  const tPost = useTranslations('home.featuredBlogs');
  const t = useTranslations('homeV2.blog');
  const locale = normalizeLocale(useLocale());

  return (
    <section
      className={`${styles.v2} ${inter.className} ${styles.bl}`}
      aria-labelledby="blog-picks-title"
    >
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <Reveal className={styles.headRow}>
            <div className={styles.secHead}>
              <span className={styles.eyebrow}>
                <span className={styles.dot} />
                {t('eyebrow')}
              </span>
              <h2 id="blog-picks-title" className={styles.h2}>
                {copy.title}
              </h2>
              <p>{copy.subtitle}</p>
            </div>
            <Link
              href={withLocale(locale, '/blog')}
              className={`${styles.btn} ${styles.btnDark} ${styles.headBtn}`}
            >
              {copy.viewAll}
              <Icon name="arrow" />
            </Link>
          </Reveal>

          <div className={styles.blGrid}>
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={withLocale(locale, `/blog/${post.slug}`)}
                className={styles.blCard}
              >
                <span className={styles.blMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static covers in /public, same as the old block */}
                  <img src={post.image} alt="" loading="lazy" className={styles.blImg} />
                  <span className={styles.nwPill}>{tPost(`${post.key}.category`)}</span>
                </span>
                <span className={styles.blBody}>
                  <span className={styles.blTitle}>{tPost(`${post.key}.title`)}</span>
                  <span className={styles.blExcerpt}>{tPost(`${post.key}.excerpt`)}</span>
                  <span className={styles.blFoot}>
                    <span className={styles.blTime}>
                      <Icon name="clock" />
                      {t('readMin', { n: post.readMin })}
                    </span>
                    <span className={styles.blGo} aria-hidden="true">
                      <Icon name="arrow" />
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
