'use client';

import { motion } from 'framer-motion';
import { BarChart3, Calculator, UtensilsCrossed, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const tools = [
  {
    icon: BarChart3,
    title: 'P&L Hesablama',
    desc: 'Gəlir, food cost, labor cost, overhead daxil et — net mənfəət avtomatik hesablanır.',
    color: '#E94560',
    colorBg: 'bg-red-50',
    colorText: 'text-red-500',
    metrics: ['Net mənfəət %', 'Prime cost', 'Trend analiz'],
    href: '/toolkit/pnl',
  },
  {
    icon: Calculator,
    title: 'Food Cost Kalkulyatoru',
    desc: 'Resept kartı yarat, miqdar və qiymət daxil et, porsiya maya dəyərini dərhal gör.',
    color: '#C5A022',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-600',
    metrics: ['Porsiya maya', 'Trim loss', 'Hədəf qiymət'],
    href: '/toolkit/food-cost',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menyu Matrisi',
    desc: 'Hər yeməyi Ulduz, At, Puzzle, İt kateqoriyasına ayır və menyunu data ilə idarə et.',
    color: '#8B5CF6',
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-600',
    metrics: ['Star analiz', 'CM hesab', 'Aksiyon planı'],
    href: '/toolkit/menu-matrix',
  },
];

export default function ToolkitShowcase() {
  return (
    <section id="toolkit" className="bg-[#F9FAFB] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">
              Pulsuz Toolkit
            </div>
            <h2 className="mb-3 text-3xl font-display font-extrabold text-slate-900">
              Hər qram hesablansın, heç nə israf olmasın
            </h2>
            <p className="max-w-2xl text-base text-gray-500">
              Bizim mədəniyyətdə çörək yerdə qalmaz. Bu alətlər hər qəpiyin hesabını tutur.
            </p>
          </div>
          <Image
            src="/menu-muhendisligi.png"
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
                <p className="mb-5 text-sm leading-relaxed text-gray-500">{tool.desc}</p>

                <div className="mb-5 flex flex-wrap gap-1.5">
                  {tool.metrics.map((metric) => (
                    <span
                      key={metric}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${tool.colorText} ${tool.colorBg}`}
                    >
                      {metric}
                    </span>
                  ))}
                </div>

                <Link
                  href={tool.href}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tool.colorText} hover:underline`}
                >
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
