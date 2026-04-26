'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const copyByLocale: Record<Locale, {
  title: string;
  subtitle: string;
  illustrationAlt: string;
  stages: Array<{ emoji: string; title: string; description: string; hoverBorder: string; link: string; count: string; countClass: string }>;
}> = {
  az: {
    title: 'Sən hansı mərhələdəsən?',
    subtitle: 'Hər mərhələ üçün uyğun alət və bələdçi seç.',
    illustrationAlt: 'Əməliyyat sistemi illüstrasiyası',
    stages: [
      { emoji: '🏗️', title: 'Başla', description: 'Restoran açmaq istəyirsən? Checklist, rəsmi işlər, məkan seçimi və açılış planı.', hoverBorder: 'hover:border-[var(--dk-red)]', link: '/toolkit?stage=basla', count: '5 bələdçi', countClass: 'text-red-500' },
      { emoji: '📊', title: 'Böyüt', description: 'Mövcud restoranını optimallaşdır. Food cost, P&L, menyu, delivery və komanda nəzarəti.', hoverBorder: 'hover:border-[var(--dk-gold)]', link: '/toolkit?stage=boyut', count: '5 alət', countClass: 'text-amber-600' },
      { emoji: '🔄', title: 'Devir & Satış', description: 'Restoran devri, ekipman satışı, franchise, ortaq və digər biznes keçid kateqoriyaları.', hoverBorder: 'hover:border-[var(--dk-purple)]', link: '/ilanlar', count: '7 kateqoriya', countClass: 'text-purple-600' },
    ],
  },
  ru: {
    title: 'На каком ты этапе?',
    subtitle: 'Выбери инструменты и гайды под свой текущий этап.',
    illustrationAlt: 'Иллюстрация операционной системы',
    stages: [
      { emoji: '🏗️', title: 'Запуск', description: 'Хочешь открыть ресторан? Чеклист, официальные процедуры, выбор локации и план открытия.', hoverBorder: 'hover:border-[var(--dk-red)]', link: '/toolkit?stage=basla', count: '5 гайдов', countClass: 'text-red-500' },
      { emoji: '📊', title: 'Рост', description: 'Оптимизируй действующий ресторан. Food cost, P&L, меню, delivery и контроль команды.', hoverBorder: 'hover:border-[var(--dk-gold)]', link: '/toolkit?stage=boyut', count: '5 инструментов', countClass: 'text-amber-600' },
      { emoji: '🔄', title: 'Продажа и передача', description: 'Передача ресторана, продажа оборудования, франшиза, партнёрство и другие сделки перехода бизнеса.', hoverBorder: 'hover:border-[var(--dk-purple)]', link: '/ilanlar', count: '7 категорий', countClass: 'text-purple-600' },
    ],
  },
  en: {
    title: 'Which stage are you in?',
    subtitle: 'Pick the right tools and guides for your current stage.',
    illustrationAlt: 'Operations system illustration',
    stages: [
      { emoji: '🏗️', title: 'Start', description: 'Opening a restaurant? Checklist, compliance, site choice, and launch planning.', hoverBorder: 'hover:border-[var(--dk-red)]', link: '/toolkit?stage=basla', count: '5 guides', countClass: 'text-red-500' },
      { emoji: '📊', title: 'Grow', description: 'Optimize your current restaurant. Food cost, P&L, menu, delivery, and team control.', hoverBorder: 'hover:border-[var(--dk-gold)]', link: '/toolkit?stage=boyut', count: '5 tools', countClass: 'text-amber-600' },
      { emoji: '🔄', title: 'Transfer & Sale', description: 'Restaurant transfer, equipment sale, franchise, partnership, and other business-transition categories.', hoverBorder: 'hover:border-[var(--dk-purple)]', link: '/ilanlar', count: '7 categories', countClass: 'text-purple-600' },
    ],
  },
  tr: {
    title: 'Hangi aşamadasın?',
    subtitle: 'Her aşama için doğru araç ve rehberi seç.',
    illustrationAlt: 'Operasyon sistemi illüstrasyonu',
    stages: [
      { emoji: '🏗️', title: 'Başla', description: 'Restoran açmak mı istiyorsun? Checklist, resmi işler, mekan seçimi ve açılış planı.', hoverBorder: 'hover:border-[var(--dk-red)]', link: '/toolkit?stage=basla', count: '5 rehber', countClass: 'text-red-500' },
      { emoji: '📊', title: 'Büyüt', description: 'Mevcut restoranını optimize et. Food cost, P&L, menü, delivery ve ekip kontrolü.', hoverBorder: 'hover:border-[var(--dk-gold)]', link: '/toolkit?stage=boyut', count: '5 araç', countClass: 'text-amber-600' },
      { emoji: '🔄', title: 'Devir & Satış', description: 'Restoran devri, ekipman satışı, franchise, ortaklık ve diğer iş geçiş kategorileri.', hoverBorder: 'hover:border-[var(--dk-purple)]', link: '/ilanlar', count: '7 kategori', countClass: 'text-purple-600' },
    ],
  },
};

export default function StageSelector() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];

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
              {copy.title}
            </h2>
            <p className="text-base text-gray-500">{copy.subtitle}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Image
              src="/images/operasyon-sistemi.png"
              width={180}
              height={140}
              alt={copy.illustrationAlt}
              loading="lazy"
              className="hidden flex-shrink-0 opacity-70 lg:block"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {copy.stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                href={withLocale(locale, stage.link)}
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
