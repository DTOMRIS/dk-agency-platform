'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

export default function PilotPartners() {
  const t = useTranslations('pilotPartners');

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dk-gold)]">
            {t('badge')}
          </span>
          <h2 className="mt-4 text-3xl font-display font-black text-slate-900 sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('comingSoon')}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
