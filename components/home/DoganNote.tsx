/**
 * @file DoganNote.tsx
 * @purpose Founder proof block — real photo, «Doğan Tomris · Qurucu», in the field since 1986
 *          (40 il HoReCa), the founder's note and two CTAs. Homepage v2 style.
 *          Owner decision 2026-10-04: customer numbers are not published; proof = the founder's
 *          photo + field since 1986 + «necə işləyir» (StepsTimeline, rendered right before this on `/`).
 * @pattern A (useTranslations) — home.doganNote
 * @task TASK-0106 · TASK-0516 (v2 restyle, homepage)
 * @usage `/` (after StepsTimeline) and `/haqqimizda` (`embedded`: no own section padding/background,
 *        it sits between the about text and AhilikValues). The card collapses to one column by a
 *        container query, so it also fits narrow parents.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { FOUNDER_NAME, FOUNDER_PORTRAIT_SRC } from '@/components/ui/FounderAvatar';
import styles from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon, Reveal } from '@/components/home/v2/shared';

export function DoganNote({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('home.doganNote');
  const locale = normalizeLocale(useLocale());

  return (
    <section
      className={`${styles.v2} ${inter.className} ${styles.dn} ${embedded ? styles.dnEmbedded : ''}`}
      aria-labelledby="dogan-note-title"
      id="qurucu"
    >
      <div className={embedded ? undefined : styles.sec}>
        <div className={styles.wrap}>
          <Reveal className={styles.dnCard}>
            <figure className={styles.dnPhoto}>
              <Image src={FOUNDER_PORTRAIT_SRC} alt={FOUNDER_NAME} fill sizes="(max-width: 980px) 320px, 360px" />
              <figcaption className={styles.dnCaption}>
                <b>{FOUNDER_NAME}</b>
                <span>{t('founderRole')}</span>
              </figcaption>
            </figure>

            <div className={styles.dnBody}>
              <span className={styles.eyebrow}>
                <span className={styles.dot} />
                {t('eyebrow')}
              </span>
              <h2 id="dogan-note-title" className={styles.h2}>
                {t('title')}
              </h2>

              <ul className={styles.dnFacts} aria-label={t('factsLabel')}>
                <li>
                  <b>1986</b>
                  <span>{t('sinceLabel')}</span>
                </li>
                <li>
                  <b>{t('yearsValue')}</b>
                  <span>{t('yearsLabel')}</span>
                </li>
              </ul>

              <div className={styles.dnText}>
                <p>{t('body1')}</p>
                <p>{t('body2')}</p>
                <blockquote className={styles.dnQuote}>{t('body3')}</blockquote>
              </div>

              <div className={styles.dnCta}>
                <Link href={withLocale(locale, '/kazan-ai')} className={`${styles.btn} ${styles.btnRed}`}>
                  {t('ctaPrimary')}
                  <Icon name="arrow" />
                </Link>
                <Link href={withLocale(locale, '/toolkit')} className={`${styles.btn} ${styles.btnGhost}`}>
                  {t('ctaSecondary')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
