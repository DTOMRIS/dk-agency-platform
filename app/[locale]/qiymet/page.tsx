'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, Crown, Flame, GraduationCap, MessageCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import PageBack from '@/components/inner/PageBack';
import { whatsappHref } from '@/lib/contact-channels';

/* ------------------------------------------------------------------ */
/*  Copy                                                               */
/* ------------------------------------------------------------------ */

type TierKey = 'sagird' | 'kalfa' | 'usta';

interface TierDef {
  key: TierKey;
  name: string;
  price: string;
  badge: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

interface PageCopy {
  title: string;
  subtitle: string;
  tiers: TierDef[];
  trust: string;
  contactTitle: string;
  contactBody: string;
  whatsapp: string;
  email: string;
}

// TASK-0534 (copy audit 10.10): this page named the wrong person («Dogan Ozbahceci»), sent WhatsApp to a wrong
// number (994503660619), had no Azerbaijani letters, Russian in Latin transliteration, and promised a
// «20 questions/day» KAZAN limit and «24 h» support that do not exist in the code. Rewritten; WhatsApp goes
// through the counting redirect (whatsappHref) to the one DK number.
const copy: Record<Locale, PageCopy> = {
  az: {
    title: 'Qiymət planları',
    subtitle: 'HoReCa sahəsində növbəti addım üçün sizə uyğun planı seçin.',
    tiers: [
      {
        key: 'sagird',
        name: 'Şagird',
        price: 'Pulsuz',
        badge: 'Başlanğıc',
        features: [
          '17 pulsuz toolkit aləti',
          'KAZAN AI məsləhətçisi',
          'Bloq və analitik məqalələr',
          'İctimai elan lövhəsi',
          'E-poçt bildirişləri',
        ],
        cta: 'Pulsuz başla',
      },
      {
        key: 'kalfa',
        name: 'Kalfa',
        price: 'Tezliklə',
        badge: 'Populyar',
        features: [
          'Şagird planının bütün imkanları',
          'KAZAN AI limitsiz',
          'Xəbər tərcüməsi (4 dil)',
          'Elanın vitrində önə çıxması',
          'Həftəlik sektor hesabatı',
          'Doğan Tomris ilə aylıq 1:1 görüş',
        ],
        cta: 'Danışıq üçün əlaqə',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Usta',
        price: 'Razılaşma ilə',
        badge: 'Premium',
        features: [
          'Kalfa planının bütün imkanları',
          'OCAQ paneli (tam idarəetmə)',
          'Brendinq üzrə fərdi rəhbərlik',
          'Aylıq maliyyə auditi',
          'Prioritet dəstək',
          'Açılış və obyekt devri üzrə konsaltinq',
          'Pilot tərəfdaş statusu',
        ],
        cta: 'Premium üçün əlaqə',
      },
    ],
    trust: 'Pilot tərəfdaş kimi qoşulan məkanlara xüsusi şərtlər tətbiq olunur.',
    contactTitle: 'Sualınız var?',
    contactBody: 'Sizə ən uyğun planı birlikdə müəyyənləşdirək.',
    whatsapp: 'WhatsApp-a yazın',
    email: 'E-poçt göndərin',
  },
  tr: {
    title: 'Fiyat planları',
    subtitle: 'HoReCa sektöründe bir sonraki adım için size uygun planı seçin.',
    tiers: [
      {
        key: 'sagird',
        name: 'Çırak',
        price: 'Ücretsiz',
        badge: 'Başlangıç',
        features: [
          '17 ücretsiz toolkit aracı',
          'KAZAN AI danışmanı',
          'Blog ve analiz makaleleri',
          'Herkese açık ilan panosu',
          'E-posta bildirimleri',
        ],
        cta: 'Ücretsiz başla',
      },
      {
        key: 'kalfa',
        name: 'Kalfa',
        price: 'Yakında',
        badge: 'Popüler',
        features: [
          'Çırak planının tüm özellikleri',
          'Sınırsız KAZAN AI',
          'Haber çevirisi (4 dil)',
          'İlanın vitrinde öne çıkması',
          'Haftalık sektör raporu',
          'Doğan Tomris ile aylık 1:1 görüşme',
        ],
        cta: 'Görüşmek için iletişim',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Usta',
        price: 'Görüşmeyle',
        badge: 'Premium',
        features: [
          'Kalfa planının tüm özellikleri',
          'OCAQ paneli (tam yönetim)',
          'Kişiye özel marka rehberliği',
          'Aylık mali denetim',
          'Öncelikli destek',
          'Açılış ve devir danışmanlığı',
          'Pilot ortak statüsü',
        ],
        cta: 'Premium için iletişim',
      },
    ],
    trust: 'Pilot ortak olarak katılan mekânlara özel koşullar uygulanır.',
    contactTitle: 'Sorunuz mu var?',
    contactBody: 'Size en uygun planı birlikte belirleyelim.',
    whatsapp: 'WhatsApp’tan yazın',
    email: 'E-posta gönderin',
  },
  en: {
    title: 'Pricing plans',
    subtitle: 'Choose the plan that fits your next step in hospitality.',
    tiers: [
      {
        key: 'sagird',
        name: 'Apprentice',
        price: 'Free',
        badge: 'Starter',
        features: [
          '17 free toolkit tools',
          'KAZAN AI consultant',
          'Blog and analysis articles',
          'Public listing board',
          'Email notifications',
        ],
        cta: 'Start free',
      },
      {
        key: 'kalfa',
        name: 'Journeyman',
        price: 'Coming soon',
        badge: 'Popular',
        features: [
          'Everything in Apprentice',
          'Unlimited KAZAN AI',
          'News translation (4 languages)',
          'Listing showcase priority',
          'Weekly sector report',
          'Monthly 1:1 with Doğan Tomris',
        ],
        cta: 'Contact for details',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Master',
        price: 'By agreement',
        badge: 'Premium',
        features: [
          'Everything in Journeyman',
          'OCAQ panel (full management)',
          'Personal branding guidance',
          'Monthly financial audit',
          'Priority support',
          'Opening and takeover consulting',
          'Pilot partner status',
        ],
        cta: 'Premium contact',
      },
    ],
    trust: 'Special terms apply to venues joining as pilot partners.',
    contactTitle: 'Questions?',
    contactBody: 'Let’s find the right plan together.',
    whatsapp: 'Message on WhatsApp',
    email: 'Send an email',
  },
  ru: {
    title: 'Тарифы',
    subtitle: 'Выберите подходящий план для следующего шага в HoReCa.',
    tiers: [
      {
        key: 'sagird',
        name: 'Ученик',
        price: 'Бесплатно',
        badge: 'Старт',
        features: [
          '17 бесплатных инструментов Toolkit',
          'Консультант KAZAN AI',
          'Блог и аналитические статьи',
          'Открытая доска объявлений',
          'Уведомления по e-mail',
        ],
        cta: 'Начать бесплатно',
      },
      {
        key: 'kalfa',
        name: 'Подмастерье',
        price: 'Скоро',
        badge: 'Популярный',
        features: [
          'Всё из плана «Ученик»',
          'KAZAN AI без лимита',
          'Перевод новостей (4 языка)',
          'Приоритет объявления на витрине',
          'Еженедельный отчёт по сектору',
          'Ежемесячная встреча 1:1 с Доганом Томрисом',
        ],
        cta: 'Связаться',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Мастер',
        price: 'По договорённости',
        badge: 'Премиум',
        features: [
          'Всё из плана «Подмастерье»',
          'Панель OCAQ (полное управление)',
          'Индивидуальное сопровождение по брендингу',
          'Ежемесячный финансовый аудит',
          'Приоритетная поддержка',
          'Консалтинг по открытию и передаче бизнеса',
          'Статус пилотного партнёра',
        ],
        cta: 'Связаться по «Премиум»',
      },
    ],
    trust: 'Для заведений, которые подключаются как пилотные партнёры, действуют особые условия.',
    contactTitle: 'Есть вопросы?',
    contactBody: 'Вместе подберём подходящий план.',
    whatsapp: 'Написать в WhatsApp',
    email: 'Отправить e-mail',
  },
};

/* ------------------------------------------------------------------ */
/*  Tier icon                                                          */
/* ------------------------------------------------------------------ */

function TierIcon({ tier }: { tier: TierKey }) {
  if (tier === 'sagird') return <GraduationCap className="h-7 w-7" />;
  if (tier === 'kalfa') return <Flame className="h-7 w-7" />;
  return <Crown className="h-7 w-7" />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const rawLocale = useLocale();
  const locale = normalizeLocale(rawLocale);
  const c = copy[locale];
  const wa = whatsappHref(
    locale === 'az'
      ? 'Salam Doğan bəy, qiymət planları haqqında məlumat almaq istəyirəm.'
      : locale === 'ru'
        ? 'Здравствуйте, Доган бей! Хочу узнать о тарифах.'
        : locale === 'tr'
          ? 'Merhaba Doğan Bey, fiyat planları hakkında bilgi almak istiyorum.'
          : 'Hello Doğan, I would like to learn about the pricing plans.',
  );

  return (
    <div className="bg-white pb-24 pt-12">
      <PageBack />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-[var(--dk-navy)] sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{c.subtitle}</p>
        </div>

        {/* Tier Grid */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
          {c.tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative flex flex-col rounded-[28px] border p-7 shadow-sm transition hover:shadow-lg ${
                tier.highlight
                  ? 'border-[var(--dk-red)] bg-gradient-to-b from-rose-50/60 to-white ring-1 ring-rose-200'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {tier.highlight ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-dk-red-strong px-4 py-1 text-xs font-bold text-white">
                  {tier.badge}
                </div>
              ) : null}

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                tier.key === 'usta' ? 'bg-amber-100 text-[var(--dk-gold)]' : tier.key === 'kalfa' ? 'bg-rose-100 text-[var(--dk-red)]' : 'bg-slate-100 text-slate-600'
              }`}>
                <TierIcon tier={tier.key} />
              </div>

              <h2 className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]">{tier.name}</h2>

              <div className="mt-2 text-3xl font-black text-[var(--dk-navy)]">
                {tier.price}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.key === 'sagird' ? '/uzvluk' : wa}
                target={tier.key === 'sagird' ? undefined : '_blank'}
                rel={tier.key === 'sagird' ? undefined : 'noreferrer'}
                className={`mt-8 block rounded-2xl px-5 py-3.5 text-center text-sm font-bold transition ${
                  tier.highlight
                    ? 'bg-dk-red-strong text-white hover:opacity-90'
                    : tier.key === 'usta'
                      ? 'bg-[var(--dk-navy)] text-white hover:opacity-90'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Trust */}
        <p className="mt-10 text-center text-sm text-slate-500">{c.trust}</p>

        {/* Contact CTA */}
        <div className="mx-auto mt-16 max-w-xl rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
          <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">{c.contactTitle}</h3>
          <p className="mt-3 text-sm text-slate-600">{c.contactBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              {c.whatsapp}
            </a>
            <a
              href="mailto:info@dkagency.com.tr"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {c.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
