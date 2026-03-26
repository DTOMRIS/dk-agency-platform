'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ClipboardList,
  HardHat,
  Shield,
  Target,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';

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
    desc: '43 maddəlik tam checklist: hüquqi, məkan, menyu, kadr və marketinq.',
    href: '/toolkit/checklist',
    icon: ClipboardList,
    color: 'bg-rose-500',
  },
  {
    title: 'Menyu Matrisi',
    desc: 'Yeməkləri Ulduz, At, Puzzle və İt kateqoriyalarına ayır.',
    href: '/toolkit/menu-matrix',
    icon: UtensilsCrossed,
    color: 'bg-purple-500',
  },
  {
    title: 'Başabaş Nöqtəsi',
    desc: 'Aylıq minimum satış, günlük müştəri sayı və təhlükəsizlik marjasını hesabla.',
    href: '/toolkit/basabas',
    icon: Target,
    color: 'bg-amber-500',
  },
  {
    title: 'İnşaatdan Açılışa',
    desc: '52 maddəlik fazalı checklist, foto-video progress qeydləri və real büdcə bölməsi.',
    href: '/toolkit/insaat-checklist',
    icon: HardHat,
    color: 'bg-orange-500',
  },
  {
    title: 'AQTA Hazırlıq',
    desc: 'Gigiyena, sənədləşdirmə və cərimə risklərini bölmə-bölmə yoxla.',
    href: '/toolkit/aqta-checklist',
    icon: Shield,
    color: 'bg-red-500',
  },
  {
    title: 'Delivery Kalkulyator',
    desc: 'Wolt, Bolt Food, Yango və öz delivery modeli üçün komissiya marjasını hesabla.',
    href: '/toolkit/delivery-calc',
    icon: Truck,
    color: 'bg-orange-500',
  },
];

export default function ToolkitPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="mb-6 inline-block rounded-full bg-brand-red px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Pulsuz Alətlər
          </span>
          <h1 className="mb-6 text-4xl font-display font-black tracking-tighter lg:text-6xl">
            DK Agency Toolkit
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Restoranını idarə etmək üçün pulsuz alətlər. Food cost, P&L, AQTA hazırlıq və checklistlər bir yerdədir.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-red/20 hover:shadow-xl"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tool.color}`}>
                <tool.icon size={24} className="text-white" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-red">
                {tool.title}
              </h2>
              <p className="mb-4 text-sm text-slate-500">{tool.desc}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-red transition-all group-hover:gap-3">
                Başla <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
