'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Calculator, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const tools = [
  {
    icon: BarChart3,
    title: 'P&L Hesablama',
    desc: 'Gəlir, food cost, labor cost və overhead daxil et — net mənfəət avtomatik hesablansın.',
    color: 'var(--dk-red)',
    colorBg: 'bg-red-50',
    colorText: 'text-red-500',
    metrics: ['Net mənfəət %', 'Prime cost', 'Trend analiz'],
    href: '/toolkit/pnl',
  },
  {
    icon: Calculator,
    title: 'Food Cost Kalkulyatoru',
    desc: 'Resept kartı yarat, miqdar və qiymət daxil et, porsiya maya dəyərini dərhal gör.',
    color: 'var(--dk-gold)',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-600',
    metrics: ['Porsiya maya', 'Trim loss', 'Hədəf qiymət'],
    href: '/toolkit/food-cost',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menyu Matrisi',
    desc: 'Hər yeməyi Ulduz, At, Puzzle və İt kateqoriyasına ayır və menyunu data ilə idarə et.',
    color: 'var(--dk-purple)',
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-600',
    metrics: ['Star analiz', 'CM hesab', 'Aksiyon planı'],
    href: '/toolkit/menu-matrix',
  },
];

export default function ToolkitShowcase() {
  return (
    <section id="toolkit" className="bg-[color-mix(in_srgb,var(--dk-paper)_55%,white)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">Pulsuz Toolkit</div>
            <h2 className="mb-3 text-3xl font-display font-extrabold text-slate-900">
              Food cost, P&amp;L və menyu qərarları eyni yerdə
            </h2>
            <p className="max-w-2xl text-base text-slate-700">
              Restoran sahibi üçün ən vacib rəqəmləri sadə alətlərlə ölç, sonra qərarı daha rahat ver.
            </p>
          </div>
          <Image
            src="/images/menu-muhendisligi.png"
            width={200}
            height={150}
            alt="Menyu mühəndisliyi illüstrasiyası"
            loading="lazy"
            className="hidden flex-shrink-0 opacity-80 md:block"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:shadow-lg"
              >
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${tool.colorBg}`}>
                  <Icon size={22} style={{ color: tool.color }} />
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900">{tool.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-slate-700">{tool.desc}</p>

                <div className="mb-5 flex flex-wrap gap-1.5">
                  {tool.metrics.map((metric) => (
                    <span key={metric} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${tool.colorText} ${tool.colorBg}`}>
                      {metric}
                    </span>
                  ))}
                </div>

                <Link href={tool.href} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tool.colorText} hover:underline`}>
                  Pulsuz istifadə et <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
