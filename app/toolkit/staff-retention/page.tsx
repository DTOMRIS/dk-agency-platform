'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, Lightbulb, RotateCcw, Users } from 'lucide-react';

const TOP_REASONS = [
  'Pis rəhbərlik və kobud idarəetmə',
  'İnkişaf və yüksəliş imkanının olmaması',
  'Tanınmamaq və görünməz hiss etmək',
  'Maaş və tip sistemindən narazılıq',
  'İş-həyat balansının pozulması',
];

const STRATEGIES = [
  'Attitude-a görə işə götür, bacarığı sonra öyrət.',
  'İlk 2 həftə üçün onboarding, mentor və cross-training planı qur.',
  'Maaşdan əlavə staff meal, elastik qrafik və tanınma proqramı ver.',
  'Hər shift-dən əvvəl 10 dəqiqəlik pre-shift meeting et.',
  'Tip siyasətini yazılı və şəffaf paylaş.',
  'Karyera yolu və maaş pillələrini əvvəlcədən göstər.',
  'Hər çıxan işçi ilə exit interview aparıb nümunə axtar.',
];

const BLOG_LINKS = [
  { title: 'İşçi Saxlama 7 Strategiya', href: '/blog/isci-saxlama-7-strategiya', tag: 'Blog' },
  { title: 'P&L Simulyatoru', href: '/toolkit/pnl', tag: 'Alət' },
  { title: 'KAZAN AI', href: '/kazan-ai', tag: 'AI' },
];

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('az-AZ')} ₼`;
}

export default function StaffRetentionPage() {
  const [employeeCount, setEmployeeCount] = useState(18);
  const [averageSalary, setAverageSalary] = useState(850);
  const [yearlyLeavers, setYearlyLeavers] = useState(12);

  const stats = useMemo(() => {
    const safeEmployeeCount = Math.max(employeeCount, 1);
    const turnoverRate = (yearlyLeavers / safeEmployeeCount) * 100;
    const replacementCostLow = averageSalary * 2;
    const replacementCostHigh = averageSalary * 3;
    const replacementCostMid = averageSalary * 2.5;
    const annualLoss = yearlyLeavers * replacementCostMid;

    return {
      turnoverRate,
      replacementCostLow,
      replacementCostHigh,
      replacementCostMid,
      annualLoss,
    };
  }, [averageSalary, employeeCount, yearlyLeavers]);

  const resetAll = () => {
    setEmployeeCount(18);
    setAverageSalary(850);
    setYearlyLeavers(12);
  };

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[560px] w-[560px] rounded-full bg-indigo-500/10 blur-[110px]" />
          <div className="absolute bottom-[-25%] left-[-10%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[90px]" />
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
              İşçi Saxlama
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-sky-300 bg-clip-text text-transparent">
                Kalkulyatoru
              </span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Komandadakı axını rəqəmlə gör. Turnover faizini, 1 işçi dəyişmə xərcini və illik
              kadr itkisinin kassaya təsirini dərhal hesabla.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">İşçi sayı</div>
            <div className="text-3xl font-black text-slate-900">{employeeCount}</div>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Turnover rate</div>
            <div className="text-3xl font-black text-indigo-600">{stats.turnoverRate.toFixed(1)}%</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">1 işçi dəyişmə</div>
            <div className="text-3xl font-black text-slate-900">{formatCurrency(stats.replacementCostMid)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">İllik itki</div>
            <div className="text-3xl font-black text-slate-900">{formatCurrency(stats.annualLoss)}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Turnover hesablayıcısı</h2>
                <p className="text-sm text-slate-500">İşçi axınını maaş və komanda ölçüsünə görə hesabla.</p>
              </div>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-indigo-600"
              >
                <RotateCcw size={13} />
                Sıfırla
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">İşçi sayı</label>
                <input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Orta maaş (₼)</label>
                <input
                  type="number"
                  value={averageSalary}
                  onChange={(e) => setAverageSalary(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">İldə gedən işçi sayı</label>
                <input
                  type="number"
                  value={yearlyLeavers}
                  onChange={(e) => setYearlyLeavers(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Maliyyə təsiri</h3>
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Turnover rate</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{stats.turnoverRate.toFixed(1)}%</div>
                  <p className="mt-2 text-sm text-slate-500">
                    Dünya restoran ortalaması 60-80%-dir. Bakı bazarında bəzi yerlərdə bu rəqəm 100-150%-ə çıxır.
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                  <div className="text-xs text-slate-500">1 işçi dəyişmə xərci</div>
                  <div className="mt-1 text-2xl font-black text-indigo-700">
                    {formatCurrency(stats.replacementCostLow)} - {formatCurrency(stats.replacementCostHigh)}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Yazıdakı qaydaya görə 1 işçi dəyişməsi təxminən 2-3 aylıq maaşa bərabərdir.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-white">
                  <div className="text-xs uppercase tracking-widest text-slate-400">İllik itki</div>
                  <div className="mt-1 text-3xl font-black">{formatCurrency(stats.annualLoss)}</div>
                  <p className="mt-2 text-sm text-slate-300">
                    Bu rəqəmə təlim itkisi, səhv sifarişlər və xidmət keyfiyyəti düşüşü daxil deyil. Real zərər daha böyük olur.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">İcra planı</h3>
              <div className="space-y-3">
                {STRATEGIES.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-100 p-4">
                    <div className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">
                      Addım {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-indigo-600">
              <Users size={18} />
              <h3 className="text-base font-bold text-slate-900">Pre-shift meeting niyə işləyir?</h3>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              Hər shift-dən əvvəl 10 dəqiqəlik komanda görüşü sürprizi və stresi azaldır, VIP rezervasiyanı,
              günün xüsusi məhsulunu və dünənki problemi eyni dildə çatdırır. Bakı restoranlarında ən ucuz,
              amma ən yüksək ROI verən kadr alətlərindən biridir.
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
              Bilik paneli
            </div>
            <h2 className="text-xl font-black text-slate-900">Top 5 getmə səbəbi</h2>
            <div className="mt-4 space-y-3">
              {TOP_REASONS.map((reason) => (
                <div key={reason} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-indigo-300">
              <Lightbulb size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">DK məsləhəti</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Turnover 80%-dən yuxarıdırsa, problem maaşdan çox sistemdə olur. İşə qəbul, onboarding,
              pre-shift və exit interview bloklarını yazılı hala gətirmədən stabil komanda qurmaq çətindir.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <BookOpen size={16} />
              <h3 className="text-base font-bold">Faydalı keçidlər</h3>
            </div>
            <div className="space-y-3">
              {BLOG_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400">{item.tag}</div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
