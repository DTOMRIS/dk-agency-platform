/**
 * @file ReceiptHero.tsx
 * @purpose Homepage «Bəs sizin rəqəminiz?» — segment picker («Siz kimsiniz?»), printed sample
 *          monthly receipt (sales − costs = remainder), live food-cost calculator and segment
 *          starter tools. Value first, sign-up second.
 * @pattern A (useTranslations) — home.receiptHero (+ homeV2.receipt for the v2 section header)
 * @task TASK-0469 · TASK-0512 (2026-10-08: restyled to the v2 cream/ink design, now the 2nd section)
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { formatNumber } from '@/lib/i18n/format';
import v2 from './v2/homeV2.module.css';
import { inter } from './v2/font';
import { Icon, Reveal, useReducedMotion, type IconName } from './v2/shared';
import styles from './ReceiptHero.module.css';

const SEGMENTS = ['restoran', 'kafe', 'otel', 'franchise', 'acilis'] as const;
type Segment = (typeof SEGMENTS)[number];

/** Starter tool routes per segment, in the same order as messages `tools.t1..t3`. */
const SEGMENT_TOOLS: Record<Segment, readonly [string, string, string]> = {
  restoran: ['/toolkit/food-cost', '/toolkit/pnl-simulator', '/toolkit/delivery-calc'],
  kafe: ['/toolkit/food-cost', '/toolkit/menu-matrix', '/toolkit/personel-planlayici'],
  otel: [
    '/toolkit/ota-hazirlig-testi',
    '/toolkit/otel-hazirlig-testi',
    '/toolkit/qonaq-evi-roi-kalkulyatoru',
  ],
  franchise: [
    '/franchise/hazirliq-testi',
    '/franchise/roi-kalkulyatoru',
    '/franchise/francbuk-generatoru',
  ],
  acilis: ['/toolkit/basabas', '/toolkit/insaat-checklist', '/toolkit/aqta-checklist'],
};

/** Starter tool icons, same order as SEGMENT_TOOLS (TASK-0512, owner 2026-10-08). */
const SEGMENT_ICONS: Record<Segment, readonly [IconName, IconName, IconName]> = {
  restoran: ['pie', 'bars', 'scooter'],
  kafe: ['pie', 'grid', 'team'],
  otel: ['search', 'star', 'trend'],
  franchise: ['check', 'trend', 'book'],
  acilis: ['target', 'building', 'shield'],
};

/** Sample-receipt cost shares (of sales) — illustrative, labelled as a sample on the receipt. */
const SHARES = { staff: 0.24, rent: 0.1, util: 0.04, comm: 0.06 } as const;
const COST_SHARE = SHARES.staff + SHARES.rent + SHARES.util + SHARES.comm;
const TARGET_FOOD_COST = 30;
const DEFAULT_SALES = 50000;
const DEFAULT_COST = 19000;
const REGISTER_PATH = '/auth/register';

function monthlyLoss(sales: number, cost: number): number {
  const fc = sales > 0 ? (cost / sales) * 100 : 0;
  return Math.max(0, ((fc - TARGET_FOOD_COST) / 100) * sales);
}

function remainder(sales: number, cost: number): number {
  return sales - cost - sales * COST_SHARE;
}

function parseDigits(value: string): number {
  const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? Math.min(n, 999_999_999) : 0;
}

/** Eases a shown number to its target (600ms cubic-out); instant under reduced motion. */
function useCountUp(target: number, reduce: boolean): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = shownRef.current;
    const start = performance.now();
    const duration = reduce ? 0 : 600;
    const step = (now: number) => {
      const k = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const value = from + (target - from) * eased;
      shownRef.current = value;
      setShown(value);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, reduce]);

  return shown;
}

/**
 * The receipt "prints" when it first scrolls into view (the section is no longer above the fold).
 * Before hydration and under reduced motion the receipt is simply shown. TASK-0519: the lines are
 * always rendered (faint while armed); the animation is a ≤0.85s reveal, so no blank paper box.
 */
function usePrintOnView(reduce: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'armed' | 'play'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase('play');
          io.disconnect();
        } else {
          setPhase((p) => (p === 'idle' ? 'armed' : p));
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return { ref, phase: reduce ? 'idle' : phase };
}

export function ReceiptHero() {
  const t = useTranslations('home.receiptHero');
  const tv = useTranslations('homeV2.receipt');
  const locale = normalizeLocale(useLocale());
  const fmt = useCallback((n: number) => formatNumber(Math.round(n), locale), [locale]);
  const reduce = useReducedMotion();

  const [segment, setSegment] = useState<Segment>('restoran');
  const [sales, setSales] = useState(DEFAULT_SALES);
  const [cost, setCost] = useState(DEFAULT_COST);
  const [popKey, setPopKey] = useState(0);

  const loss = monthlyLoss(sales, cost);
  const left = remainder(sales, cost);
  const shownLoss = useCountUp(loss, reduce);
  const shownLeft = useCountUp(left, reduce);
  const { ref: printRef, phase } = usePrintOnView(reduce);

  const onNumber = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(parseDigits(e.target.value));
    setPopKey((k) => k + 1);
  };

  const foodCost = sales > 0 ? (cost / sales) * 100 : 0;
  const tone = foodCost > 36 ? 'bad' : foodCost > 32 ? 'warn' : 'ok';
  const toneClass = { bad: styles.vBad, warn: styles.vWarn, ok: styles.vOk }[tone];

  const receiptLines: Array<{ key: string; value: string; highlight?: boolean }> = [
    { key: 'sales', value: `+${fmt(sales)}` },
    { key: 'cost', value: `−${fmt(cost)}`, highlight: true },
    { key: 'staff', value: `−${fmt(sales * SHARES.staff)}` },
    { key: 'rent', value: `−${fmt(sales * SHARES.rent)}` },
    { key: 'util', value: `−${fmt(sales * SHARES.util)}` },
    { key: 'comm', value: `−${fmt(sales * SHARES.comm)}` },
  ];

  const foodCostText = formatNumber(foodCost, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const registerHref = withLocale(locale, REGISTER_PATH);
  const phaseClass = phase === 'armed' ? styles.armed : phase === 'play' ? styles.play : '';

  return (
    <section
      className={`${v2.v2} ${inter.className} ${styles.section}`}
      id="reqem"
      aria-labelledby="receipt-hero-title"
    >
      <div className={v2.sec}>
        <div className={v2.wrap}>
          <Reveal className={v2.secHead}>
            <span className={v2.eyebrow}>
              <span className={v2.dot} />
              {tv('eyebrow')}
            </span>
            <h2 id="receipt-hero-title" className={v2.h2}>
              {tv('title')}
            </h2>
            <p>{tv('sub')}</p>
          </Reveal>

          <div className={styles.grid}>
            {/* Left: segment picker + message + CTAs */}
            <div className={`${styles.card} ${styles.intro}`}>
              <fieldset className={styles.seg}>
                <legend className={styles.segLegend}>{t('whoAreYou')}</legend>
                <div className={styles.pills}>
                  {SEGMENTS.map((key) => {
                    const active = key === segment;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSegment(key)}
                        className={`${styles.pill} ${active ? styles.pillOn : ''}`}
                      >
                        {t(`segments.${key}.label`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <span className={styles.kicker}>{t('eyebrow')}</span>
              <h3 key={segment} className={`${styles.segTitle} ${styles.rise}`}>
                {t(`segments.${segment}.title`)}
              </h3>
              <p className={styles.segSub}>{t(`segments.${segment}.sub`)}</p>

              <div className={styles.ctas}>
                <Link href={registerHref} className={`${v2.btn} ${v2.btnRed} ${styles.ctaBtn}`}>
                  {t('ctaJoin')}
                </Link>
                <a href="#receipt-calc" className={`${v2.btn} ${v2.btnGhost} ${styles.ctaBtn}`}>
                  {t('ctaCalc')}
                </a>
              </div>
              {/* Segment starter tools — inside the left card since TASK-0512 (owner 2026-10-08):
                  fills the space under the CTAs and keeps the section one screen shorter. */}
              <div className={styles.tools}>
                <h4 className={styles.toolsTitle}>{t(`segments.${segment}.toolsTitle`)}</h4>
                <div className={styles.toolGrid}>
                  {SEGMENT_TOOLS[segment].map((href, i) => (
                    <Link
                      key={`${segment}-${href}`}
                      href={withLocale(locale, href)}
                      className={`${styles.tool} ${styles.rise}`}
                    >
                      <span className={styles.toolIc}>
                        <Icon name={SEGMENT_ICONS[segment][i]} />
                      </span>
                      <span className={styles.toolText}>
                        <span className={styles.toolName}>
                          {t(`segments.${segment}.tools.t${i + 1}.name`)}
                        </span>
                        <span className={styles.toolDesc}>
                          {t(`segments.${segment}.tools.t${i + 1}.desc`)}
                        </span>
                        <span className={styles.toolHint}>
                          <span className={styles.toolHintLbl}>{tv('resultLabel')}</span>
                          {tv(`hints.${segment}.t${i + 1}`)}
                        </span>
                      </span>
                      <span className={styles.toolGo}>{t('start')}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* TASK-0512: the left card stretches to the receipt column's height; this footer
                  sits at its bottom so the card no longer ends in an empty block. */}
              <div className={styles.introFoot}>
                <ul className={styles.trust}>
                  <li>
                    <Icon name="calc" />
                    {tv('trust1')}
                  </li>
                  <li>
                    <Icon name="lock" />
                    {tv('trust2')}
                  </li>
                </ul>
                {/* TASK-0502: Baku HoReCa owners write rather than fill forms — a quiet
                    secondary path, so the block keeps one red button. */}
                <a
                  href={`/api/leads/whatsapp?text=${encodeURIComponent(t('whatsappText'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.wa}
                >
                  <Icon name="chat" />
                  {t('whatsappLink')}
                </a>
              </div>
            </div>

            {/* Right: printed receipt + live calculator */}
            <div className={styles.right}>
              <div
                ref={printRef}
                className={`${styles.printer} ${phaseClass}`}
                role="img"
                aria-label={t('receiptAria')}
              >
                <div className={styles.slot} aria-hidden="true" />
                <div className={styles.paperClip} aria-hidden="true">
                  <div className={styles.paper}>
                    <div className={styles.rHead}>
                      <span>{t('receiptTitle')}</span>
                      <span>{t('receiptBrand')}</span>
                    </div>
                    <div className={styles.rule} />
                    {receiptLines.map((line, i) => (
                      <div
                        key={line.key}
                        className={`${styles.line} ${styles.rLine} ${line.highlight ? styles.rHot : ''}`}
                        style={{ animationDelay: `${(0.1 + i * 0.06).toFixed(2)}s` }}
                      >
                        <span>{t(`lines.${line.key}`)}</span>
                        <span className={styles.num}>{line.value}</span>
                      </div>
                    ))}
                    <div className={styles.rule} />
                    <div
                      className={`${styles.line} ${styles.rTotal}`}
                      style={{ animationDelay: '0.5s' }}
                    >
                      <span>{t('receiptLeft')}</span>
                      <span
                        className={`${styles.num} ${styles.left} ${left < 0 ? styles.neg : styles.pos}`}
                      >
                        {shownLeft < 0 ? '−' : ''}
                        {fmt(Math.abs(shownLeft))} ₼
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div id="receipt-calc" className={`${styles.card} ${styles.calc}`}>
                <span className={styles.calcEyebrow}>{t('calcEyebrow')}</span>
                <div className={styles.fields}>
                  <label htmlFor="receipt-sales" className={styles.field}>
                    {t('salesLabel')}
                    <input
                      id="receipt-sales"
                      inputMode="numeric"
                      autoComplete="off"
                      value={fmt(sales)}
                      onChange={onNumber(setSales)}
                      className={styles.input}
                    />
                  </label>
                  <label htmlFor="receipt-cost" className={styles.field}>
                    {t('costLabel')}
                    <input
                      id="receipt-cost"
                      inputMode="numeric"
                      autoComplete="off"
                      value={fmt(cost)}
                      onChange={onNumber(setCost)}
                      className={styles.input}
                    />
                  </label>
                </div>
                <div
                  key={popKey}
                  className={`${popKey > 0 ? styles.pop : ''} ${styles.verdict} ${toneClass}`}
                  aria-live="polite"
                >
                  <span className={styles.fc}>{foodCostText}%</span>
                  <span className={styles.verdictText}>
                    {loss > 0 ? t('verdictLoss', { amount: fmt(shownLoss) }) : t('verdictOk')}
                    <span className={styles.target}>{t('target')}</span>
                  </span>
                </div>
                <Link href={registerHref} className={`${v2.btn} ${v2.btnRed} ${styles.saveBtn}`}>
                  {t('saveReport')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
