/**
 * @file StepsTimeline.tsx
 * @purpose Homepage v2 «Necə işləyir» — Tapırıq · Göstəririk · Qururuq · İzləyirik with a phone
 *          whose step cards light up in sync. Auto-advances every 2.6s; click a step to jump.
 * @pattern A (useTranslations) — homeV2.steps
 * @task TASK-0512 (2026-10-08: optional `image` beside the heading)
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import styles from './homeV2.module.css';
import { inter } from './font';
import { PhoneNav } from './HeroPhone';
import { Reveal, useReducedMotion } from './shared';

const STEPS = ['s1', 's2', 's3', 's4'] as const;
/** Big figure on each phone card — sample values, identical in every locale. */
const CARDS = [
  { key: 'sc1', big: '5', badge: 'ready' },
  { key: 'sc2', big: '4 800 ₼', badge: 'ready' },
  { key: 'sc3', big: 'OCAQ', badge: 'ready' },
  { key: 'sc4', big: '08:00', badge: 'active' },
] as const;
const ADVANCE_MS = 2600;

/** Optional illustration shown beside the heading (the consulting image from the old `/` block). */
type StepsImage = { src: string; alt: string; width: number; height: number };

export default function StepsTimeline({ image }: { image?: StepsImage } = {}) {
  const t = useTranslations('homeV2');
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);
  // Reduced motion: rest on the last step unless the visitor picks one.
  const current = picked ?? (reduce ? STEPS.length - 1 : auto);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setPicked(null);
      setAuto((a) => (a + 1) % STEPS.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reduce, auto]);

  const choose = (i: number) => {
    if (reduce) {
      setPicked(i);
    } else {
      setPicked(null);
      setAuto(i);
    }
  };

  return (
    <section className={`${styles.v2} ${inter.className}`} id="nece">
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.stepsTop}>
            <Reveal className={styles.secHead}>
              <span className={styles.eyebrow}>
                <span className={styles.dot} />
                {t('steps.eyebrow')}
              </span>
              <h2 className={styles.h2}>{t('steps.title')}</h2>
            </Reveal>
            {image ? (
              <Reveal className={styles.stepsFig}>
                <figure className={styles.stepsFrame}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 980px) 460px, 340px"
                  />
                </figure>
              </Reveal>
            ) : null}
          </div>
          <Reveal className={styles.tline}>
            <ol className={styles.tlList}>
              {STEPS.map((key, i) => (
                <li key={key} className={i === current ? styles.tlOn : undefined}>
                  <button
                    type="button"
                    className={styles.tlBtn}
                    aria-current={i === current ? 'step' : undefined}
                    onClick={() => choose(i)}
                  >
                    <span className={styles.tlH}>
                      {t(`steps.${key}.h`)} <em className={styles.tlEm}>{t(`steps.${key}.em`)}</em>
                    </span>
                    <span className={styles.tlP}>{t(`steps.${key}.p`)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className={`${styles.phoneStage} ${styles.stepsPhone}`}>
              <div className={styles.phone}>
                <div className={styles.phoneIn}>
                  <div className={styles.phBar} aria-hidden="true">
                    <span>9:41</span>
                    <span>●●● ▮</span>
                  </div>
                  <div className={styles.phIsland} aria-hidden="true" />
                  <div className={styles.phBody}>
                    <div className={`${styles.phHi} ${styles.phHiCenter}`}>
                      {t('steps.phoneTitle')}
                    </div>
                    {CARDS.map((card, i) => (
                      <div key={card.key} className={`${styles.sc} ${i > current ? styles.scWait : ''}`}>
                        <div className={styles.scTop}>
                          <span className={styles.scStep}>
                            {t('steps.stepLabel', { n: i + 1 })}
                          </span>
                          <span className={styles.scDone}>{t(`steps.${card.badge}`)}</span>
                        </div>
                        <b>{t(`steps.${card.key}.b`)}</b>
                        <div className={styles.big}>
                          <strong>{card.big}</strong>
                          <span>{t(`steps.${card.key}.d`)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <PhoneNav active="cost" />
                </div>
              </div>
            </div>
          </Reveal>
          <div className={styles.sample}>{t('sample')}</div>
        </div>
      </div>
    </section>
  );
}
