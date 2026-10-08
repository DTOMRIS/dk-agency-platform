/**
 * @file B2BMarket.tsx
 * @purpose Homepage v2 «Bazar» block — replaces the old 6 emoji cards «HORECA B2B Elanlar»:
 *          left text + «Bütün elanlar» / «Elan ver», right the six listing categories as compact
 *          icon tiles (3×2). Every tile goes to /ilanlar exactly like the old cards did.
 * @pattern A — existing texts come from the page's locale copy (b2b*), new ones from homeV2.market
 * @task TASK-0512 (owner feedback 2026-10-08)
 */

'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal, type IconName } from './shared';

/** Same order as the page copy `b2bCards`: transfer, franchise, partner, investment, lease, equipment. */
const CARD_ICONS: readonly IconName[] = ['key', 'store', 'team', 'trend', 'building', 'wrench'];

export type B2BMarketCopy = {
  badge: string;
  title: string;
  body: string;
  listingsCta: string;
  cards: ReadonlyArray<{ title: string; desc: string }>;
};

export default function B2BMarket({ copy }: { copy: B2BMarketCopy }) {
  const t = useTranslations('homeV2.market');
  const locale = normalizeLocale(useLocale());
  const listingsHref = withLocale(locale, '/ilanlar');

  return (
    <section
      className={`${styles.v2} ${inter.className} ${styles.mk}`}
      aria-labelledby="b2b-market-title"
    >
      <div className={styles.sec}>
        <div className={`${styles.wrap} ${styles.mkGrid}`}>
          <Reveal className={styles.mkText}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              {copy.badge}
            </span>
            <h2 id="b2b-market-title" className={styles.h2}>
              {copy.title}
            </h2>
            <p className={styles.mkBody}>{copy.body}</p>
            <div className={styles.mkCtas}>
              <Link href={listingsHref} className={`${styles.btn} ${styles.btnDark}`}>
                {copy.listingsCta}
                <Icon name="arrow" />
              </Link>
              <Link
                href={withLocale(locale, '/ilan-ver')}
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                <Icon name="plus" />
                {t('postListing')}
              </Link>
            </div>
          </Reveal>

          <Reveal ariaLabel={t('label')}>
            <ul className={styles.mkTiles}>
              {copy.cards.map((card, i) => (
                <li key={card.title}>
                  <Link href={listingsHref} className={styles.mkTile}>
                    <span className={styles.mkIc}>
                      <Icon name={CARD_ICONS[i] ?? 'grid'} />
                    </span>
                    <span className={styles.mkName}>{card.title}</span>
                    <span className={styles.mkDesc}>{card.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
