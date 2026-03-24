'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Stage {
  emoji: string;
  title: string;
  description: string;
  color: string;
  hoverBorder: string;
  link: string;
  count: string;
  countClass: string;
}

const stages: Stage[] = [
  {
    emoji: '\u{1F3D7}',
    title: 'Basla',
    description:
      'Restoran acmaq isteyirsen? Checklist, resmi isler, mekan secimi, menyu plani.',
    color: '#E94560',
    hoverBorder: 'hover:border-[#E94560]',
    link: '/toolkit/checklist',
    count: '8 beledci',
    countClass: 'text-red-500',
  },
  {
    emoji: '\u{1F4CA}',
    title: 'Boyut',
    description:
      'Movcud restoranini optimallasdur. P&L, food cost, menyu matrisi, AI destek.',
    color: '#C5A022',
    hoverBorder: 'hover:border-[#C5A022]',
    link: '/b2b-panel/toolkit',
    count: '6 alet',
    countClass: 'text-amber-600',
  },
  {
    emoji: '\u{1F504}',
    title: 'Devir & Satis',
    description:
      'Restoran devri, ekipman satisi, franchise, ortaq axtarisi.',
    color: '#8B5CF6',
    hoverBorder: 'hover:border-[#8B5CF6]',
    link: '/b2b-panel/ilanlarim',
    count: '4 kateqoriya',
    countClass: 'text-purple-600',
  },
];

export default function StageSelector() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left flex-1"
          >
            <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-3">
              Sen hansi merheledesen?
            </h2>
            <p className="text-base text-gray-500">
              Her merhele ucun pulsuz alet ve beledci.
            </p>
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
              className="hidden lg:block opacity-70 flex-shrink-0"
            />
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`block bg-white rounded-2xl border border-gray-200 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stage.hoverBorder}`}
              >
                <div className="text-3xl mb-4">{stage.emoji}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {stage.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {stage.description}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${stage.countClass}`}
                >
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
