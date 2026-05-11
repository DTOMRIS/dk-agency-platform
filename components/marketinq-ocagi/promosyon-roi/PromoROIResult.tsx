'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Shield } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface PnlRow { totalSales: number; foodCost: number; grossProfit: number; rent: number; royalty: number; adPool: number; serviceFee: number; promoCost: number; marketingSpend: number; SOI: number; SOIPercent: number }
interface WeeklyComp { salesUplift: number; salesUpliftPercent: number; tcUplift: number; tcUpliftPercent: number; avgTicketChange: number; avgTicketChangePercent: number; grossMarginChange: number }
interface Incremental { incrementalSales: number; incrementalGrossProfit: number; incrementalSOI: number; totalPromoInvestment: number; ROI: number; breakEvenIncrementalSales: number }
interface MonthlyProj { note: string; estimatedMonthlySalesUplift: number; estimatedMonthlySOIUplift: number; estimatedMonthlyROI: number; breakEvenWeeks: number }
interface AIInsight { verdict: string; keyFindings: string[]; risks: string[]; recommendations: string[]; ahilikQuote: string }

interface PromoROIResultData {
  weeklyComparison: WeeklyComp;
  pnl: { baseline: PnlRow; promo: PnlRow };
  incremental: Incremental;
  monthlyProjection: MonthlyProj;
  aiInsight: AIInsight;
}

const resultCopy: Record<Locale, {
  weekly: string; pnl: string; incremental: string; monthly: string; ai: string;
  baseline: string; promo: string; soi: string; roi: string;
  findings: string; risks: string; recs: string;
  redo: string; next: string;
  salesUp: string; tcUp: string; ticketChg: string; marginChg: string;
  breakEven: string; weeks: string;
}> = {
  az: { weekly: 'Həftəlik Müqayisə', pnl: 'P&L', incremental: 'İncremental Analiz', monthly: 'Aylıq Proyeksiya', ai: 'AI Yorumu',
    baseline: 'Baz', promo: 'Promo', soi: 'SOI', roi: 'ROI', findings: 'Tapıntılar', risks: 'Risklər', recs: 'Tövsiyələr',
    redo: 'Yenidən Hesabla', next: 'Növbəti Alət', salesUp: 'Satış artımı', tcUp: 'TC artımı', ticketChg: 'Ort. hesab dəyişimi', marginChg: 'Margin dəyişimi',
    breakEven: 'Başabaş', weeks: 'həftə' },
  en: { weekly: 'Weekly Comparison', pnl: 'P&L', incremental: 'Incremental Analysis', monthly: 'Monthly Projection', ai: 'AI Insight',
    baseline: 'Base', promo: 'Promo', soi: 'SOI', roi: 'ROI', findings: 'Findings', risks: 'Risks', recs: 'Recommendations',
    redo: 'Recalculate', next: 'Next Tool', salesUp: 'Sales uplift', tcUp: 'TC uplift', ticketChg: 'Avg ticket change', marginChg: 'Margin change',
    breakEven: 'Break-even', weeks: 'weeks' },
  tr: { weekly: 'Haftalık Karşılaştırma', pnl: 'P&L', incremental: 'Artımlı Analiz', monthly: 'Aylık Projeksiyon', ai: 'AI Yorumu',
    baseline: 'Baz', promo: 'Promo', soi: 'SOI', roi: 'ROI', findings: 'Bulgular', risks: 'Riskler', recs: 'Öneriler',
    redo: 'Tekrar Hesapla', next: 'Sonraki Araç', salesUp: 'Satış artışı', tcUp: 'TC artışı', ticketChg: 'Ort. hesap değişimi', marginChg: 'Marj değişimi',
    breakEven: 'Başabaş', weeks: 'hafta' },
  ru: { weekly: 'Еженедельное сравнение', pnl: 'P&L', incremental: 'Инкрементальный анализ', monthly: 'Месячная проекция', ai: 'AI Комментарий',
    baseline: 'Базовая', promo: 'Промо', soi: 'SOI', roi: 'ROI', findings: 'Находки', risks: 'Риски', recs: 'Рекомендации',
    redo: 'Пересчитать', next: 'Следующий', salesUp: 'Рост продаж', tcUp: 'Рост чеков', ticketChg: 'Изм. ср. чека', marginChg: 'Изм. маржи',
    breakEven: 'Безубыточность', weeks: 'недель' },
};

function Metric({ label, value, suffix, positive }: { label: string; value: string | number; suffix?: string; positive?: boolean | null }) {
  const color = positive === true ? 'text-green-600' : positive === false ? 'text-amber-600' : 'text-[var(--dk-navy)]';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}{suffix}</p>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const cfg = verdict === 'QAZANDIRDI' ? { bg: 'bg-green-100', text: 'text-green-700', icon: TrendingUp }
    : verdict === 'ZERER' ? { bg: 'bg-red-100', text: 'text-red-700', icon: TrendingDown }
    : { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Minus };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${cfg.bg} ${cfg.text}`}>
      <Icon size={16} />{verdict}
    </span>
  );
}

interface Props { result: PromoROIResultData; locale: Locale; onRedo: () => void }

export default function PromoROIResult({ result, locale, onRedo }: Props) {
  const t = resultCopy[locale];
  const { weeklyComparison: w, pnl, incremental: inc, monthlyProjection: mp, aiInsight: ai } = result;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <VerdictBadge verdict={ai.verdict} />
        <p className="mt-3 text-2xl font-bold text-[var(--dk-navy)]">{t.roi}: {inc.ROI}%</p>
      </div>

      {/* Weekly comparison */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.weekly}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label={t.salesUp} value={`${w.salesUpliftPercent > 0 ? '+' : ''}${w.salesUpliftPercent}%`} positive={w.salesUpliftPercent > 0} />
          <Metric label={t.tcUp} value={`${w.tcUpliftPercent > 0 ? '+' : ''}${w.tcUpliftPercent}%`} positive={w.tcUpliftPercent > 0} />
          <Metric label={t.ticketChg} value={`${w.avgTicketChangePercent > 0 ? '+' : ''}${w.avgTicketChangePercent}%`} positive={w.avgTicketChangePercent >= 0 ? true : false} />
          <Metric label={t.marginChg} value={`${w.grossMarginChange > 0 ? '+' : ''}${w.grossMarginChange}pp`} positive={w.grossMarginChange >= 0 ? true : false} />
        </div>
      </div>

      {/* P&L comparison */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.pnl}</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="font-semibold text-slate-500" />
          <div className="text-center font-bold text-slate-600">{t.baseline}</div>
          <div className="text-center font-bold text-[var(--dk-gold)]">{t.promo}</div>
          {[
            ['Satış', pnl.baseline.totalSales, pnl.promo.totalSales],
            ['Gross Profit', pnl.baseline.grossProfit, pnl.promo.grossProfit],
            ['Kira', pnl.baseline.rent, pnl.promo.rent],
            ['Promo xərci', pnl.baseline.promoCost, pnl.promo.promoCost],
            ['Marketinq', pnl.baseline.marketingSpend, pnl.promo.marketingSpend],
            [t.soi, pnl.baseline.SOI, pnl.promo.SOI],
          ].map(([label, base, promo]) => (
            <div key={String(label)} className="contents">
              <div className="py-1.5 font-medium text-slate-600">{label}</div>
              <div className="py-1.5 text-center text-slate-700">{Number(base).toLocaleString()} ₼</div>
              <div className={`py-1.5 text-center font-semibold ${Number(promo) >= Number(base) ? 'text-green-600' : 'text-amber-600'}`}>{Number(promo).toLocaleString()} ₼</div>
            </div>
          ))}
        </div>
      </div>

      {/* Incremental + Monthly */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{t.incremental}</h3>
          <div className="space-y-2 text-sm">
            <p>{t.salesUp}: <span className="font-bold">{inc.incrementalSales.toLocaleString()} ₼</span></p>
            <p>{t.soi} artım: <span className={`font-bold ${inc.incrementalSOI >= 0 ? 'text-green-600' : 'text-red-600'}`}>{inc.incrementalSOI.toLocaleString()} ₼</span></p>
            <p>{t.breakEven}: <span className="font-bold">{inc.breakEvenIncrementalSales.toLocaleString()} ₼</span></p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{t.monthly}</h3>
          <div className="space-y-2 text-sm">
            <p>{t.salesUp}: <span className="font-bold">{mp.estimatedMonthlySalesUplift.toLocaleString()} ₼</span></p>
            <p>{t.soi}: <span className="font-bold">{mp.estimatedMonthlySOIUplift.toLocaleString()} ₼</span></p>
            <p>{t.breakEven}: <span className="font-bold">{mp.breakEvenWeeks} {t.weeks}</span></p>
          </div>
          <p className="mt-3 text-[10px] italic text-slate-400">{mp.note}</p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.ai}</h3>
        {ai.keyFindings.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Lightbulb size={12} />{t.findings}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.keyFindings.map((f, i) => <li key={i}>• {f}</li>)}</ul>
          </div>
        )}
        {ai.risks.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600"><AlertTriangle size={12} />{t.risks}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.risks.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        )}
        {ai.recommendations.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-600"><Shield size={12} />{t.recs}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        )}
        <p className="mt-4 text-center text-xs italic text-slate-400">&ldquo;{ai.ahilikQuote}&rdquo; — Əhilik</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]">{t.redo}</button>
        <a href="/dashboard/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90">{t.next}</a>
      </div>
    </div>
  );
}
