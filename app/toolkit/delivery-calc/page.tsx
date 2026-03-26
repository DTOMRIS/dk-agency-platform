'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Lightbulb,
  RotateCcw,
  Truck,
} from 'lucide-react';

type PlatformKey = 'wolt' | 'bolt' | 'yango' | 'own';

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  wolt: 'Wolt',
  bolt: 'Bolt Food',
  yango: 'Yango',
  own: 'Öz delivery',
};

const PLATFORM_DEFAULTS: Record<PlatformKey, number> = {
  wolt: 30,
  bolt: 30,
  yango: 30,
  own: 10,
};

const DELIVERY_TIPS = [
  'Delivery üçün ayrıca menyu qur və daşınmada keyfiyyət itirən məhsulları çıxar.',
  'Delivery qiymətini dine-in menyusundan 10-20% yuxarı saxla.',
  'Combo və set menyu ilə orta sifariş dəyərini artır.',
  'Qablaşdırma ölçülərini standartlaşdır və toplu alış et.',
  'Promo kampaniyasında endirimi kimin qarşıladığını ayrıca hesabla.',
  'Platforma P&L-ni ümumi kassadan ayrıca izləməyə başla.',
  'Sadiq müştərini zamanla öz kanalına yönləndir: sayt, WhatsApp, call-center.',
];

const CONTRACT_QUESTIONS = [
  'Komissiya sabitdir, yoxsa promo və kateqoriyaya görə dəyişir?',
  'Endirim kampaniyasının hansı hissəsini restoran qarşılayır?',
  'Ödəniş dövrü və kəsinti tarixi nədir?',
  'Müqavilədən çıxış üçün cərimə və notice müddəti varmı?',
  'Delivery menyusunda ayrıca qiymət qoymaq mümkündürmü?',
  'Boost, reklam və görünürlük alətləri əlavə ödənişlidirmi?',
  'Refund və şikayət hallarında məsuliyyət necə bölünür?',
];

const BLOG_LINKS = [
  { title: 'Wolt / Bolt Komissiya Riyaziyyatı', href: '/blog/wolt-bolt-komissiyon', tag: 'Blog' },
  { title: 'P&L Simulyatoru', href: '/toolkit/pnl', tag: 'Alət' },
  { title: 'Food Cost Hesablayıcı', href: '/toolkit/food-cost', tag: 'Alət' },
];

export default function DeliveryCalcPage() {
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
      return {
        platform,
        commission,
        foodCost,
        net,
        monthlyNet: net * dailyOrders * monthlyDays,
      };
    });

    return { dineInFoodCost, dineInNet, rows };
  }, [commissionPct, dailyOrders, foodCostPct, laborCost, monthlyDays, orderValue, packagingCost, selectedPlatforms]);

  const resetAll = () => {
    setSelectedPlatforms(['wolt']);
    setOrderValue(30);
    setCommissionPct(30);
    setFoodCostPct(33);
    setPackagingCost(1.5);
    setLaborCost(3);
    setDailyOrders(20);
    setMonthlyDays(30);
  };

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute bottom-[-25%] left-[-10%] h-[360px] w-[360px] rounded-full bg-amber-500/10 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          <Link
            href="/toolkit"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="mb-5 text-4xl font-display font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
              Delivery
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Komissiya Kalkulyatoru
              </span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Bakıda aktiv olan Wolt, Bolt Food və Yango ssenarilərini öz delivery xətti ilə müqayisə et.
              Komissiya 30% və üstü olduqda real marjanın necə dəyişdiyini dərhal gör.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Sifariş dəyəri</div>
            <div className="text-3xl font-black text-slate-900">{orderValue.toFixed(2)}₼</div>
          </div>
          <div className="rounded-2xl bg-orange-50 p-5 ring-1 ring-orange-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Komissiya</div>
            <div className="text-3xl font-black text-orange-600">{commissionPct}%</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Food cost</div>
            <div className="text-3xl font-black text-slate-900">{foodCostPct}%</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Aylıq sifariş</div>
            <div className="text-3xl font-black text-slate-900">{dailyOrders * monthlyDays}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery kalkulyatoru</h2>
                <p className="text-sm text-slate-500">Platforma və xərc quruluşunu dəyiş, nəticəni dərhal gör.</p>
              </div>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-orange-600"
              >
                <RotateCcw size={13} />
                Sıfırla
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Platform seçimi
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
                    const active = selectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                          active
                            ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200/70'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${active ? 'text-orange-700' : 'text-slate-900'}`}>
                            {PLATFORM_LABELS[platform]}
                          </span>
                          <span
                            className={`h-5 w-5 rounded-md border ${
                              active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                            }`}
                          />
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Default komissiya: {PLATFORM_DEFAULTS[platform]}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Sifariş dəyəri (₼)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={orderValue}
                    onChange={(e) => setOrderValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Komissiya faizi (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Food cost faizi (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={foodCostPct}
                    onChange={(e) => setFoodCostPct(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Qablaşdırma xərci (₼)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">İşçi xərci (₼)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={laborCost}
                    onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Günlük sifariş sayı</label>
                  <input
                    type="number"
                    step="1"
                    value={dailyOrders}
                    onChange={(e) => setDailyOrders(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-base font-bold text-slate-900">Restoran satışı vs delivery</h2>
              <p className="text-sm text-slate-500">Eyni sifarişdən platforma üzrə nə qədər qalır.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3 text-left">Kanal</th>
                    <th className="px-4 py-3 text-right">Satış</th>
                    <th className="px-4 py-3 text-right">Komissiya</th>
                    <th className="px-4 py-3 text-right">Food cost</th>
                    <th className="px-4 py-3 text-right">Digər</th>
                    <th className="px-5 py-3 text-right">Xalis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="px-5 py-4 font-semibold text-slate-900">Restoran satış</td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-900">{orderValue.toFixed(2)}₼</td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-400">0.00₼</td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-600">-{calc.dineInFoodCost.toFixed(2)}₼</td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-600">-{laborCost.toFixed(2)}₼</td>
                    <td className="px-5 py-4 text-right font-black tabular-nums text-emerald-600">
                      {calc.dineInNet.toFixed(2)}₼
                    </td>
                  </tr>
                  {calc.rows.map((row) => (
                    <tr key={row.platform} className="bg-white">
                      <td className="px-5 py-4 font-semibold text-slate-900">{PLATFORM_LABELS[row.platform]}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-900">{orderValue.toFixed(2)}₼</td>
                      <td className="px-4 py-4 text-right tabular-nums text-red-600">-{row.commission.toFixed(2)}₼</td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-600">-{row.foodCost.toFixed(2)}₼</td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-600">
                        -{(packagingCost + laborCost).toFixed(2)}₼
                      </td>
                      <td className={`px-5 py-4 text-right font-black tabular-nums ${row.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {row.net.toFixed(2)}₼
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-base font-bold text-slate-900">Aylıq delivery P&amp;L</h2>
              <p className="text-sm text-slate-500">Sifariş sayı artdıqca aylıq netto nəticə necə dəyişir.</p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {calc.rows.map((row) => (
                <div key={row.platform} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-2 text-sm font-bold text-slate-900">{PLATFORM_LABELS[row.platform]}</div>
                  <div className="text-xs text-slate-500">
                    {dailyOrders} sifariş/gün × {monthlyDays} gün
                  </div>
                  <div className="mt-4 text-3xl font-black tabular-nums text-slate-900">
                    {row.monthlyNet.toFixed(0)}₼
                  </div>
                  <div className={`mt-2 text-xs font-semibold ${row.monthlyNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Aylıq netto nəticə
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Truck size={18} className="text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">Delivery riyaziyyatı</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Bakıda aktiv 3 xətt: Wolt, Bolt Food və Yango. Merchant komissiyası açıq sabit price-list kimi verilmir
              və müqaviləyə, promo paketinə, kateqoriyaya görə dəyişir. Buna görə kalkulyator manual faiz ilə işləyir.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">Mənfəətli etməyin 7 yolu</h2>
            </div>
            <div className="space-y-3">
              {DELIVERY_TIPS.map((tip, index) => (
                <div key={tip} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-black text-orange-600">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">Müqavilə bağlayarkən 7 sual</h2>
            </div>
            <div className="space-y-3">
              {CONTRACT_QUESTIONS.map((question, index) => (
                <div key={question} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="mr-2 font-bold text-orange-600">{index + 1}.</span>
                  {question}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-orange-300" />
                <h2 className="text-base font-bold text-orange-200">DK Agency məsləhəti</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                Delivery-ni “əlavə həcm” kimi yox, ayrıca unit economics xətti kimi idarə et. Qiymət, promo və qablaşdırma
                eyni cədvəldə görünməsə, yüksək satış belə aşağı mənfəət gətirə bilər.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 p-6 text-white shadow-xl shadow-orange-500/15">
            <div className="mb-3 flex items-center gap-2">
              <Truck size={18} />
              <h2 className="text-base font-bold">OCAQ Panel</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/85">
              Platforma üzrə ayrı P&amp;L, kampaniya təsiri, sifariş marjası və combo performansını field-by-field izləmək
              üçün delivery xəttini OCAQ workflow-a bağla.
            </p>
            <Link
              href="/auth/register"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50"
            >
              Panelə keç <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <BookOpen size={18} className="text-orange-600" />
            <h3 className="text-lg font-bold text-slate-900">Əlaqəli məzmun</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {BLOG_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">{link.tag}</span>
                <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-600">
                  {link.title}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-orange-600">
                  Bax <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
