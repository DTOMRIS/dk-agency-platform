/**
 * @file QuickAccess.tsx
 * @purpose Homepage v2 quick-access strip — three compact cards: KAZAN AI (beta) → /kazan-ai,
 *          Toolkit (17 pulsuz alət) → /toolkit, OCAQ → WhatsApp lead (OCAQ is sold, not self-served).
 *          Replaces the old 3-card PlatformCards block; reuses its `home.platformCards` texts.
 * @pattern A (useTranslations) — home.platformCards + homeV2.modules.beta
 * @task TASK-0512
 */

'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal, whatsappHref, type IconName } from './shared';

const CARDS: ReadonlyArray<{
  key: 'kazan' | 'toolkit' | 'ocaq';
  icon: IconName;
  href: string | null;
  beta: boolean;
}> = [
  { key: 'kazan', icon: 'spark', href: '/kazan-ai', beta: true },
  { key: 'toolkit', icon: 'calc', href: '/toolkit', beta: false },
  { key: 'ocaq', icon: 'flame', href: null, beta: false },
];

export default function QuickAccess() {
  const t = useTranslations('home.platformCards');
  const tm = useTranslations('homeV2.modules');
  const locale = normalizeLocale(useLocale());
  const ocaqHref = whatsappHref(t('ocaq.whatsappText'));

  return (
    <section
      className={`${styles.v2} ${inter.className} ${styles.qa}`}
      aria-labelledby="quick-access-title"
    >
      <div className={styles.wrap}>
        <Reveal>
          <div className={styles.qaHead}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              {t('eyebrow')}
            </span>
            <h2 id="quick-access-title" className={styles.qaTitle}>
              {t('heading')}
            </h2>
          </div>
          <div className={styles.qaGrid}>
            {CARDS.map((card) => {
              const body = (
                <>
                  <span className={styles.qaIc}>
                    <Icon name={card.icon} />
                  </span>
                  <span className={styles.qaText}>
                    <span className={styles.qaName}>
                      {t(`${card.key}.title`)}
                      {card.beta ? <span className={styles.qaBeta}>{tm('beta')}</span> : null}
                    </span>
                    <span className={styles.qaSub}>{t(`${card.key}.subtitle`)}</span>
                    <span className={styles.qaGo}>{t(`${card.key}.cta`)} →</span>
                  </span>
                </>
              );
              return card.href ? (
                <Link key={card.key} href={withLocale(locale, card.href)} className={styles.qaCard}>
                  {body}
                </Link>
              ) : (
                <a
                  key={card.key}
                  href={ocaqHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.qaCard}
                >
                  {body}
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
