'use client';

import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import AdsPreview from '@/components/AdsPreview';
import { DoganNote, JoinCTA } from '@/components/CTASections';
import Hero from '@/components/Hero';
import NewsPreview from '@/components/NewsPreview';
import StageSelector from '@/components/StageSelector';
import ToolkitShowcase from '@/components/ToolkitShowcase';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const featuredBlogs = [
  {
    slug: '1-porsiya-food-cost-hesablama',
    category: 'Food Cost',
    title: '1 porsiya food cost necə hesablanır?',
    excerpt: 'Porsiya maya dəyəri, resept kartı və düzgün qiymət arasında əlaqəni sadə nümunə ilə izah edirik.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
  },
  {
    slug: 'menyu-muhendisliyi-satis',
    category: 'Menyu',
    title: 'Menyu mühəndisliyi ilə satışı necə artırmaq olar?',
    excerpt: 'Ulduz, At, Puzzle və İt matrisi ilə menyunu data ilə idarə etməyin əsasları.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80',
  },
];

const pageCopy: Record<Locale, {
  howItWorks: string;
  steps: Array<{ title: string; body: string; tone: string; marker: string }>;
  consultingAlt: string;
  blogTitle: string;
  blogSubtitle: string;
  viewAll: string;
  b2bBadge: string;
  b2bTitle: string;
  b2bBody: string;
  listingsCta: string;
  b2bCards: Array<{ title: string; desc: string; emoji: string }>;
}> = {
  az: {
    howItWorks: 'Necə işləyir?',
    steps: [
      { title: 'Pulsuz alətləri sına', body: 'Food cost, P&L, menyu matrisi — 10 pulsuz alət ilə restoranını analiz et.', tone: 'bg-red-50', marker: '1️⃣' },
      { title: 'Bilikləri öyrən', body: '10 ekspert yazısı və KAZAN AI danışmanı ilə HoReCa biliyini artır.', tone: 'bg-amber-50', marker: '2️⃣' },
      { title: 'OCAQ Panelə keç', body: 'Bütün alətlər bir yerdə, avtomatik hesabat və real-time nəzarət.', tone: 'bg-emerald-50', marker: '3️⃣' },
    ],
    consultingAlt: 'Restoran sahibi ilə biznes konsultasiyası',
    blogTitle: 'Bloq & Analizlər',
    blogSubtitle: 'Sektor peşəkarları üçün dərin analizlər və praktik bələdçilər.',
    viewAll: 'Hamısını gör',
    b2bBadge: 'B2B Ekosistem',
    b2bTitle: 'HORECA B2B Elanlar',
    b2bBody: 'Restoran devri, franchise, ortaq axtarışı, investisiya — bir platformada.',
    listingsCta: 'Bütün elanları gör',
    b2bCards: [
      { title: 'Restoran Devri', desc: 'İşlətmənizi devir edin və ya hazır restoran alın', emoji: '🍽️' },
      { title: 'Franchise', desc: 'Franchise verin və ya hazır brend ilə başlayın', emoji: '🤝' },
      { title: 'Ortaq Tapmaq', desc: 'Layihəniz üçün sərmayə və ya əməliyyat ortağı tapın', emoji: '👥' },
      { title: 'Yeni İnvestisiya', desc: 'Yatırımçı axtaran yeni layihələr', emoji: '📈' },
      { title: 'Obyekt İcarəsi', desc: 'HoReCa uyğun məkan kiralayın', emoji: '🏢' },
      { title: 'HORECA Ekipman', desc: 'Peşəkar avadanlıq alın və ya satın', emoji: '⚙️' },
    ],
  },
  ru: {
    howItWorks: 'Как это работает?',
    steps: [
      { title: 'Протестируй бесплатные инструменты', body: 'Food cost, P&L, матрица меню — проанализируй ресторан через 10 бесплатных инструментов.', tone: 'bg-red-50', marker: '1️⃣' },
      { title: 'Прокачай знания', body: 'Углуби экспертизу HoReCa через 10 материалов экспертов и консультанта KAZAN AI.', tone: 'bg-amber-50', marker: '2️⃣' },
      { title: 'Перейди в OCAQ Panel', body: 'Все инструменты в одном месте: автоматические отчёты и контроль в реальном времени.', tone: 'bg-emerald-50', marker: '3️⃣' },
    ],
    consultingAlt: 'Бизнес-консультация с владельцем ресторана',
    blogTitle: 'Блог и аналитика',
    blogSubtitle: 'Глубокая аналитика и практические гайды для профессионалов сектора.',
    viewAll: 'Смотреть всё',
    b2bBadge: 'B2B экосистема',
    b2bTitle: 'B2B-объявления HORECA',
    b2bBody: 'Передача ресторана, франшиза, поиск партнёра, инвестиции — в одной платформе.',
    listingsCta: 'Смотреть все объявления',
    b2bCards: [
      { title: 'Передача ресторана', desc: 'Передайте действующий объект или купите готовый ресторан', emoji: '🍽️' },
      { title: 'Франшиза', desc: 'Запустите франшизу или войдите в готовый бренд', emoji: '🤝' },
      { title: 'Поиск партнёра', desc: 'Найдите капитал или операционного партнёра для проекта', emoji: '👥' },
      { title: 'Новая инвестиция', desc: 'Новые проекты в поиске инвестора', emoji: '📈' },
      { title: 'Аренда помещения', desc: 'Арендуйте локацию, подходящую для HoReCa', emoji: '🏢' },
      { title: 'Оборудование HORECA', desc: 'Покупайте или продавайте профессиональное оборудование', emoji: '⚙️' },
    ],
  },
  en: {
    howItWorks: 'How it works',
    steps: [
      { title: 'Try the free tools', body: 'Analyze your restaurant with 10 free tools across food cost, P&L, and menu matrix.', tone: 'bg-red-50', marker: '1️⃣' },
      { title: 'Learn the knowledge', body: 'Level up your HoReCa knowledge with 10 expert articles and the KAZAN AI advisor.', tone: 'bg-amber-50', marker: '2️⃣' },
      { title: 'Move into OCAQ Panel', body: 'Keep every tool in one place with automated reporting and real-time control.', tone: 'bg-emerald-50', marker: '3️⃣' },
    ],
    consultingAlt: 'Business consulting with a restaurant owner',
    blogTitle: 'Blog & Analysis',
    blogSubtitle: 'Deep analysis and practical guides for industry operators.',
    viewAll: 'View all',
    b2bBadge: 'B2B Ecosystem',
    b2bTitle: 'HORECA B2B Listings',
    b2bBody: 'Restaurant transfer, franchise, partner search, and investment — all on one platform.',
    listingsCta: 'View all listings',
    b2bCards: [
      { title: 'Restaurant Transfer', desc: 'Transfer your operation or acquire a ready restaurant', emoji: '🍽️' },
      { title: 'Franchise', desc: 'Offer a franchise or launch with a ready brand', emoji: '🤝' },
      { title: 'Find a Partner', desc: 'Find capital or an operating partner for your project', emoji: '👥' },
      { title: 'New Investment', desc: 'New projects looking for investors', emoji: '📈' },
      { title: 'Venue Lease', desc: 'Lease a HoReCa-ready space', emoji: '🏢' },
      { title: 'HORECA Equipment', desc: 'Buy or sell professional equipment', emoji: '⚙️' },
    ],
  },
  tr: {
    howItWorks: 'Nasıl çalışır?',
    steps: [
      { title: 'Ücretsiz araçları dene', body: 'Food cost, P&L ve menü matrisi ile restoranını 10 ücretsiz araçla analiz et.', tone: 'bg-red-50', marker: '1️⃣' },
      { title: 'Bilgiyi öğren', body: '10 uzman yazısı ve KAZAN AI danışmanı ile HoReCa bilgisini büyüt.', tone: 'bg-amber-50', marker: '2️⃣' },
      { title: 'OCAQ Panel’e geç', body: 'Tüm araçlar tek yerde, otomatik rapor ve gerçek zamanlı kontrol.', tone: 'bg-emerald-50', marker: '3️⃣' },
    ],
    consultingAlt: 'Restoran sahibi ile iş danışmanlığı',
    blogTitle: 'Blog & Analizler',
    blogSubtitle: 'Sektör profesyonelleri için derin analizler ve pratik rehberler.',
    viewAll: 'Tümünü gör',
    b2bBadge: 'B2B Ekosistem',
    b2bTitle: 'HORECA B2B İlanlar',
    b2bBody: 'Restoran devri, franchise, ortak arayışı ve yatırım — tek platformda.',
    listingsCta: 'Tüm ilanları gör',
    b2bCards: [
      { title: 'Restoran Devri', desc: 'İşletmeni devret ya da hazır restoran satın al', emoji: '🍽️' },
      { title: 'Franchise', desc: 'Franchise ver ya da hazır markayla başla', emoji: '🤝' },
      { title: 'Ortak Bul', desc: 'Projen için sermaye veya operasyon ortağı bul', emoji: '👥' },
      { title: 'Yeni Yatırım', desc: 'Yatırımcı arayan yeni projeler', emoji: '📈' },
      { title: 'Mekan Kiralama', desc: 'HoReCa uyumlu mekan kirala', emoji: '🏢' },
      { title: 'HORECA Ekipman', desc: 'Profesyonel ekipman al veya sat', emoji: '⚙️' },
    ],
  },
};

export default function Home() {
  const locale = normalizeLocale(useLocale());
  const copy = pageCopy[locale];

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ToolkitShowcase />

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <h2 className="mb-12 text-3xl font-display font-black text-slate-900">{copy.howItWorks}</h2>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-1">
            {copy.steps.map((step) => (
              <div key={step.title}>
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.tone}`}>
                  <span className="text-2xl">{step.marker}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.body}</p>
              </div>
            ))}
          </div>
          <Image
            src="/images/consulting-meeting.png"
            alt={copy.consultingAlt}
            width={640}
            height={480}
            className="hidden max-h-[400px] w-full object-contain lg:block"
          />
        </div>
      </section>

      <DoganNote />
      <StageSelector />

      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
            <div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-slate-900 sm:text-4xl">
                {copy.blogTitle}
              </h2>
              <p className="mt-2 text-slate-500">{copy.blogSubtitle}</p>
            </div>
            <Link
              href={withLocale(locale, '/blog')}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-brand-red hover:bg-brand-red hover:text-white sm:w-auto sm:px-6"
            >
              {copy.viewAll} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {featuredBlogs.map((post) => (
              <Link key={post.slug} href={withLocale(locale, `/blog/${post.slug}`)} className="group block">
                <div className="mb-8 aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                  {post.category}
                </span>
                <h3 className="text-2xl font-display font-black leading-tight text-slate-900 transition-colors group-hover:text-brand-red sm:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-4 line-clamp-2 text-slate-500">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsPreview />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {copy.b2bBadge}
            </span>
            <h2 className="mt-4 text-3xl font-display font-black text-slate-900 sm:text-4xl">
              {copy.b2bTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
              {copy.b2bBody}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.b2bCards.map((item) => (
              <Link
                key={item.title}
                href={withLocale(locale, '/ilanlar')}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-[var(--dk-gold)] hover:shadow-lg"
              >
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-[var(--dk-red)]">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={withLocale(locale, '/ilanlar')}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-navy)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              {copy.listingsCta}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <AdsPreview />
      <JoinCTA />
    </div>
  );
}
