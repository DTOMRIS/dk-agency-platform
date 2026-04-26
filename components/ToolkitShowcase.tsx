'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight, BarChart3, Calculator, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const copyByLocale: Record<Locale, {
  badge: string;
  title: string;
  subtitle: string;
  tools: Array<{ title: string; desc: string; metrics: string[]; href: string; color: string; colorBg: string; colorText: string; icon: typeof BarChart3 }>;
  cta: string;
  illustrationAlt: string;
}> = {
  az: {
    badge: 'Pulsuz Toolkit',
    title: 'Food cost, P&L və menyu qərarları eyni yerdə',
    subtitle: 'Restoran sahibi üçün ən vacib rəqəmləri sadə alətlərlə ölç, sonra qərarı daha rahat ver.',
    cta: 'Pulsuz istifadə et',
    illustrationAlt: 'Menyu mühəndisliyi illüstrasiyası',
    tools: [
      { icon: BarChart3, title: 'P&L Hesablama', desc: 'Gəlir, food cost, labor cost və overhead daxil et — net mənfəət avtomatik hesablansın.', color: 'var(--dk-red)', colorBg: 'bg-red-50', colorText: 'text-red-500', metrics: ['Net mənfəət %', 'Prime cost', 'Trend analiz'], href: '/toolkit/pnl' },
      { icon: Calculator, title: 'Food Cost Kalkulyatoru', desc: 'Resept kartı yarat, miqdar və qiymət daxil et, porsiya maya dəyərini dərhal gör.', color: 'var(--dk-gold)', colorBg: 'bg-amber-50', colorText: 'text-amber-600', metrics: ['Porsiya maya', 'Trim loss', 'Hədəf qiymət'], href: '/toolkit/food-cost' },
      { icon: UtensilsCrossed, title: 'Menyu Matrisi', desc: 'Hər yeməyi Ulduz, At, Puzzle və İt kateqoriyasına ayır və menyunu data ilə idarə et.', color: 'var(--dk-purple)', colorBg: 'bg-purple-50', colorText: 'text-purple-600', metrics: ['Star analiz', 'CM hesab', 'Aksiyon planı'], href: '/toolkit/menu-matrix' },
    ],
  },
  ru: {
    badge: 'Бесплатный Toolkit',
    title: 'Food cost, P&L и решения по меню в одном месте',
    subtitle: 'Измеряй ключевые цифры ресторана простыми инструментами и принимай решения увереннее.',
    cta: 'Использовать бесплатно',
    illustrationAlt: 'Иллюстрация инженерии меню',
    tools: [
      { icon: BarChart3, title: 'P&L калькулятор', desc: 'Введи выручку, food cost, labor cost и overhead — чистая прибыль посчитается автоматически.', color: 'var(--dk-red)', colorBg: 'bg-red-50', colorText: 'text-red-500', metrics: ['Чистая прибыль %', 'Prime cost', 'Анализ тренда'], href: '/toolkit/pnl' },
      { icon: Calculator, title: 'Food Cost калькулятор', desc: 'Создай рецепт-карту, введи количество и цену и сразу увидишь себестоимость порции.', color: 'var(--dk-gold)', colorBg: 'bg-amber-50', colorText: 'text-amber-600', metrics: ['Себестоимость', 'Trim loss', 'Целевая цена'], href: '/toolkit/food-cost' },
      { icon: UtensilsCrossed, title: 'Матрица меню', desc: 'Раздели блюда на Ulduz, At, Puzzle и İt и управляй меню на основе данных.', color: 'var(--dk-purple)', colorBg: 'bg-purple-50', colorText: 'text-purple-600', metrics: ['Star-анализ', 'CM расчёт', 'План действий'], href: '/toolkit/menu-matrix' },
    ],
  },
  en: {
    badge: 'Free Toolkit',
    title: 'Food cost, P&L, and menu decisions in one place',
    subtitle: 'Measure the restaurant numbers that matter most and make decisions with more confidence.',
    cta: 'Use for free',
    illustrationAlt: 'Menu engineering illustration',
    tools: [
      { icon: BarChart3, title: 'P&L Calculator', desc: 'Enter revenue, food cost, labor cost, and overhead so net profit is calculated automatically.', color: 'var(--dk-red)', colorBg: 'bg-red-50', colorText: 'text-red-500', metrics: ['Net profit %', 'Prime cost', 'Trend analysis'], href: '/toolkit/pnl' },
      { icon: Calculator, title: 'Food Cost Calculator', desc: 'Build a recipe card, add quantity and price, and see portion cost instantly.', color: 'var(--dk-gold)', colorBg: 'bg-amber-50', colorText: 'text-amber-600', metrics: ['Portion cost', 'Trim loss', 'Target price'], href: '/toolkit/food-cost' },
      { icon: UtensilsCrossed, title: 'Menu Matrix', desc: 'Classify each dish as Ulduz, At, Puzzle, or İt and manage the menu with data.', color: 'var(--dk-purple)', colorBg: 'bg-purple-50', colorText: 'text-purple-600', metrics: ['Star analysis', 'CM math', 'Action plan'], href: '/toolkit/menu-matrix' },
    ],
  },
  tr: {
    badge: 'Ücretsiz Toolkit',
    title: 'Food cost, P&L ve menü kararları tek yerde',
    subtitle: 'Restoranın en kritik rakamlarını basit araçlarla ölç, sonra daha rahat karar ver.',
    cta: 'Ücretsiz kullan',
    illustrationAlt: 'Menü mühendisliği illüstrasyonu',
    tools: [
      { icon: BarChart3, title: 'P&L Hesaplama', desc: 'Gelir, food cost, labor cost ve overhead gir — net kâr otomatik hesaplansın.', color: 'var(--dk-red)', colorBg: 'bg-red-50', colorText: 'text-red-500', metrics: ['Net kâr %', 'Prime cost', 'Trend analiz'], href: '/toolkit/pnl' },
      { icon: Calculator, title: 'Food Cost Hesaplayıcı', desc: 'Reçete kartı oluştur, miktar ve fiyat gir, porsiyon maliyetini hemen gör.', color: 'var(--dk-gold)', colorBg: 'bg-amber-50', colorText: 'text-amber-600', metrics: ['Porsiyon maliyeti', 'Trim loss', 'Hedef fiyat'], href: '/toolkit/food-cost' },
      { icon: UtensilsCrossed, title: 'Menü Matrisi', desc: 'Her yemeği Ulduz, At, Puzzle ve İt kategorisine ayır ve menüyü veriyle yönet.', color: 'var(--dk-purple)', colorBg: 'bg-purple-50', colorText: 'text-purple-600', metrics: ['Star analiz', 'CM hesap', 'Aksiyon planı'], href: '/toolkit/menu-matrix' },
    ],
  },
};

export default function ToolkitShowcase() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];

  return (
    <section id="toolkit" className="bg-[color-mix(in_srgb,var(--dk-paper)_55%,white)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">{copy.badge}</div>
            <h2 className="mb-3 text-3xl font-display font-extrabold text-slate-900">{copy.title}</h2>
            <p className="max-w-2xl text-base text-slate-700">{copy.subtitle}</p>
          </div>
          <Image
            src="/images/menu-muhendisligi.png"
            width={200}
            height={150}
            alt={copy.illustrationAlt}
            loading="lazy"
            className="hidden flex-shrink-0 opacity-80 md:block"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {copy.tools.map((tool, index) => {
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

                <Link href={withLocale(locale, tool.href)} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tool.colorText} hover:underline`}>
                  {copy.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
