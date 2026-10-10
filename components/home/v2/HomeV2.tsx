/**
 * @file HomeV2.tsx
 * @purpose Homepage v2 body (client). Moved out of app/[locale]/page.tsx in TASK-0516 so the page
 *          can stay a server component and pass server-rendered parts in (admin «home-mid» AdSlot).
 * @task TASK-0512 · TASK-0516
 */

'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';

import dynamic from 'next/dynamic';
import { JoinCTA } from '@/components/CTASections';
import SiteJsonLd from '@/components/seo/SiteJsonLd';
import NewsPreview from '@/components/NewsPreview';
import HeroPhone from '@/components/home/v2/HeroPhone';
import FactsStrip from '@/components/home/v2/FactsStrip';
import EcoOrbit from '@/components/home/v2/EcoOrbit';
import ModuleTabs from '@/components/home/v2/ModuleTabs';
import StepsTimeline from '@/components/home/v2/StepsTimeline';
import QuickAccess from '@/components/home/v2/QuickAccess';
import B2BMarket from '@/components/home/v2/B2BMarket';
import BlogPicks from '@/components/home/v2/BlogPicks';
import { ReceiptHero } from '@/components/home/ReceiptHero';
import { DoganNote } from '@/components/home/DoganNote';

const AiReadinessScore = dynamic(() => import('@/components/sections/AiReadinessScore'), {
  ssr: false,
});
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<
  Locale,
  {
    consultingAlt: string;
    blogTitle: string;
    blogSubtitle: string;
    viewAll: string;
    b2bBadge: string;
    b2bTitle: string;
    b2bBody: string;
    listingsCta: string;
    b2bCards: Array<{ title: string; desc: string }>;
  }
> = {
  az: {
    consultingAlt: 'Restoran sahibi ilə biznes konsultasiyası',
    blogTitle: 'Bloq & Analizlər',
    blogSubtitle: 'Sektor peşəkarları üçün dərin analizlər və praktik bələdçilər.',
    viewAll: 'Hamısını gör',
    b2bBadge: 'B2B Ekosistem',
    b2bTitle: 'HORECA B2B Elanlar',
    b2bBody: 'Restoran devri, franchise, ortaq axtarışı, investisiya — bir platformada.',
    listingsCta: 'Bütün elanları gör',
    b2bCards: [
      {
        title: 'Restoran Devri',
        desc: 'İşlətmənizi devir edin və ya hazır restoran alın',
      },
      { title: 'Françayz', desc: 'Françayz verin və ya hazır brend ilə başlayın' },
      {
        title: 'Ortaq Tapmaq',
        desc: 'Layihəniz üçün sərmayə və ya əməliyyat ortağı tapın',
      },
      { title: 'Yeni İnvestisiya', desc: 'Yatırımçı axtaran yeni layihələr' },
      { title: 'Obyekt İcarəsi', desc: 'HoReCa uyğun məkan kiralayın' },
      { title: 'HORECA Ekipman', desc: 'Peşəkar avadanlıq alın və ya satın' },
    ],
  },
  ru: {
    consultingAlt: 'Бизнес-консультация с владельцем ресторана',
    blogTitle: 'Блог и аналитика',
    blogSubtitle: 'Глубокая аналитика и практические гайды для профессионалов сектора.',
    viewAll: 'Смотреть всё',
    b2bBadge: 'B2B экосистема',
    b2bTitle: 'B2B-объявления HORECA',
    b2bBody: 'Передача ресторана, франшиза, поиск партнёра, инвестиции — в одной платформе.',
    listingsCta: 'Смотреть все объявления',
    b2bCards: [
      {
        title: 'Передача ресторана',
        desc: 'Передайте действующий объект или купите готовый ресторан',
      },
      { title: 'Франшиза', desc: 'Запустите франшизу или войдите в готовый бренд' },
      {
        title: 'Поиск партнёра',
        desc: 'Найдите капитал или операционного партнёра для проекта',
      },
      { title: 'Новая инвестиция', desc: 'Новые проекты в поиске инвестора' },
      { title: 'Аренда помещения', desc: 'Арендуйте локацию, подходящую для HoReCa' },
      {
        title: 'Оборудование HORECA',
        desc: 'Покупайте или продавайте профессиональное оборудование',
      },
    ],
  },
  en: {
    consultingAlt: 'Business consulting with a restaurant owner',
    blogTitle: 'Blog & Analysis',
    blogSubtitle: 'Deep analysis and practical guides for industry operators.',
    viewAll: 'View all',
    b2bBadge: 'B2B Ecosystem',
    b2bTitle: 'HORECA B2B Listings',
    b2bBody:
      'Restaurant transfer, franchise, partner search, and investment — all on one platform.',
    listingsCta: 'View all listings',
    b2bCards: [
      {
        title: 'Restaurant Transfer',
        desc: 'Transfer your operation or acquire a ready restaurant',
      },
      { title: 'Franchise', desc: 'Offer a franchise or launch with a ready brand' },
      {
        title: 'Find a Partner',
        desc: 'Find capital or an operating partner for your project',
      },
      { title: 'New Investment', desc: 'New projects looking for investors' },
      { title: 'Venue Lease', desc: 'Lease a HoReCa-ready space' },
      { title: 'HORECA Equipment', desc: 'Buy or sell professional equipment' },
    ],
  },
  tr: {
    consultingAlt: 'Restoran sahibi ile iş danışmanlığı',
    blogTitle: 'Blog & Analizler',
    blogSubtitle: 'Sektör profesyonelleri için derin analizler ve pratik rehberler.',
    viewAll: 'Tümünü gör',
    b2bBadge: 'B2B Ekosistem',
    b2bTitle: 'HORECA B2B İlanlar',
    b2bBody: 'Restoran devri, franchise, ortak arayışı ve yatırım — tek platformda.',
    listingsCta: 'Tüm ilanları gör',
    b2bCards: [
      {
        title: 'Restoran Devri',
        desc: 'İşletmeni devret ya da hazır restoran satın al',
      },
      { title: 'Franchise', desc: 'Franchise ver ya da hazır markayla başla' },
      { title: 'Ortak Bul', desc: 'Projen için sermaye veya operasyon ortağı bul' },
      { title: 'Yeni Yatırım', desc: 'Yatırımcı arayan yeni projeler' },
      { title: 'Mekan Kiralama', desc: 'HoReCa uyumlu mekan kirala' },
      { title: 'HORECA Ekipman', desc: 'Profesyonel ekipman al veya sat' },
    ],
  },
};

export default function HomeV2({ adSlot }: { adSlot?: ReactNode }) {
  const locale = normalizeLocale(useLocale());
  const copy = pageCopy[locale];

  return (
    // overflow-x-clip (not hidden): `hidden` makes this div a scroll container and breaks the
    // sticky module tab bar (TASK-0512).
    <div className="min-h-screen bg-white overflow-x-clip">
      <SiteJsonLd />
      {/* TASK-0512 (owner feedback 2026-10-08): phone hero → own-numbers receipt → facts →
          sector news → B2B market → orbit → modules → steps → AI score → blog → quick access →
          join. Removed from `/` (files kept): ToolkitShowcase (duplicated ModuleTabs and the
          receipt's starter tools), StageSelector (duplicated the receipt segments + ModuleTabs),
          AdsPreview (GET /api/listings returns 0 approved listings → it only showed an empty
          state; the B2B market block carries «Elan ver»). */}
      <HeroPhone />
      <ReceiptHero />
      <FactsStrip />
      {/* TASK-0501: Sektor Nəbzi + elanlar (sahib istəyi) */}
      <NewsPreview />
      <B2BMarket
        copy={{
          badge: copy.b2bBadge,
          title: copy.b2bTitle,
          body: copy.b2bBody,
          listingsCta: copy.listingsCta,
          cards: copy.b2bCards,
        }}
      />
      {/* TASK-0516: dashboard/reklamlar «home-mid» — server AdSlot, renders nothing without an active ad. */}
      {adSlot}
      <EcoOrbit />
      <ModuleTabs />
      {/* The old inline «how it works» block is replaced by StepsTimeline; its consulting
          illustration now sits beside the steps heading. */}
      <StepsTimeline
        image={{
          src: '/images/consulting-meeting.png',
          alt: copy.consultingAlt,
          width: 1536,
          height: 1024,
        }}
      />
      {/* TASK-0516 (owner 2026-10-04): proof = founder photo + field since 1986 right after «necə işləyir»;
          customer numbers are not published. */}
      <DoganNote />
      <AiReadinessScore />
      <BlogPicks
        copy={{ title: copy.blogTitle, subtitle: copy.blogSubtitle, viewAll: copy.viewAll }}
      />
      <QuickAccess />
      <JoinCTA />
    </div>
  );
}
