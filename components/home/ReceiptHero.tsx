/**
 * @file ReceiptHero.tsx
 * @purpose Homepage v2 hero — "Siz kimsiniz?" segment picker, printed sample receipt,
 *          live food-cost calculator and segment starter tools. Value first, sign-up second.
 * @pattern A (useTranslations) — home.receiptHero
 * @task TASK-0469
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { formatNumber } from '@/lib/i18n/format';
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

/** Sample-receipt cost shares (of sales) — illustrative, labelled as a sample on the receipt. */
const SHARES = { staff: 0.24, rent: 0.1, util: 0.04, comm: 0.06 } as const;
const TARGET_FOOD_COST = 30;
const DEFAULT_SALES = 50000;
const DEFAULT_COST = 19000;
const REGISTER_PATH = '/auth/register';

function monthlyLoss(sales: number, cost: number): number {
  const fc = sales > 0 ? (cost / sales) * 100 : 0;
  return Math.max(0, ((fc - TARGET_FOOD_COST) / 100) * sales);
}

function parseDigits(value: string): number {
  const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? Math.min(n, 999_999_999) : 0;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ReceiptHero() {
  const t = useTranslations('home.receiptHero');
  const locale = normalizeLocale(useLocale());
  const fmt = useCallback((n: number) => formatNumber(Math.round(n), locale), [locale]);

  const [segment, setSegment] = useState<Segment>('restoran');
  const [sales, setSales] = useState(DEFAULT_SALES);
  const [cost, setCost] = useState(DEFAULT_COST);
  const [shownLoss, setShownLoss] = useState(() => monthlyLoss(DEFAULT_SALES, DEFAULT_COST));
  const [popKey, setPopKey] = useState(0);
  const rafRef = useRef<number | null>(null);
  const shownRef = useRef(shownLoss);

  const loss = monthlyLoss(sales, cost);

  // Count the loss figure up/down to its new value; instant under reduced motion.
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = shownRef.current;
    const start = performance.now();
    const duration = prefersReducedMotion() ? 0 : 600;
    const step = (now: number) => {
      const k = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const value = from + (loss - from) * eased;
      shownRef.current = value;
      setShownLoss(value);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loss]);

  const onNumber = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(parseDigits(e.target.value));
    setPopKey((k) => k + 1);
  };

  const foodCost = sales > 0 ? (cost / sales) * 100 : 0;
  const tone = foodCost > 36 ? 'bad' : foodCost > 32 ? 'warn' : 'ok';
  const toneClass = {
    bad: { box: 'bg-rose-50', value: 'text-rose-700' },
    warn: { box: 'bg-amber-50', value: 'text-amber-800' },
    ok: { box: 'bg-emerald-50', value: 'text-emerald-800' },
  }[tone];

  const staff = sales * SHARES.staff;
  const rent = sales * SHARES.rent;
  const util = sales * SHARES.util;
  const comm = sales * SHARES.comm;
  const left = sales - cost - staff - rent - util - comm;

  const receiptLines: Array<{ key: string; value: string; highlight?: boolean }> = [
    { key: 'sales', value: `+${fmt(sales)}` },
    { key: 'cost', value: `−${fmt(cost)}`, highlight: true },
    { key: 'staff', value: `−${fmt(staff)}` },
    { key: 'rent', value: `−${fmt(rent)}` },
    { key: 'util', value: `−${fmt(util)}` },
    { key: 'comm', value: `−${fmt(comm)}` },
  ];

  const foodCostText = formatNumber(foodCost, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const registerHref = withLocale(locale, REGISTER_PATH);

  return (
    <>
      <section className="bg-[#0B0F1A] text-white" aria-labelledby="receipt-hero-title">
        <div className="mx-auto grid max-w-[1200px] items-start gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pb-20 lg:pt-14">
          {/* Left: message + segment picker */}
          <div className="flex min-w-0 flex-col gap-5 lg:pt-6">
            <span className="text-[13px] font-semibold tracking-[0.1em] text-rose-300">
              {t('eyebrow')}
            </span>
            <h1
              id="receipt-hero-title"
              key={segment}
              className={`${styles.rise} m-0 font-display text-[40px] font-bold leading-[1.05] text-white sm:text-[56px] lg:text-[68px] lg:leading-[1.02]`}
            >
              {t(`segments.${segment}.title`)}
            </h1>
            <p className="m-0 max-w-[520px] text-[17px] leading-relaxed text-slate-300 lg:text-[19px]">
              {t(`segments.${segment}.sub`)}
            </p>

            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="mb-2.5 p-0 text-sm font-semibold text-slate-300">
                {t('whoAreYou')}
              </legend>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((key) => {
                  const active = key === segment;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSegment(key)}
                      className={`h-11 rounded-full px-[18px] text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300 ${
                        active
                          ? 'bg-white text-slate-900 ring-2 ring-rose-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {t(`segments.${key}.label`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={registerHref}
                className="flex h-[54px] items-center rounded-xl bg-[#E11D48] px-[26px] text-[17px] font-semibold text-white transition-colors hover:bg-[#BE123C] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300"
              >
                {t('ctaJoin')}
              </Link>
              <a
                href="#receipt-calc"
                className="flex h-[54px] items-center rounded-xl border border-slate-500 px-[26px] text-[17px] font-semibold text-white transition-colors hover:border-slate-300 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300"
              >
                {t('ctaCalc')}
              </a>
            </div>
          </div>

          {/* Right: printed receipt + live calculator */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="relative h-[360px]" role="img" aria-label={t('receiptAria')}>
              <div
                className="absolute inset-x-0 top-0 h-3 rounded-md bg-slate-800"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-5 bottom-0 top-1.5 overflow-hidden sm:inset-x-8"
                aria-hidden="true"
              >
                <div
                  className={`${styles.paper} flex flex-col gap-[9px] bg-[#FFFDF8] px-6 pb-[30px] pt-[22px] text-slate-900`}
                >
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{t('receiptTitle')}</span>
                    <span>{t('receiptBrand')}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-400" />
                  {receiptLines.map((line, i) => (
                    <div
                      key={line.key}
                      className={`${styles.line} flex justify-between gap-3 text-[14px] sm:text-[15px] ${
                        line.highlight ? 'font-semibold text-rose-700' : 'text-slate-900'
                      }`}
                      style={{ animationDelay: `${(0.9 + i * 0.15).toFixed(2)}s` }}
                    >
                      <span>{t(`lines.${line.key}`)}</span>
                      <span className="tabular-nums">{line.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-slate-400" />
                  <div
                    className={`${styles.line} flex justify-between text-[17px] font-semibold text-slate-900 sm:text-[19px]`}
                    style={{ animationDelay: '1.9s' }}
                  >
                    <span>{t('receiptLeft')}</span>
                    <span
                      className={`tabular-nums ${left < 0 ? 'text-rose-700' : 'text-emerald-800'}`}
                    >
                      {left < 0 ? '−' : ''}
                      {fmt(Math.abs(left))} ₼
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="receipt-calc"
              className="flex scroll-mt-28 flex-col gap-3.5 rounded-[18px] bg-white p-5 text-slate-900 sm:p-[22px]"
            >
              <span className="text-[13px] font-semibold tracking-[0.08em] text-emerald-800">
                {t('calcEyebrow')}
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  htmlFor="receipt-sales"
                  className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700"
                >
                  {t('salesLabel')}
                  <input
                    id="receipt-sales"
                    inputMode="numeric"
                    autoComplete="off"
                    value={fmt(sales)}
                    onChange={onNumber(setSales)}
                    className="h-[50px] min-w-0 rounded-[10px] border border-slate-300 px-3 text-lg tabular-nums text-slate-900 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                  />
                </label>
                <label
                  htmlFor="receipt-cost"
                  className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700"
                >
                  {t('costLabel')}
                  <input
                    id="receipt-cost"
                    inputMode="numeric"
                    autoComplete="off"
                    value={fmt(cost)}
                    onChange={onNumber(setCost)}
                    className="h-[50px] min-w-0 rounded-[10px] border border-slate-300 px-3 text-lg tabular-nums text-slate-900 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                  />
                </label>
              </div>
              <div
                key={popKey}
                className={`${popKey > 0 ? styles.pop : ''} flex flex-wrap items-center gap-x-[18px] gap-y-2 rounded-[14px] px-[18px] py-4 ${toneClass.box}`}
                aria-live="polite"
              >
                <span
                  className={`text-[40px] font-bold tabular-nums sm:text-[44px] ${toneClass.value}`}
                >
                  {foodCostText}%
                </span>
                <span className="min-w-[200px] flex-1 text-[15px] leading-snug text-slate-900">
                  {loss > 0 ? t('verdictLoss', { amount: fmt(shownLoss) }) : t('verdictOk')}
                  <br />
                  <span className="text-slate-600">{t('target')}</span>
                </span>
              </div>
              <Link
                href={registerHref}
                className="flex h-[52px] items-center justify-center rounded-xl bg-[#E11D48] px-4 text-center text-base font-semibold text-white transition-colors hover:bg-[#BE123C] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300"
              >
                {t('saveReport')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Segment starter tools */}
      <section className="bg-[#FAFAF9]" aria-labelledby="receipt-tools-title">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-14 sm:px-6 lg:py-16">
          <h2
            id="receipt-tools-title"
            className="m-0 font-display text-[30px] font-bold text-slate-900 lg:text-[40px]"
          >
            {t(`segments.${segment}.toolsTitle`)}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SEGMENT_TOOLS[segment].map((href, i) => (
              <Link
                key={`${segment}-${href}`}
                href={withLocale(locale, href)}
                className={`${styles.rise} flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rose-300`}
              >
                <span className="text-[19px] font-semibold text-slate-900">
                  {t(`segments.${segment}.tools.t${i + 1}.name`)}
                </span>
                <span className="text-[15px] text-slate-600">
                  {t(`segments.${segment}.tools.t${i + 1}.desc`)}
                </span>
                <span className="pt-1.5 text-[15px] font-semibold text-rose-700">{t('start')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
