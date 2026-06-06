'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight, Award, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const heroCopy: Record<
  Locale,
  {
    badge: string;
    title: [string, string, string];
    body: string;
    note: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ value: string; label: string }>;
    illustrationAlt: string;
  }
> = {
  az: {
    badge: 'Azərbaycanın ilk AI-dəstəkli HoReCa platforması',
    title: ['Restoranın niyə', 'pul itirdiyini', 'bilmirsən?'],
    body: 'Biz tapırıq, düzəldirik. Pulsuz alətlər, ekspert bilikləri və AI dəstəyi bir platformada.',
    note: 'Bu sektorda duz-çörək haqqını qoruyan sistem qururuq.',
    primaryCta: 'İndi başla',
    secondaryCta: 'Alətləri kəşf et',
    stats: [
      { value: 'BETA', label: 'Pilot proqram açıqdır' },
      { value: '10+', label: 'Pulsuz alət' },
      { value: 'AI', label: 'KAZAN dəstəyi' },
    ],
    illustrationAlt: 'DK Agency HoReCa idarəetmə illüstrasiyası',
  },
  ru: {
    badge: 'Первая AI-платформа для HoReCa в Азербайджане',
    title: ['Не понимаешь, почему', 'ресторан теряет', 'деньги?'],
    body: 'Мы находим причину и исправляем её. Бесплатные инструменты, экспертные знания и AI-поддержка в одной платформе.',
    note: 'Мы строим систему, которая защищает справедливый труд и ремесленную этику сектора.',
    primaryCta: 'Начать сейчас',
    secondaryCta: 'Изучить инструменты',
    stats: [
      { value: 'BETA', label: 'Открыта пилотная программа' },
      { value: '10+', label: 'Бесплатных инструментов' },
      { value: 'AI', label: 'Поддержка KAZAN' },
    ],
    illustrationAlt: 'Иллюстрация управления HoReCa от DK Agency',
  },
  en: {
    badge: "Azerbaijan's first AI-powered HoReCa platform",
    title: ['Not sure why your', 'restaurant is', 'losing money?'],
    body: 'We find the problem and fix it. Free tools, expert know-how, and AI support in one platform.',
    note: 'We are building a system that protects the craft and the earned bread of this sector.',
    primaryCta: 'Start now',
    secondaryCta: 'Explore tools',
    stats: [
      { value: 'BETA', label: 'Pilot program is open' },
      { value: '10+', label: 'Free tools' },
      { value: 'AI', label: 'KAZAN support' },
    ],
    illustrationAlt: 'DK Agency HoReCa operations illustration',
  },
  tr: {
    badge: "Azerbaycan'ın ilk AI destekli HoReCa platformu",
    title: ['Restoranının neden', 'para kaybettiğini', 'bilmiyor musun?'],
    body: 'Biz buluruz, düzeltiriz. Ücretsiz araçlar, uzman bilgisi ve AI desteği tek platformda.',
    note: 'Bu sektörde emeğin ve duz-çörək haqqının korunduğu bir sistem kuruyoruz.',
    primaryCta: 'Şimdi başla',
    secondaryCta: 'Araçları keşfet',
    stats: [
      { value: 'BETA', label: 'Pilot program açık' },
      { value: '10+', label: 'Ücretsiz araç' },
      { value: 'AI', label: 'KAZAN desteği' },
    ],
    illustrationAlt: 'DK Agency HoReCa yönetim illüstrasyonu',
  },
};

export default function Hero() {
  const locale = normalizeLocale(useLocale());
  const copy = heroCopy[locale];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--dk-night)_0%,var(--dk-navy)_55%,var(--dk-surface-deep)_100%)] pb-20 pt-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[70%] w-[70%] bg-[radial-gradient(ellipse_at_top_right,rgba(233,69,96,0.20)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-[50%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(197,160,34,0.10)_0%,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <Award size={14} className="text-[var(--dk-gold)]" />
              <span className="text-xs font-semibold text-[var(--dk-gold)]">{copy.badge}</span>
            </div>

            <h1
              className="mb-5 font-display font-extrabold leading-[1.06] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
            >
              {copy.title[0]}
              <br />
              <span className="text-[var(--dk-red)]">{copy.title[1]}</span>
              <br />
              {copy.title[2]}
            </h1>

            <p className="mb-2 max-w-lg text-lg leading-relaxed text-slate-300">{copy.body}</p>
            <p className="mb-8 text-sm italic text-[var(--dk-gold)]">{copy.note}</p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red)] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-shadow hover:shadow-xl"
              >
                {copy.primaryCta}
                <ArrowRight size={18} />
              </Link>
              <Link
                href={withLocale(locale, '/toolkit')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <Play size={16} fill="currentColor" />
                {copy.secondaryCta}
              </Link>
            </div>

            <div className="mt-12 flex gap-8">
              {copy.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-[var(--dk-gold)]">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <Image
              src="/images/dk-hero-illustration.png"
              alt={copy.illustrationAlt}
              width={720}
              height={520}
              priority
              className="ml-auto max-h-[400px] w-full object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
