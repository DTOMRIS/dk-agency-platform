'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Bot, Wrench, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CARDS = [
  {
    key: 'kazan' as const,
    icon: Bot,
    href: '/kazan-ai',
    gradient: 'from-violet-50 to-indigo-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    accentBorder: 'hover:border-violet-300',
  },
  {
    key: 'toolkit' as const,
    icon: Wrench,
    href: '/toolkit',
    gradient: 'from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accentBorder: 'hover:border-amber-300',
  },
  {
    key: 'ocaq' as const,
    icon: LayoutDashboard,
    href: '/uzvluk',
    gradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentBorder: 'hover:border-emerald-300',
  },
] as const;

export default function PlatformPillars() {
  const t = useTranslations('platformPillars');

  return (
    <section className="bg-[var(--dk-paper)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-3xl font-display font-black tracking-tight text-slate-900 sm:text-4xl">
            {t('sectionTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
            {t('sectionSubtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
              >
                <Link
                  href={card.href}
                  className={`group block rounded-3xl border border-slate-200 bg-gradient-to-br ${card.gradient} p-8 transition-all duration-300 ${card.accentBorder} hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1`}
                >
                  <div
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg}`}
                  >
                    <Icon className={`h-7 w-7 ${card.iconColor}`} />
                  </div>

                  <h3 className="text-2xl font-display font-black text-[var(--dk-navy)]">
                    {t(`${card.key}.title`)}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-slate-600">
                    {t(`${card.key}.subtitle`)}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {(['f1', 'f2', 'f3'] as const).map((fKey) => (
                      <li
                        key={fKey}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dk-gold)]" />
                        {t(`${card.key}.${fKey}`)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--dk-red)] transition-colors group-hover:text-rose-600">
                    {t(`${card.key}.cta`)}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
