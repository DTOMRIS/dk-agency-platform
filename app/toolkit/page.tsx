'use client';

import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ClipboardList,
  HardHat,
  Palette,
  Shield,
  Target,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

type ToolCard = {
  title: string;
  desc: string;
  href: string;
  color: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const startTools: ToolCard[] = [
  {
    title: 'Açılış Checklist',
    desc: 'Hüquqi işlər, məkan, menyu, komanda və marketinq addımlarını yoxla.',
    href: '/toolkit/checklist',
    icon: ClipboardList,
    color: 'bg-rose-500',
  },
  {
    title: 'İnşaat Checklist',
    desc: 'İnşaatdan açılışa qədər fazalı iş planını və sahə qeydlərini izləyin.',
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
    title: 'Markalaşma Guide',
    desc: 'Marka sözü, vizual kimlik və sosial media xəttini workbook ilə qur.',
    href: '/toolkit/branding-guide',
    icon: Palette,
    color: 'bg-pink-500',
  },
  {
    title: 'Başabaş Nöqtəsi',
    desc: 'Aylıq minimum satış, günlük müştəri sayı və təhlükəsizlik marjasını hesabla.',
    href: '/toolkit/basabas',
    icon: Target,
    color: 'bg-amber-500',
  },
];

const growthTools: ToolCard[] = [
  {
    title: 'Food Cost Kalkulyator',
    desc: 'Porsiya maya dəyərini hesabla və ideal food cost faizinə görə qiymət qur.',
    href: '/toolkit/food-cost',
    icon: Calculator,
    color: 'bg-emerald-500',
  },
  {
    title: 'P&L Simulyator',
    desc: 'Gəlir-xərc hesabatı yarat, prime cost və xalis mənfəəti nəzarətdə saxla.',
    href: '/toolkit/pnl',
    icon: BarChart3,
    color: 'bg-blue-500',
  },
  {
    title: 'Menyu Matrisi',
    desc: 'Yeməkləri Ulduz, At, Puzzle və İt kateqoriyalarına ayır.',
    href: '/toolkit/menu-matrix',
    icon: UtensilsCrossed,
    color: 'bg-purple-500',
  },
  {
    title: 'İşçi Saxlama',
    desc: 'Turnover faizini, dəyişmə xərcini və illik kadr itkisini hesabla.',
    href: '/toolkit/staff-retention',
    icon: Users,
    color: 'bg-indigo-500',
  },
  {
    title: 'Delivery Kalkulyator',
    desc: 'Wolt, Bolt Food, Yango və öz delivery üçün komissiya marjasını hesabla.',
    href: '/toolkit/delivery-calc',
    icon: Truck,
    color: 'bg-orange-500',
  },
];

function ToolGrid({ tools }: { tools: ToolCard[] }) {
  return (
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
  );
}

export default function ToolkitPage() {
  const baslaRef = useRef<HTMLElement | null>(null);
  const boyutRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stage = new URLSearchParams(window.location.search).get('stage');
    const target = stage === 'basla' ? baslaRef.current : stage === 'boyut' ? boyutRef.current : null;

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-20">
      <div className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="mb-6 inline-block rounded-full bg-brand-red px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Pulsuz Alətlər
          </span>
          <h1 className="mb-6 text-4xl font-display font-black tracking-tighter lg:text-6xl">
            DK Agency Toolkit
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Alətləri mərhələyə görə ayırdıq: əvvəl açılış sistemi qur, sonra rəqəmlə böyüt.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-6xl space-y-10 px-4">
        <section ref={baslaRef} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-600">
              BAŞLA
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900">Restoran Açırsan?</h2>
            <p className="mt-3 text-base leading-7 text-slate-500">
              Açılışdan əvvəl ən çox səhv sənəd, layihə, gigiyena və marka tərəfində olur. Bu
              5 bələdçi əvvəlcə sistemi düzgün qurmaq üçündür.
            </p>
          </div>
          <ToolGrid tools={startTools} />
        </section>

        <section ref={boyutRef} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">
              BÖYÜT
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900">Mövcud Restoranı Optimallaşdır</h2>
            <p className="mt-3 text-base leading-7 text-slate-500">
              Buradakı 5 alət əməliyyat, marja, komanda və delivery performansını ölçmək üçündür.
              Məqsəd intuisiya ilə yox, rəqəmlə idarə etməkdir.
            </p>
          </div>
          <ToolGrid tools={growthTools} />
        </section>
      </div>
    </div>
  );
}
