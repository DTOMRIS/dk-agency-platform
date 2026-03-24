'use client';

import { motion } from 'framer-motion';
import { BarChart3, Calculator, UtensilsCrossed, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const tools = [
  {
    icon: BarChart3,
    title: 'P&L Hesablama',
    desc: 'Gəlir, food cost, labor cost, overhead daxil et — net mənfəət avtomatik. AZN dəstəyi, PDF export.',
    color: '#E94560',
    colorBg: 'bg-red-50',
    colorText: 'text-red-500',
    metrics: ['Net mənfəət %', 'Prime cost', 'Trend analiz'],
    href: '/b2b-panel/toolkit/pnl-simulator',
  },
  {
    icon: Calculator,
    title: 'Food Cost Kalkulyator',
    desc: 'Resept kartı yarat — ingrediyent, miqdar, qiymət. Trim loss dəstəyi ilə real food cost.',
    color: '#C5A022',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-600',
    metrics: ['Porsiya maya', 'Trim loss', 'Hədəf qiymət'],
    href: '/b2b-panel/toolkit/food-cost',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menyu Matrisi',
    desc: 'Hər yeməyi Ulduz/At/Puzzle/İt kateqoriyasına ayır. Hansını saxla, hansını öldür — data ilə.',
    color: '#8B5CF6',
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-600',
    metrics: ['Star analiz', 'CM hesab', 'Aksiyon planı'],
    href: '/b2b-panel/toolkit',
  },
];

export default function ToolkitShowcase() {
  return (
    <section id="toolkit" className="py-20 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center md:text-left flex-1">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
              Pulsuz Toolkit
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-3">
              Hər qram hesablansın, heç nə israf olmasın
            </h2>
            <p className="text-base text-gray-500 max-w-2xl">
              Bizim mədəniyyətdə çörək yerdə qalmaz. Bu alətlər hər qəpiyin hesabını tutur.
            </p>
          </div>
          <Image
            src="/menu-muhendisligi.png"
            width={200}
            height={150}
            alt="Menyu mühəndisliyi illüstrasiyası"
            loading="lazy"
            className="hidden md:block opacity-80 flex-shrink-0"
          />
        </div>

        {/* 3 Card Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl ${t.colorBg} flex items-center justify-center mb-5`}
                >
                  <Icon size={22} style={{ color: t.color }} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{t.desc}</p>

                {/* Metric badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {t.metrics.map((m) => (
                    <span
                      key={m}
                      className={`text-[11px] font-semibold ${t.colorText} ${t.colorBg} rounded-md px-2.5 py-1`}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={t.href}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${t.colorText} hover:underline`}
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
