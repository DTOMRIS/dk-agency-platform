'use client';

/**
 * @file MiniCalc.tsx
 * @purpose TASK-0542 (owner 2026-10-11: «araştır, yaratıcı, bizi ileri taşıyacak sayfa»; reference: NerdWallet —
 *          the article *is* the calculator). A 2–4 field live calculator inside a blog post that maps to a
 *          tool (BLOG_TOOL_MAP): the reader checks the post's formula with their own numbers without leaving
 *          the page, then opens the full tool. Fields start empty (no invented sample numbers); thresholds
 *          come from lib/toolkit/benchmarks.ts, the same ones the full tools use.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/i18n/format';
import { FOOD_COST_MAX_PCT, PRIME_COST_MAX_PCT, RENT_MAX_PCT } from '@/lib/toolkit/benchmarks';
import s from '@/components/inner/inner.module.css';
import type { MiniCalcTool } from '@/lib/blog/mini-calc-tools';

const FIELDS: Record<MiniCalcTool, string[]> = {
  'food-cost': ['cost', 'price'],
  basabas: ['fixed', 'check', 'variable'],
  'delivery-calc': ['price', 'commission', 'cost'],
  pnl: ['sales', 'food', 'labor', 'rent', 'other'],
};

function num(raw: string): number | null {
  const v = Number(raw.replace(/\s/g, '').replace(',', '.'));
  return raw.trim() !== '' && Number.isFinite(v) ? v : null;
}

type Tone = 'ok' | 'warn' | 'bad';
type Result = { big: string; label: string; lines: string[]; tone: Tone | null } | null;

export default function MiniCalc({ tool, fullHref }: { tool: MiniCalcTool; fullHref: string }) {
  const t = useTranslations('innerV2.miniCalc');
  const locale = useLocale();
  const [vals, setVals] = useState<Record<string, string>>({});
  const v = (k: string) => num(vals[k] ?? '');
  const money = (n: number) => `${formatNumber(n, locale, { maximumFractionDigits: 2 })} ₼`;
  const pct = (n: number) => `${formatNumber(n, locale, { maximumFractionDigits: 1 })}%`;

  let result: Result = null;
  if (tool === 'food-cost') {
    const cost = v('cost');
    const price = v('price');
    if (cost !== null && price && price > 0) {
      const p = (cost / price) * 100;
      result = {
        big: pct(p),
        label: t('food-cost.result'),
        tone: p <= FOOD_COST_MAX_PCT ? 'ok' : p <= FOOD_COST_MAX_PCT + 5 ? 'warn' : 'bad',
        lines: [
          p <= FOOD_COST_MAX_PCT ? t('food-cost.ok', { max: FOOD_COST_MAX_PCT }) : t('food-cost.high', { max: FOOD_COST_MAX_PCT }),
          t('food-cost.price', { max: FOOD_COST_MAX_PCT, price: money(cost / (FOOD_COST_MAX_PCT / 100)) }),
        ],
      };
    }
  } else if (tool === 'basabas') {
    const fixed = v('fixed');
    const check = v('check');
    const variable = v('variable');
    if (fixed !== null && check && check > 0 && variable !== null && variable < 100) {
      const monthly = fixed / (1 - variable / 100);
      result = {
        big: money(monthly),
        label: t('basabas.result'),
        tone: null,
        lines: [t('basabas.perDay', { n: Math.ceil(monthly / check / 30) }), t('basabas.note')],
      };
    }
  } else if (tool === 'delivery-calc') {
    const price = v('price');
    const commission = v('commission');
    const cost = v('cost');
    if (price && price > 0 && commission !== null && cost !== null) {
      const fee = price * (commission / 100);
      const left = price - fee - cost;
      const margin = (left / price) * 100;
      result = {
        big: money(left),
        label: t('delivery-calc.result'),
        tone: left <= 0 ? 'bad' : margin < 15 ? 'warn' : 'ok',
        lines: [t('delivery-calc.fee', { fee: money(fee) }), t('delivery-calc.margin', { pct: pct(margin) })],
      };
    }
  } else {
    const sales = v('sales');
    if (sales && sales > 0) {
      const food = v('food') ?? 0;
      const labor = v('labor') ?? 0;
      const rent = v('rent') ?? 0;
      const other = v('other') ?? 0;
      const profit = sales - food - labor - rent - other;
      const prime = ((food + labor) / sales) * 100;
      const rentPct = (rent / sales) * 100;
      result = {
        big: money(profit),
        label: t('pnl.result', { pct: pct((profit / sales) * 100) }),
        tone: profit <= 0 ? 'bad' : prime > PRIME_COST_MAX_PCT || rentPct > RENT_MAX_PCT ? 'warn' : 'ok',
        lines: [
          t(prime > PRIME_COST_MAX_PCT ? 'pnl.primeHigh' : 'pnl.primeOk', { pct: pct(prime), max: PRIME_COST_MAX_PCT }),
          t(rentPct > RENT_MAX_PCT ? 'pnl.rentHigh' : 'pnl.rentOk', { pct: pct(rentPct), max: RENT_MAX_PCT }),
        ],
      };
    }
  }

  return (
    <section className={s.mc} data-testid="mini-calc" aria-label={t(`${tool}.title`)}>
      <div className={s.mcHead}>
        <small>{t('eyebrow')}</small>
        <b>{t(`${tool}.title`)}</b>
      </div>
      <div className={s.mcGrid}>
        <div className={s.mcFields}>
          {FIELDS[tool].map((key) => (
            <label key={key} className={s.mcField}>
              <span>{t(`${tool}.f.${key}`)}</span>
              <input
                inputMode="decimal"
                autoComplete="off"
                value={vals[key] ?? ''}
                onChange={(e) => setVals((prev) => ({ ...prev, [key]: e.target.value.slice(0, 14) }))}
                placeholder={t(`${tool}.p.${key}`)}
                data-testid={`mini-calc-${key}`}
              />
            </label>
          ))}
        </div>
        <div className={`${s.mcOut} ${result?.tone ? s[`mc_${result.tone}`] : ''}`} aria-live="polite">
          {result ? (
            <>
              <span className={s.mcLabel}>{result.label}</span>
              <span className={s.mcBig} data-testid="mini-calc-result">{result.big}</span>
              {result.lines.map((line) => (
                <span key={line} className={s.mcLine}>{line}</span>
              ))}
            </>
          ) : (
            <span className={s.mcEmpty}>{t('empty')}</span>
          )}
        </div>
      </div>
      <div className={s.mcFoot}>
        <span>{t('foot')}</span>
        <Link href={fullHref} className={s.mcBtn}>
          {t('full')} →
        </Link>
      </div>
    </section>
  );
}
