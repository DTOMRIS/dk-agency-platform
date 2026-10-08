/**
 * @file HeroPhone.tsx
 * @purpose Homepage v2 hero — «Biz itkini tapırıq» headline, diagnostic CTA and the phone mockup
 *          whose approve-cards swipe away one by one (sample data, labelled as such).
 * @pattern A (useTranslations) — homeV2.hero
 * @task TASK-0512 (design: public/tanitim/index.html, owner-approved 2026-10-08)
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal, useReducedMotion, whatsappHref, type IconName } from './shared';

/** Sample KPIs on the phone: steps already taken before the two pending cards. */
const DONE_BASE = 12;
const CARD_KEYS = ['c1', 'c2'] as const;
/** Price delta on the first sample card (7,50 ₼ → 8,90 ₼). Identical in every locale. */
const CARD_AMOUNT_C1 = '+1,40 ₼';

const CHIPS: ReadonlyArray<{
  key: 'foodcost' | 'delivery' | 'ocaq' | 'kazan';
  icon: IconName;
  pos: string;
  live: boolean;
}> = [
  { key: 'foodcost', icon: 'pie', pos: styles.c1, live: true },
  { key: 'delivery', icon: 'scooter', pos: styles.c2, live: false },
  { key: 'ocaq', icon: 'flame', pos: styles.c3, live: true },
  { key: 'kazan', icon: 'spark', pos: styles.c4, live: false },
];

type CardState = { approved: boolean; gone: boolean };
const FRESH: CardState[] = CARD_KEYS.map(() => ({ approved: false, gone: false }));

export default function HeroPhone() {
  const t = useTranslations('homeV2');
  const reduce = useReducedMotion();
  const [cards, setCards] = useState<CardState[]>(FRESH);

  // approve → swipe away → next card; when both are gone, reset and loop.
  useEffect(() => {
    if (reduce) return;
    const timers: number[] = [];
    let cancelled = false;
    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };
    const run = (k: number) => {
      if (k < CARD_KEYS.length) {
        setCards((prev) => prev.map((c, i) => (i === k ? { ...c, approved: true } : c)));
        later(() => {
          setCards((prev) => prev.map((c, i) => (i === k ? { ...c, gone: true } : c)));
          later(() => run(k + 1), 1400);
        }, 900);
      } else {
        later(() => {
          setCards(FRESH);
          later(() => run(0), 2600);
        }, 1600);
      }
    };
    later(() => run(0), 2600);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduce]);

  const goneCount = cards.filter((c) => c.gone).length;
  const diagHref = whatsappHref(t('waDiag'));

  return (
    <section className={`${styles.v2} ${inter.className}`}>
      <div className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <Reveal>
            <h1 className={styles.hBig}>
              {t('hero.l1')}
              <br />
              <span className={styles.ac}>{t('hero.l2')}</span>
              <br />
              {t('hero.l3')}
              <br />
              {t('hero.l4')}
            </h1>
            <p className={styles.lead}>{t('hero.lead')}</p>
            <div className={styles.heroCta}>
              <a
                className={`${styles.btn} ${styles.btnRed}`}
                href={diagHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('ctaDiag')}
              </a>
              <a className={`${styles.btn} ${styles.btnGhost}`} href="#nece">
                {t('ctaHow')}
                <span className={styles.play}>
                  <Icon name="playSolid" />
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal className={styles.phoneStage} ariaLabel={t('hero.phoneLabel')}>
            {CHIPS.map((chip) => (
              <div
                key={chip.key}
                className={`${styles.chipf} ${chip.pos} ${chip.live ? styles.chipLive : ''}`}
                aria-hidden="true"
              >
                <span className={styles.chipIc}>
                  <Icon name={chip.icon} />
                </span>
                <div>
                  <b>{t(`hero.chips.${chip.key}.t`)}</b>
                  <span>{t(`hero.chips.${chip.key}.s`)}</span>
                </div>
              </div>
            ))}
            <div className={styles.phone}>
              <div className={styles.phoneIn}>
                <div className={styles.phBar} aria-hidden="true">
                  <span>9:41</span>
                  <span>●●● ▮</span>
                </div>
                <div className={styles.phIsland} aria-hidden="true" />
                <div className={styles.phBody}>
                  <div className={styles.phHi}>{t('hero.phone.hi')}</div>
                  <div className={styles.phDate}>{t('hero.phone.date')}</div>
                  <div className={styles.phKpis}>
                    <div>
                      <b>{DONE_BASE + goneCount}</b>
                      <span>{t('hero.phone.doneLbl')}</span>
                    </div>
                    <div>
                      <b>{CARD_KEYS.length - goneCount}</b>
                      <span>{t('hero.phone.waitLbl')}</span>
                    </div>
                  </div>
                  <div className={styles.phLbl}>
                    <span>{t('hero.phone.pending')}</span>
                    <span>{t('hero.phone.swipe')}</span>
                  </div>
                  {CARD_KEYS.map((key, i) => {
                    const state = cards[i];
                    return (
                      <div
                        key={key}
                        className={`${styles.phCard} ${state.gone ? styles.phCardGone : ''}`}
                      >
                        <div className={styles.phTop}>
                          <span className={styles.phTag}>{t(`hero.phone.${key}.tag`)}</span>
                          <span className={styles.phAmt}>
                            {key === 'c1' ? CARD_AMOUNT_C1 : t('hero.phone.c2.amt')}
                          </span>
                        </div>
                        <div className={styles.phT}>{t(`hero.phone.${key}.title`)}</div>
                        <div className={styles.phWhy}>
                          <span className={styles.sp} aria-hidden="true">
                            ✦
                          </span>
                          <span>{t(`hero.phone.${key}.why`)}</span>
                        </div>
                        <div className={styles.phBtns}>
                          <span>{t('hero.phone.view')}</span>
                          <span className={state.approved ? styles.phOk : undefined}>
                            {state.approved ? t('hero.phone.approved') : t(`hero.phone.${key}.action`)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <PhoneNav active="today" />
              </div>
            </div>
          </Reveal>
        </div>
        <div className={styles.wrap}>
          <div className={styles.sample}>{t('sample')}</div>
        </div>
      </div>
    </section>
  );
}

const NAV_ITEMS: ReadonlyArray<{ key: 'today' | 'cost' | 'tasks' | 'market'; icon: IconName }> = [
  { key: 'today', icon: 'home' },
  { key: 'cost', icon: 'pie' },
  { key: 'tasks', icon: 'send' },
  { key: 'market', icon: 'search' },
];

/** Bottom tab bar of the sample phone screen (decorative). */
export function PhoneNav({ active }: { active: 'today' | 'cost' }) {
  const t = useTranslations('homeV2.hero.phone.nav');
  return (
    <div className={styles.phNav} aria-hidden="true">
      {NAV_ITEMS.map((item) => (
        <span key={item.key} className={item.key === active ? styles.on : undefined}>
          <Icon name={item.icon} />
          {t(item.key)}
        </span>
      ))}
    </div>
  );
}
