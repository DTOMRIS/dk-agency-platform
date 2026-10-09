/**
 * @file FactsStrip.tsx
 * @purpose Homepage v2 fact strip — only verified facts (40 il · 35+ alət, 17-si pulsuz · 10+ filial OCAQ · 4 dil).
 * @pattern A (useTranslations) — homeV2.facts
 * @task TASK-0512
 */

'use client';

import { useTranslations } from 'next-intl';
import styles from './homeV2.module.css';
import { inter } from './font';

const FACTS = ['f1', 'f2', 'f3', 'f4'] as const;

export default function FactsStrip() {
  const t = useTranslations('homeV2.facts');
  return (
    <section className={`${styles.v2} ${inter.className} ${styles.facts}`} aria-label={t('label')}>
      <div className={`${styles.wrap} ${styles.factsGrid}`}>
        {FACTS.map((key) => (
          <div key={key} className={styles.fact}>
            <b>{t(`${key}.v`)}</b>
            <span>{t(`${key}.l`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
