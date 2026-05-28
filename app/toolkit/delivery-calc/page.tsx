'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, Lightbulb, RotateCcw, Truck } from 'lucide-react';
import ToolkitStudioLayout from '@/components/toolkit/ToolkitStudioLayout';

type PlatformKey = 'wolt' | 'bolt' | 'yango' | 'own';
const PLATFORM_DEFAULTS: Record<PlatformKey, number> = { wolt: 30, bolt: 30, yango: 30, own: 10 };

export default function DeliveryCalcPage() {
  const t = useTranslations('toolkit.deliveryCalc');

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
  const [commissionPct, setCommissionPct] = useState(30);
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
      setCommissionPct(PLATFORM_DEFAULTS[platform]);
      return [...prev, platform];
    });
  };

  const calc = useMemo(() => {
    const dineInFoodCost = orderValue * (foodCostPct / 100);
    const dineInNet = orderValue - dineInFoodCost - laborCost;
    const rows = selectedPlatforms.map((platform) => {
      const commission = orderValue * (commissionPct / 100);
      const foodCost = orderValue * (foodCostPct / 100);
      const net = orderValue - commission - foodCost - packagingCost - laborCost;
      return { platform, commission, foodCost, net, monthlyNet: net * dailyOrders * monthlyDays };
    });
    return { dineInFoodCost, dineInNet, rows };
  }, [commissionPct, dailyOrders, foodCostPct, laborCost, monthlyDays, orderValue, packagingCost, selectedPlatforms]);

  const resetAll = () => {
    setSelectedPlatforms(['wolt']); setOrderValue(30); setCommissionPct(30);
    setFoodCostPct(33); setPackagingCost(1.5); setLaborCost(3); setDailyOrders(20); setMonthlyDays(30);
  };

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t('calculatorTitle')}</h2>
          <p className="text-sm text-slate-500">{t('calculatorSubtitle')}</p>
        </div>
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-orange-600">
          <RotateCcw size={13} /> {t('reset')}
        </button>
      </div>

      {/* Platform selection */}
      <div>
        <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('platformSelectionLabel')}</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
            const active = selectedPlatforms.includes(platform);
            return (
              <button key={platform} onClick={() => togglePlatform(platform)}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${active ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200/70' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${active ? 'text-orange-700' : 'text-slate-900'}`}>{PLATFORM_LABELS[platform]}</span>
                  <span className={`h-5 w-5 rounded-md border ${active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`} />
                </div>
                <div className="mt-1 text-xs text-slate-500">{t('defaultCommission')}: {PLATFORM_DEFAULTS[platform]}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Numeric inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: t('labelOrderValue'), value: orderValue, set: setOrderValue, step: 0.5 },
          { label: t('labelCommissionPct'), value: commissionPct, set: setCommissionPct, step: 1 },
          { label: t('labelFoodCostPct'), value: foodCostPct, set: setFoodCostPct, step: 1 },
          { label: t('labelPackagingCost'), value: packagingCost, set: setPackagingCost, step: 0.1 },
          { label: t('labelLaborCost'), value: laborCost, set: setLaborCost, step: 0.1 },
          { label: t('labelDailyOrders'), value: dailyOrders, set: (v: number) => setDailyOrders(Math.round(v)), step: 1 },
        ].map((f) => (
          <div key={f.label}>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">{f.label}</label>
            <input type="number" step={f.step} value={f.value || ''} onChange={(e) => f.set(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20" />
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-base font-bold text-slate-900">{t('comparisonTitle')}</h3>
        <p className="mb-4 text-sm text-slate-500">{t('comparisonSubtitle')}</p>
        <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-400">
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
                <td className="px-3 py-3 text-right tabular-nums text-slate-900">{orderValue.toFixed(2)}₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-400">0.00₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-600">-{calc.dineInFoodCost.toFixed(2)}₼</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-600">-{laborCost.toFixed(2)}₼</td>
                <td className="px-4 py-3 text-right font-black tabular-nums text-emerald-600">{calc.dineInNet.toFixed(2)}₼</td>
              </tr>
              {calc.rows.map((row) => (
                <tr key={row.platform} className="bg-white">
                  <td className="px-4 py-3 font-semibold text-slate-900">{PLATFORM_LABELS[row.platform]}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-900">{orderValue.toFixed(2)}₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-red-600">-{row.commission.toFixed(2)}₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">-{row.foodCost.toFixed(2)}₼</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">-{(packagingCost + laborCost).toFixed(2)}₼</td>
                  <td className={`px-4 py-3 text-right font-black tabular-nums ${row.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{row.net.toFixed(2)}₼</td>
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
              <div className="text-xs text-slate-500">{dailyOrders} {t('ordersPerDay')} × {monthlyDays} {t('days')}</div>
              <div className="mt-3 text-2xl font-black tabular-nums text-slate-900">{row.monthlyNet.toFixed(0)}₼</div>
              <div className={`mt-1 text-xs font-semibold ${row.monthlyNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t('monthlyNetLabel')}</div>
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
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statOrderValue')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{orderValue.toFixed(2)}₼</div>
      </div>
      <div className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statCommission')}</div>
        <div className="mt-1 text-3xl font-black text-orange-600">{commissionPct}%</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statFoodCost')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{foodCostPct}%</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statMonthlyOrders')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{dailyOrders * monthlyDays}</div>
      </div>

      {/* Delivery math explanation */}
      <div className="border-t border-slate-100 pt-4">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck size={16} className="text-orange-600" />
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
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-600">{i + 1}</div>
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
              <span className="mr-1.5 font-bold text-orange-600">{i + 1}.</span>{q}
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
          <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50">
            {t('ocaqCta')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5"><BookOpen size={18} className="text-orange-600" /><h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3></div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">{link.tag}</span>
              <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-600">{link.title}</h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-orange-600">{t('readLabel')} <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="delivery-calc" toolName={t('title')} toolDescription={t('subtitle')} tier="kalfa"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection} />
  );
}
