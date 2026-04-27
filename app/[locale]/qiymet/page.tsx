'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, Crown, Flame, GraduationCap, MessageCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

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

const WHATSAPP_NUMBER = '994503660619';

const copy: Record<Locale, PageCopy> = {
  az: {
    title: 'Qiymet Planlari',
    subtitle: 'HoReCa sektorunda novbetiyi addimi atmaq ucun sizin ucun uygun plan secin.',
    tiers: [
      {
        key: 'sagird',
        name: 'Sagird',
        price: 'Pulsuz',
        badge: 'Baslangic',
        features: [
          '10 pulsuz toolkit aleti',
          'KAZAN AI danismani (limit: 20 sual/gun)',
          'Blog ve analiz meqaleleri',
          'Ictimai elan paneli',
          'Email xeberdarliq',
        ],
        cta: 'Pulsuz basla',
      },
      {
        key: 'kalfa',
        name: 'Kalfa',
        price: 'Tezlikle',
        badge: 'Populyar',
        features: [
          'Butun Sagird ozellik + ',
          'KAZAN AI limitsiz',
          'Xeber tercumesi (4 dil)',
          'Elan vitrin prioriteti',
          'Heftelik sektor hesabati',
          'Dogan Ozbahceci ile ayliq 1:1 gorusme',
        ],
        cta: 'Muzakire ucun elaqe',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Usta',
        price: 'Muzakire ucun',
        badge: 'Premium',
        features: [
          'Butun Kalfa ozellik + ',
          'OCAQ Panel (tam idareetme)',
          'Xususi branding rehberliyi',
          'Ayliq maliyye audit',
          'Prioritet detek (24 saat)',
          'Acilis / dovretme konsaltinqi',
          'Pilot terefdas statusu',
        ],
        cta: 'Premium elaqe',
      },
    ],
    trust: 'Pilot terefdas olaraq qosulan mekanlara xususi sertler tetbiq olunur.',
    contactTitle: 'Sualiniz var?',
    contactBody: 'Sizin ucun en uygun plani birlikde mueyyenlesdiirek.',
    whatsapp: 'WhatsApp ile yaz',
    email: 'Email gonder',
  },
  tr: {
    title: 'Fiyat Planlari',
    subtitle: 'HoReCa sektorunde bir sonraki adimi atmak icin size uygun plani secin.',
    tiers: [
      {
        key: 'sagird',
        name: 'Cirak',
        price: 'Ucretsiz',
        badge: 'Baslangic',
        features: [
          '10 ucretsiz toolkit araci',
          'KAZAN AI danismani (limit: 20 soru/gun)',
          'Blog ve analiz makaleleri',
          'Herkese acik ilan paneli',
          'Email bildirimi',
        ],
        cta: 'Ucretsiz basla',
      },
      {
        key: 'kalfa',
        name: 'Kalfa',
        price: 'Yakin zamanda',
        badge: 'Populer',
        features: [
          'Tum Cirak ozellikleri + ',
          'KAZAN AI limitsiz',
          'Haber cevirisi (4 dil)',
          'Ilan vitrin onceligi',
          'Haftalik sektor raporu',
          'Dogan Ozbahceci ile aylik 1:1 gorusme',
        ],
        cta: 'Iletisime gecin',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Usta',
        price: 'Gorusme icin',
        badge: 'Premium',
        features: [
          'Tum Kalfa ozellikleri + ',
          'OCAQ Panel (tam yonetim)',
          'Ozel marka rehberligi',
          'Aylik mali denetim',
          'Oncelikli destek (24 saat)',
          'Acilis / devir danismanligi',
          'Pilot ortak statusu',
        ],
        cta: 'Premium iletisim',
      },
    ],
    trust: 'Pilot ortak olarak katilan mekanlara ozel kosullar uygulanir.',
    contactTitle: 'Sorunuz mu var?',
    contactBody: 'Sizin icin en uygun plani birlikte belirleyelim.',
    whatsapp: 'WhatsApp ile yazin',
    email: 'Email gonderin',
  },
  en: {
    title: 'Pricing Plans',
    subtitle: 'Choose the right plan to take the next step in the HoReCa industry.',
    tiers: [
      {
        key: 'sagird',
        name: 'Apprentice',
        price: 'Free',
        badge: 'Starter',
        features: [
          '10 free toolkit tools',
          'KAZAN AI consultant (limit: 20 questions/day)',
          'Blog & analysis articles',
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
          'All Apprentice features + ',
          'Unlimited KAZAN AI',
          'News translation (4 languages)',
          'Listing showcase priority',
          'Weekly sector report',
          'Monthly 1:1 with Dogan Ozbahceci',
        ],
        cta: 'Contact for details',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Master',
        price: 'Contact us',
        badge: 'Premium',
        features: [
          'All Journeyman features + ',
          'OCAQ Panel (full management)',
          'Custom branding guidance',
          'Monthly financial audit',
          'Priority support (24h)',
          'Opening / takeover consulting',
          'Pilot partner status',
        ],
        cta: 'Premium contact',
      },
    ],
    trust: 'Special terms apply for venues joining as pilot partners.',
    contactTitle: 'Questions?',
    contactBody: 'Let us help you find the right plan together.',
    whatsapp: 'Message on WhatsApp',
    email: 'Send email',
  },
  ru: {
    title: 'Tarifi',
    subtitle: 'Vibierite podkhodyashiy plan dlya sleduyushego shaga v industrii HoReCa.',
    tiers: [
      {
        key: 'sagird',
        name: 'Uchenik',
        price: 'Besplatno',
        badge: 'Start',
        features: [
          '10 besplatnikh instrumentov',
          'KAZAN AI konsultant (limit: 20 voprosov/den)',
          'Blog i analiticheskie stati',
          'Publichnaya doska obyavleniy',
          'Email uvedomleniya',
        ],
        cta: 'Nachat besplatno',
      },
      {
        key: 'kalfa',
        name: 'Podmaster\'ye',
        price: 'Skoro',
        badge: 'Populyarno',
        features: [
          'Vse funktsii Uchenik + ',
          'KAZAN AI bez limitov',
          'Perevod novostey (4 yazika)',
          'Prioritet vitrini obyavleniy',
          'Yezhenedel\'niy otchyot',
          'Yezhemesyachnaya vstrecha 1:1 s Dogan Ozbahceci',
        ],
        cta: 'Svyazat\'sya',
        highlight: true,
      },
      {
        key: 'usta',
        name: 'Master',
        price: 'Po dogovorennosti',
        badge: 'Premium',
        features: [
          'Vse funktsii Podmaster\'ye + ',
          'OCAQ Panel (polnoye upravleniye)',
          'Individual\'niy brending',
          'Yezhemesyachniy finansoviy audit',
          'Prioritetnaya podderzhka (24ch)',
          'Konsalting po otkritiyam / peredacham',
          'Status pilotnoyo partnera',
        ],
        cta: 'Premium kontakt',
      },
    ],
    trust: 'Dlya zavedeniy, prisoyedinyayushikhsya kak pilot-partneri, deystvuyut osobiye usloviya.',
    contactTitle: 'Yest\' voprosi?',
    contactBody: 'Pomozhem vibrat\' podkhodyashiy plan vmeste.',
    whatsapp: 'Napisat\' v WhatsApp',
    email: 'Otpravit\' email',
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
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(locale === 'az' ? 'Salam, qiymet planlari haqqinda melumat almaq isteyirem.' : 'Hello, I would like to learn about pricing plans.')}`;

  return (
    <div className="bg-white pb-24 pt-12">
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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--dk-red)] px-4 py-1 text-xs font-bold text-white">
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
                    ? 'bg-[var(--dk-red)] text-white hover:opacity-90'
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
              href="mailto:info@dkagency.az"
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
