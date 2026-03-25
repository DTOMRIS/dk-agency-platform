'use client';

import Link from 'next/link';
import { Calculator, ClipboardList, BarChart3, ArrowRight, UtensilsCrossed, Target } from 'lucide-react';

const tools = [
  {
    title: 'Food Cost Hesablayıcı',
    desc: 'Porsiya maya dəyərini hesabla, ideal food cost faizini tap.',
    href: '/toolkit/food-cost',
    icon: Calculator,
    color: 'bg-emerald-500',
  },
  {
    title: 'P&L Simulyatoru',
    desc: 'Aylıq gəlir-xərc hesabatı yarat, başabaş nöqtəsini tap.',
    href: '/toolkit/pnl',
    icon: BarChart3,
    color: 'bg-blue-500',
  },
  {
    title: 'Restoran Açılış Checklist',
    desc: '43 maddəlik tam checklist — hüquqi, məkan, menyu, kadr, marketinq.',
    href: '/toolkit/checklist',
    icon: ClipboardList,
    color: 'bg-rose-500',
  },
  {
    title: 'Menyu Matrisi',
    desc: 'Yeməkləri Ulduz, At, Puzzle, İt kateqoriyalarına ayır — menyunu data ilə idarə et.',
    href: '/toolkit/menu-matrix',
    icon: UtensilsCrossed,
    color: 'bg-purple-500',
  },
  {
    title: 'Başabaş Nöqtəsi',
    desc: 'Aylıq minimum satış, günlük müştəri sayı və təhlükəsizlik marjası hesabla.',
    href: '/toolkit/basabas',
    icon: Target,
    color: 'bg-amber-500',
  },
];

export default function ToolkitPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="bg-slate-950 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block">
            Pulsuz Alətlər
          </span>
          <h1 className="text-4xl lg:text-6xl font-display font-black tracking-tighter mb-6">
            DK Agency Toolkit
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Restoranını idarə etmək üçün pulsuz alətlər. Food cost, P&L, checklist — hamısı bir yerdə.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-brand-red/20 transition-all"
            >
              <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                <tool.icon size={24} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-red transition-colors">
                {tool.title}
              </h2>
              <p className="text-sm text-slate-500 mb-4">{tool.desc}</p>
              <div className="flex items-center gap-2 text-brand-red text-sm font-bold group-hover:gap-3 transition-all">
                Başla <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
