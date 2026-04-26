'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Calendar, ArrowRight, Tag, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { NEWS_ITEMS } from '@/components/constants';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const copyByLocale: Record<Locale, {
  badge: string;
  title: [string, string];
  cta: string;
  tagLabel: string;
  readMore: string;
  newsletterTitle: string;
  newsletterBody: string;
  emailPlaceholder: string;
  subscribe: string;
}> = {
  az: {
    badge: 'Xəbərlər & Blog',
    title: ['Sektordan ən son', 'yeniliklər'],
    cta: 'Bütün xəbərlər',
    tagLabel: 'AQTA, Gigiyena',
    readMore: 'Davamını oxu',
    newsletterTitle: 'Həftəlik bülleten',
    newsletterBody: 'Sektordakı ən son xəbərləri və analizləri birbaşa e-poçtunuza alın.',
    emailPlaceholder: 'E-poçt ünvanınız',
    subscribe: 'Abunə ol',
  },
  ru: {
    badge: 'Новости и блог',
    title: ['Последние', 'обновления сектора'],
    cta: 'Все новости',
    tagLabel: 'AQTA, Гигиена',
    readMore: 'Читать дальше',
    newsletterTitle: 'Еженедельный дайджест',
    newsletterBody: 'Получайте последние новости и аналитику сектора прямо на почту.',
    emailPlaceholder: 'Ваш e-mail',
    subscribe: 'Подписаться',
  },
  en: {
    badge: 'News & Blog',
    title: ['Latest', 'sector updates'],
    cta: 'All news',
    tagLabel: 'AQTA, Hygiene',
    readMore: 'Read more',
    newsletterTitle: 'Weekly digest',
    newsletterBody: 'Receive the latest sector news and analysis directly in your inbox.',
    emailPlaceholder: 'Your email',
    subscribe: 'Subscribe',
  },
  tr: {
    badge: 'Haberler & Blog',
    title: ['Sektörden en son', 'güncellemeler'],
    cta: 'Tüm haberler',
    tagLabel: 'AQTA, Hijyen',
    readMore: 'Devamını oku',
    newsletterTitle: 'Haftalık bülten',
    newsletterBody: 'Sektördeki son haberleri ve analizleri doğrudan e-posta kutuna al.',
    emailPlaceholder: 'E-posta adresin',
    subscribe: 'Abone ol',
  },
};

export default function NewsPreview() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];
  const featuredNews = NEWS_ITEMS[0];
  const sideNews = NEWS_ITEMS.slice(1);

  return (
    <section id="news" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-red sm:mb-6 sm:px-4"
            >
              {copy.badge}
            </motion.div>
            <h3 className="text-4xl font-display font-extrabold leading-[0.95] text-slate-900 sm:text-5xl lg:text-6xl">
              {copy.title[0]} <br />
              <span className="text-slate-400">{copy.title[1]}</span>
            </h3>
          </div>

          <Link
            href={withLocale(locale, '/haberler')}
            className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 sm:w-auto sm:px-8 sm:py-4"
          >
            {copy.cta}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <Link href={withLocale(locale, '/haberler')} className="group block cursor-pointer lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-slate-200/50 sm:mb-8 sm:rounded-[2.5rem]">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
                  <span className="rounded-full bg-brand-red px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-brand-red/20 sm:px-5 sm:py-2 sm:tracking-widest">
                    {featuredNews.category}
                  </span>
                </div>
                <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 sm:right-8 sm:top-8 sm:h-12 sm:w-12">
                  <Bookmark size={18} />
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:mb-6 sm:flex-row sm:items-center sm:gap-6 sm:text-xs sm:tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {featuredNews.date}
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-brand-red" />
                  {copy.tagLabel}
                </div>
              </div>

              <h4 className="mb-4 text-3xl font-display font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-brand-red sm:mb-6 sm:text-4xl">
                {featuredNews.title}
              </h4>
              <p className="mb-6 text-base font-medium leading-relaxed text-slate-500 sm:mb-8 sm:text-xl">
                {featuredNews.excerpt}
              </p>
              <div className="flex items-center gap-3 font-bold text-slate-900 transition-all group-hover:gap-5">
                {copy.readMore}
                <ArrowRight size={20} className="text-brand-red" />
              </div>
            </motion.div>
          </Link>

          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {sideNews.map((news, index) => (
              <Link key={news.id} href={withLocale(locale, '/haberler')} className="group block cursor-pointer">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-4 sm:gap-6 lg:gap-8">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-slate-200/50 sm:h-28 sm:w-28 sm:rounded-3xl">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-red sm:mb-3 sm:tracking-widest">
                        {news.category}
                      </span>
                      <h5 className="mb-2 line-clamp-2 text-base font-display font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-red sm:mb-3 sm:text-lg">
                        {news.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:tracking-wider">
                        <Calendar size={12} />
                        {news.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 sm:rounded-[2.5rem] sm:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-red/10 blur-3xl" />
              <h5 className="relative z-10 mb-4 text-xl font-display font-bold sm:text-2xl">{copy.newsletterTitle}</h5>
              <p className="relative z-10 mb-6 text-sm leading-relaxed text-slate-400 sm:mb-8">
                {copy.newsletterBody}
              </p>
              <div className="relative z-10 space-y-4">
                <input
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm backdrop-blur-sm transition-colors focus:border-brand-red focus:outline-none sm:px-5 sm:py-4"
                />
                <button className="w-full rounded-2xl bg-brand-red py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95 sm:py-4">
                  {copy.subscribe}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
