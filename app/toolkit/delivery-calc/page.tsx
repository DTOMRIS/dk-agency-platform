'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Lightbulb, Truck } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { numberLocale } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';

type PlatformKey = 'wolt' | 'bolt' | 'yango' | 'own';
const PLATFORM_DEFAULTS: Record<PlatformKey, number> = { wolt: 30, bolt: 30, yango: 30, own: 10 };
const ZERO_COMMISSIONS: Record<PlatformKey, number> = { wolt: 0, bolt: 0, yango: 0, own: 0 };

/** Example values loaded by «Nümunəni yüklə» (TASK-0517) — the tool's previous defaults. */
const EXAMPLE = {
  selectedPlatforms: ['wolt'] as PlatformKey[],
  orderValue: 30,
  commissions: PLATFORM_DEFAULTS,
  foodCostPct: 33,
  packagingCost: 1.5,
  laborCost: 3,
  dailyOrders: 20,
  monthlyDays: 30,
};
type DeliveryState = typeof EXAMPLE;

export default function DeliveryCalcPage() {
  const t = useTranslations('toolkit.deliveryCalc');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const fmt0 = (n: number) => new Intl.NumberFormat(numberLocale(locale)).format(Math.round(Number.isFinite(n) ? n : 0));
  const fmt2 = (n: number) => new Intl.NumberFormat(numberLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const PLATFORM_LABELS: Record<PlatformKey, string> = { wolt: 'Wolt', bolt: 'Bolt Food', yango: 'Yango', own: t('platformOwn') };
  const deliveryTips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5'), t('tip6'), t('tip7')];
  const contractQuestions = [t('contractQ1'), t('contractQ2'), t('contractQ3'), t('contractQ4'), t('contractQ5'), t('contractQ6'), t('contractQ7')];
  const blogLinks = [
    { title: t('blogLink1Title'), href: '/blog/wolt-bolt-komissiyon', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), href: '/toolkit/pnl', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), href: '/toolkit/food-cost', tag: t('blogLink3Tag') },
  ];

  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>(['wolt']);
  const [orderValue, setOrderValue] = useState(30);
  // TASK-0515: each platform has its own commission (was one shared value for all rows).
  const [commissions, setCommissions] = useState<Record<PlatformKey, number>>({ ...PLATFORM_DEFAULTS });
  const [foodCostPct, setFoodCostPct] = useState(33);
  const [packagingCost, setPackagingCost] = useState(1.5);
  const [laborCost, setLaborCost] = useState(3);
  const [dailyOrders, setDailyOrders] = useState(20);
  const [monthlyDays, setMonthlyDays] = useState(30);

  const togglePlatform = (platform: PlatformKey) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        const next = prev.filter((item) => item !== platform);
        return next.length > 0 ? next : [platform];
      }
      return [...prev, platform];
    });
  };

  const calc = useMemo(() => {
    const dineInFoodCost = orderValue * (foodCostPct / 100);
    const dineInNet = orderValue - dineInFoodCost - laborCost;
    const rows = selectedPlatforms.map((platform) => {
      const commissionPct = commissions[platform];
      const commission = orderValue * (commissionPct / 100);
      const foodCost = orderValue * (foodCostPct / 100);
      const net = orderValue - commission - foodCost - packagingCost - laborCost;
      return { platform, commissionPct, commission, foodCost, net, monthlyNet: net * dailyOrders * monthlyDays };
    });
    return { dineInFoodCost, dineInNet, rows };
  }, [commissions, dailyOrders, foodCostPct, laborCost, monthlyDays, orderValue, packagingCost, selectedPlatforms]);

  // TASK-0517: shared reset UX — «Təmizlə» (with «Geri al») and «Nümunəni yüklə».
  const snapshot = (): DeliveryState => ({ selectedPlatforms, orderValue, commissions, foodCostPct, packagingCost, laborCost, dailyOrders, monthlyDays });
  const restore = (st: DeliveryState) => {
    setSelectedPlatforms([...st.selectedPlatforms]); setOrderValue(st.orderValue); setCommissions({ ...st.commissions });
    setFoodCostPct(st.foodCostPct); setPackagingCost(st.packagingCost); setLaborCost(st.laborCost); setDailyOrders(st.dailyOrders); setMonthlyDays(st.monthlyDays);
  };
  // Platform choice stays as it is (at least one channel is always selected); every number goes to zero.
  const clearAll = () => restore({ selectedPlatforms, orderValue: 0, commissions: ZERO_COMMISSIONS, foodCostPct: 0, packagingCost: 0, laborCost: 0, dailyOrders: 0, monthlyDays: EXAMPLE.monthlyDays });

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <ToolResetControls snapshot={snapshot} restore={restore} onClear={clearAll} onLoadExample={() => restore(EXAMPLE)} />
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900">{t('calculatorTitle')}</h2>
        <p className="text-sm text-slate-600">{t('calculatorSubtitle')}</p>
      </div>

      {/* Platform selection */}
      <div>
        <p className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('platformSelectionLabel')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
            const active = selectedPlatforms.includes(platform);
            return (
              <button key={platform} type="button" aria-pressed={active} onClick={() => togglePlatform(platform)}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${active ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200/70' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${active ? 'text-orange-800' : 'text-slate-900'}`}>{PLATFORM_LABELS[platform]}</span>
                  <span className={`h-5 w-5 rounded-md border ${active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`} />
                </div>
                <div className="mt-1 text-xs text-slate-600">{t('defaultCommission')}: {PLATFORM_DEFAULTS[platform]}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commission per selected platform */}
      <div className="grid gap-4 sm:grid-cols-2">
        {selectedPlatforms.map((platform) => (
          <div key={platform}>
            <label htmlFor={`dc-comm-${platform}`} className="mb-1.5 block text-xs font-semibold text-slate-700">
              {t('labelCommissionFor', { platform: PLATFORM_LABELS[platform] })}
            </label>
            <DecimalInput id={`dc-comm-${platform}`} blankZero value={commissions[platform]}
              aria-label={t('labelCommissionFor', { platform: PLATFORM_LABELS[platform] })}
              onValueChange={(v) => setCommissions((prev) => ({ ...prev, [platform]: Math.min(100, Math.max(0, v)) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20" />
          </div>
        ))}
      </div>

      {/* Numeric inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { id: 'dc-order', label: t('labelOrderValue'), value: orderValue, set: setOrderValue },
          { id: 'dc-fc', label: t('labelFoodCostPct'), value: foodCostPct, set: (v: number) => setFoodCostPct(Math.min(100, v)) },
          { id: 'dc-pack', label: t('labelPackagingCost'), value: packagingCost, set: setPackagingCost },
          { id: 'dc-labor', label: t('labelLaborCost'), value: laborCost, set: setLaborCost },
          { id: 'dc-orders', label: t('labelDailyOrders'), value: dailyOrders, set: (v: number) => setDailyOrders(Math.round(v)) },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="mb-1.5 block text-xs font-semibold text-slate-700">{f.label}</label>
            <DecimalInput id={f.id} blankZero value={f.value} onValueChange={(v) => f.set(Math.max(0, v))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20" />
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-base font-bold text-slate-900">{t('comparisonTitle')}</h3>
        <p className="mb-4 text-sm text-slate-600">{t('comparisonSubtitle')}</p>
        {/* TASK-0515: stacked cards below 640px — the 6-column table clipped at 390px */}
        <ul className="space-y-3 sm:hidden" data-testid="dc-cards">
          {[
            { key: 'dinein', label: t('dineInLabel'), commission: 0, foodCost: calc.dineInFoodCost, other: laborCost, net: calc.dineInNet },
            ...calc.rows.map((row) => ({ key: row.platform, label: `${PLATFORM_LABELS[row.platform]} · ${row.commissionPct}%`, commission: row.commission, foodCost: row.foodCost, other: packagingCost + laborCost, net: row.net })),
          ].map((r) => (
            <li key={r.key} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="font-semibold text-slate-900">{r.label}</span>
                <span className={`text-lg font-black tabular-nums ${r.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt2(r.net)} ₼</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-slate-600">{t('colSales')}</dt><dd className="text-right tabular-nums text-slate-900">{fmt2(orderValue)} ₼</dd>
                <dt className="text-slate-600">{t('colCommission')}</dt><dd className={`text-right tabular-nums ${r.commission > 0 ? 'text-red-700' : 'text-slate-700'}`}>{r.commission > 0 ? '-' : ''}{fmt2(r.commission)} ₼</dd>
                <dt className="text-slate-600">{t('colFoodCost')}</dt><dd className="text-right tabular-nums text-slate-700">-{fmt2(r.foodCost)} ₼</dd>
                <dt className="text-slate-600">{t('colOther')}</dt><dd className="text-right tabular-nums text-slate-700">-{fmt2(r.other)} ₼</dd>
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-xl ring-1 ring-slate-200 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-700">
                <th className="px-4 py-3 text-left">{t('colChannel')}</th>
                <th className="px-3 py-3 text-right">{t('colSales')}</th>
                <th className="px-3 py-3 text-right">{t('colCommission')}</th>
                <th className="px-3 py-3 text-right">{t('colFoodCost')}</th>
                <th className="px-3 py-3 text-right">{t('colOther')}</th>
                <th className="px-4 py-3 text-right">{t('colNet')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-white">
                <td className="px-4 py-3 font-semibold text-slate-900">{t('dineInLabel')}</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-900">{fmt2(orderValue)} ₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">{fmt2(0)} ₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">-{fmt2(calc.dineInFoodCost)} ₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">-{fmt2(laborCost)} ₼</td>
                <td className="px-4 py-3 text-right font-black tabular-nums text-emerald-700">{fmt2(calc.dineInNet)} ₼</td>
              </tr>
              {calc.rows.map((row) => (
                <tr key={row.platform} className="bg-white">
                  <td className="px-4 py-3 font-semibold text-slate-900">{PLATFORM_LABELS[row.platform]} <span className="text-xs font-medium text-slate-600">· {row.commissionPct}%</span></td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-900">{fmt2(orderValue)} ₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-red-700">-{fmt2(row.commission)} ₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">-{fmt2(row.foodCost)} ₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">-{fmt2((packagingCost + laborCost))} ₼</td>
                  <td className={`px-4 py-3 text-right font-black tabular-nums ${row.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt2(row.net)} ₼</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly P&L cards */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-base font-bold text-slate-900">{t('monthlyPnlTitle')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {calc.rows.map((row) => (
            <div key={row.platform} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-900">{PLATFORM_LABELS[row.platform]}</div>
              <div className="text-xs text-slate-600">{dailyOrders} {t('ordersPerDay')} × {monthlyDays} {t('days')}</div>
              <div className="mt-3 text-2xl font-black tabular-nums text-slate-900">{fmt0(row.monthlyNet)}₼</div>
              <div className={`mt-1 text-xs font-semibold ${row.monthlyNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{t('monthlyNetLabel')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statOrderValue')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{fmt2(orderValue)} ₼</div>
      </div>
      <div className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statCommission')}</div>
        <div className="mt-1 space-y-0.5" data-testid="dc-commissions">
          {calc.rows.map((row) => (
            <div key={row.platform} className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">{PLATFORM_LABELS[row.platform]}</span>
              <span className="text-2xl font-black text-orange-800">{row.commissionPct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statFoodCost')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{foodCostPct}%</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statMonthlyOrders')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{dailyOrders * monthlyDays}</div>
      </div>

      {/* Delivery math explanation */}
      <div className="border-t border-slate-100 pt-4">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck size={16} className="text-orange-700" />
            <h3 className="text-sm font-bold text-slate-900">{t('deliveryMathTitle')}</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{t('deliveryMathBody')}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">{t('tipsTitle')}</h3>
        <div className="space-y-2">
          {deliveryTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-700">{i + 1}</div>
              <p className="text-xs leading-relaxed text-slate-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contract questions */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">{t('contractQuestionsTitle')}</h3>
        <div className="space-y-2">
          {contractQuestions.map((q, i) => (
            <div key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="mr-1.5 font-bold text-orange-700">{i + 1}.</span>{q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────

  const bottomSection = (
    <>
      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-orange-300" /><h3 className="text-base font-bold text-orange-200">{t('dkAdviceLabel')}</h3></div>
            <p className="text-sm leading-relaxed text-slate-300">{t('dkAdviceBody')}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 p-6 text-white shadow-xl shadow-orange-500/15">
          <div className="mb-3 flex items-center gap-2"><Truck size={18} /><h2 className="text-base font-bold">{t('ocaqTitle')}</h2></div>
          <p className="text-sm leading-relaxed text-white/85">{t('ocaqBody')}</p>
          <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-700 transition-colors hover:bg-orange-50">
            {t('ocaqCta')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5"><BookOpen size={18} className="text-orange-700" /><h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3></div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700">{link.tag}</span>
              <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-800">{link.title}</h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-orange-800">{t('readLabel')} <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="delivery-calc" toolName={t('title')} toolDescription={t('subtitle')} tier="kalfa"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'delivery-calc', locale, result: { orderValue, commissionPct: Math.max(...calc.rows.map((r) => r.commissionPct)), foodCostPct, dineInNet: calc.dineInNet, platformCount: selectedPlatforms.length } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
