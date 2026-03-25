'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Stage {
  emoji: string;
  title: string;
  description: string;
  hoverBorder: string;
  link: string;
  count: string;
  countClass: string;
}

const stages: Stage[] = [
  {
    emoji: '🏗',
    title: 'Başla',
    description:
      'Restoran açmaq istəyirsən? Checklist, rəsmi işlər, məkan seçimi, menyu planı.',
    hoverBorder: 'hover:border-[#E94560]',
    link: '/toolkit/checklist',
    count: '8 bələdçi',
    countClass: 'text-red-500',
  },
  {
    emoji: '📊',
    title: 'Böyüt',
    description:
      'Mövcud restoranını optimallaşdır. P&L, food cost, menyu matrisi, AI dəstək.',
    hoverBorder: 'hover:border-[#C5A022]',
    link: '/toolkit',
    count: '6 alət',
    countClass: 'text-amber-600',
  },
  {
    emoji: '🔄',
    title: 'Devir & Satış',
    description: 'Restoran devri, ekipman satışı, franchise, ortaq axtarışı.',
    hoverBorder: 'hover:border-[#8B5CF6]',
    link: '/ilanlar',
    count: '4 kateqoriya',
    countClass: 'text-purple-600',
  },
];

export default function StageSelector() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="mb-3 text-3xl font-display font-extrabold text-slate-900">
              Sən hansı mərhələdəsən?
            </h2>
            <p className="text-base text-gray-500">Hər mərhələ üçün pulsuz alət və bələdçi.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Image
              src="/operasyon-sistemi.png"
              width={180}
              height={140}
              alt="Əməliyyat sistemi illüstrasiyası"
              loading="lazy"
              className="hidden flex-shrink-0 opacity-70 lg:block"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                href={stage.link}
                className={`block rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stage.hoverBorder}`}
              >
                <div className="mb-4 text-3xl">{stage.emoji}</div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{stage.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-500">{stage.description}</p>
                <div className={`flex items-center gap-1 text-sm font-semibold ${stage.countClass}`}>
                  {stage.count} <ChevronRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
