'use client';

import Link from 'next/link';
import { BarChart3, Brain, MapPin, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const tools = [
  {
    title: 'Lokasiya Analizi',
    desc: '16 kriterlə məkanınızın uyğunluğunu qiymətləndirin. AI dəstəkli tövsiyələr.',
    href: '/dashboard/marketinq-ocagi/lokasyon-analiz',
    icon: MapPin,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'P&L Simulator',
    desc: 'Gəlir, xərc və mənfəət modelləşdirməsi. Real ssenariləri sınayın.',
    href: '/toolkit/pnl-simulator',
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Food Cost Kalkulyator',
    desc: 'Porsiya maya dəyəri, resept kartı və hədəf qiymət hesablayıcı.',
    href: '/toolkit/food-cost',
    icon: BarChart3,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Menyu Matrisi',
    desc: 'Ulduz, At, Puzzle, İt — menyunuzu data ilə idarə edin.',
    href: '/toolkit/menu-matrix',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function AnalizlerPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Sparkles size={20} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">AI Analizləri</h1>
        </div>
        <p className="text-sm text-slate-500">
          HoReCa biznesiniz üçün AI dəstəkli analiz alətləri. Hər alət real data ilə işləyir.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700">{tool.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{tool.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition">
                Başla <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
