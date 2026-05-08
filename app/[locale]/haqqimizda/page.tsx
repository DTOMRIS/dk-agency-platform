'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Flame, Shield, BarChart3, Store } from 'lucide-react';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const aboutCopy: Record<Locale, {
  back: string;
  title: string;
  lead: string;
  intro: string;
  whyTitle: string;
  why: string;
  promiseTitle: string;
  promiseKazan: string;
  promiseOcaq: string;
  promiseShedd: string;
  promiseMarketplace: string;
  storyTitle: string;
  story1: string;
  story2: string;
  story3: string;
  story4: string;
  closing: string;
}> = {
  az: {
    back: 'Ana səhifə',
    title: 'Haqqımızda',
    lead: 'HoReCa-da qazanmaq çətindir.',
    intro: 'Restoran sahibi səhər mətbəxdə, günorta kassada, axşam müştəri qarşısındadır. Marka franchise-ı doğru tərəfdaş axtarır, amma hər kəsin "ən yaxşı yer" dediyi yerlər həqiqətən ən yaxşı yerdir? Tədarükçü etibarlı müştəri istəyir, amma kim etibarlıdır? Hamısı bir-birini axtarır, amma heç kim bir-birini doğru yerdə tapmır.',
    whyTitle: 'DK Agency bu problemi həll etmək üçün quruldu.',
    why: 'Biz Azərbaycanın ilk AI dəstəkli HoReCa B2B platformasıyıq. Məqsədimiz sadədir: kiçik sahibkara böyüklərlə eyni alətləri vermək. Food cost analizi, P&L modelləşdirməsi, franchise tərəfdaş axtarışı, sektor məsləhəti — bunlar əvvəllər yalnız böyük zəncirlərin əlində idi. İndi sənin də əlindədir.',
    promiseTitle: 'Bizim vədimiz:',
    promiseKazan: 'sənin sənaye məsləhətçindir — food cost, qiymət strategiyası, əməliyyat qərarları',
    promiseOcaq: 'sənin idarə panelindir — bütün biznesin bir yerdə',
    promiseShedd: 'rəqəmsal sertifikatdır — partnerlərinə və müştərilərinə keyfiyyət təsdiqi',
    promiseMarketplace: 'marketplace-imizdir — biznes alqı-satqısı, franchise tərəfdaş axtarışı',
    storyTitle: 'Hekayəmiz',
    story1: 'DK Agency-ni 2010-da qurdum. Adım Doğan Tomris.',
    story2: '40 ildir HoReCa sektorundayam. Türkiyə, Azərbaycan, Rusiya, Gürcüstan — hər ölkədə işlərim oldu, hər mətbəxin öz dilini öyrəndim. Bu illər ərzində bir şey gördüm: texnologiya kiçik sahibkara çatmırdı.',
    story3: 'Bəziləri hələ də dəftərlə hesab tutur. Bəziləri Excel-i öyrənməyə vaxt tapmır, çünki səhər tezdən mətbəxə girir, gecə yarısı evə dönür. Onların problemi tənbəllik deyil — onlara doğru alət heç vaxt verilməyib.',
    story4: 'Böyük zəncirlərin POS sistemləri, AI məsləhətçiləri, peşəkar konsultantları var. Kiçik restoran sahibinin nə var? Bir telefon, bir not dəftəri, və 16 saatlıq iş günü.',
    closing: 'DK Agency həmin uçurumu bağlamaq üçün gəldi. Dəftərdən AI-yə bir körpü.',
  },
  ru: {
    back: 'Главная',
    title: 'О нас',
    lead: 'Зарабатывать в HoReCa — сложно.',
    intro: 'Владелец ресторана утром на кухне, днём за кассой, вечером перед гостем. Франчайзер ищет правильного партнёра — но действительно ли «лучшие места», о которых все говорят, лучшие? Поставщик ищет надёжного клиента — но кто надёжный? Все ищут друг друга, но никто не находит друг друга в правильном месте.',
    whyTitle: 'DK Agency создан для решения этой проблемы.',
    why: 'Мы — первая в Азербайджане AI-платформа B2B для HoReCa. Наша цель проста: дать малому предпринимателю те же инструменты, что и крупным сетям. Анализ food cost, моделирование P&L, поиск партнёра по франшизе, отраслевые консультации — раньше это было только у больших. Теперь это и у тебя.',
    promiseTitle: 'Наше обещание:',
    promiseKazan: 'твой отраслевой консультант: food cost, ценовая стратегия, операционные решения',
    promiseOcaq: 'твоя панель управления: весь бизнес в одном месте',
    promiseShedd: 'цифровой сертификат: подтверждение качества для партнёров и клиентов',
    promiseMarketplace: 'наш маркетплейс: купля-продажа бизнеса, поиск партнёров по франшизе',
    storyTitle: 'Наша история',
    story1: 'Я основал DK Agency в 2010 году. Меня зовут Доган Томрис.',
    story2: '40 лет я в секторе HoReCa. Турция, Азербайджан, Россия, Грузия — я работал в каждой стране, изучил язык каждой кухни. За эти годы я увидел одно: технологии не доходили до малого предпринимателя.',
    story3: 'Некоторые до сих пор ведут учёт в тетради. Некоторые не находят времени освоить Excel, потому что заходят на кухню рано утром и возвращаются домой за полночь. Их проблема не лень — им просто никто не дал правильный инструмент.',
    story4: 'У крупных сетей есть POS-системы, AI-консультанты, профессиональные эксперты. А что у владельца маленького ресторана? Телефон, блокнот и 16-часовой рабочий день.',
    closing: 'DK Agency пришёл, чтобы закрыть этот разрыв. Мост от тетради к AI.',
  },
  en: {
    back: 'Home',
    title: 'About Us',
    lead: 'Winning in HoReCa is hard.',
    intro: 'The restaurant owner is in the kitchen at dawn, at the register at noon, in front of the guest at night. A franchise brand looks for the right partner — but are the "best locations" everyone talks about really the best? A supplier wants a reliable customer — but who is reliable? Everyone is searching for each other, yet nobody finds each other in the right place.',
    whyTitle: 'DK Agency was built to solve this.',
    why: "We are Azerbaijan's first AI-powered HoReCa B2B platform. Our goal is simple: give small operators the same tools as the large chains. Food cost analysis, P&L modeling, franchise partner search, industry consulting — these used to belong only to the big players. Now they belong to you, too.",
    promiseTitle: 'What we offer:',
    promiseKazan: 'your industry consultant: food cost, pricing strategy, operational decisions',
    promiseOcaq: 'your control panel: your entire business in one place',
    promiseShedd: 'a digital certificate: proof of quality for your partners and customers',
    promiseMarketplace: 'our marketplace: business buying and selling, franchise partner search',
    storyTitle: 'Our story',
    story1: 'I founded DK Agency in 2010. My name is Doğan Tomris.',
    story2: "I've spent 40 years in the HoReCa sector. Turkey, Azerbaijan, Russia, Georgia — I worked in every one of them, learned the language of every kitchen. Over those years, I saw one thing clearly: technology wasn't reaching the small operator.",
    story3: "Some still keep their books in a notebook. Some never find time to learn Excel because they enter the kitchen at dawn and leave at midnight. Their problem isn't laziness — nobody ever gave them the right tool.",
    story4: 'Big chains have POS systems, AI consultants, professional advisors. What does the small restaurant owner have? A phone, a notebook, and a 16-hour workday.',
    closing: 'DK Agency is here to close that gap. A bridge from the notebook to AI.',
  },
  tr: {
    back: 'Ana sayfa',
    title: 'Hakkımızda',
    lead: "HoReCa'da kazanmak zordur.",
    intro: 'Restoran sahibi sabah mutfakta, öğlen kasada, akşam müşterinin karşısında. Marka franchise doğru ortağı arar — ama herkesin "en iyi lokasyon" dediği yerler gerçekten en iyi mi? Tedarikçi güvenilir müşteri ister — ama kim güvenilir? Herkes birbirini arıyor, ama kimse birbirini doğru yerde bulamıyor.',
    whyTitle: 'DK Agency bu sorunu çözmek için kuruldu.',
    why: "Azerbaycan'ın ilk AI destekli HoReCa B2B platformuyuz. Hedefimiz basit: küçük işletmeciye büyüklerle aynı araçları vermek. Food cost analizi, P&L modellemesi, franchise ortak arayışı, sektör danışmanlığı — bunlar eskiden sadece büyük zincirlerin elindeydi. Şimdi senin de elinde.",
    promiseTitle: 'Sözümüz:',
    promiseKazan: 'sektör danışmanın: food cost, fiyat stratejisi, operasyon kararları',
    promiseOcaq: 'yönetim panelin: tüm işin tek yerde',
    promiseShedd: 'dijital sertifikan: ortaklarına ve müşterilerine kalite kanıtı',
    promiseMarketplace: 'pazaryerimiz: işletme alım-satımı, franchise ortak arayışı',
    storyTitle: 'Hikayemiz',
    story1: "DK Agency'i 2010'da kurdum. Adım Doğan Tomris.",
    story2: "40 yıldır HoReCa sektöründeyim. Türkiye, Azerbaycan, Rusya, Gürcistan — her ülkede işim oldu, her mutfağın kendi dilini öğrendim. Bu yıllar içinde bir şey gördüm: teknoloji küçük işletmeciye ulaşmıyordu.",
    story3: 'Bazıları hâlâ deftere yazıyor. Bazıları Excel öğrenmeye vakit bulamıyor, çünkü mutfağa sabah erken girip eve gece yarısı dönüyor. Sorunları tembellik değil — onlara doğru alet hiç verilmedi.',
    story4: 'Büyük zincirlerin POS sistemleri, AI danışmanları, profesyonel uzmanları var. Küçük restoran sahibinin nesi var? Bir telefon, bir not defteri ve 16 saatlik iş günü.',
    closing: "DK Agency bu uçurumu kapatmak için geldi. Defterden AI'a bir köprü.",
  },
};

export default function HaqqimizaPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = aboutCopy[locale];

  return (
    <div className="bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={withLocale(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--dk-muted)] transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          {copy.back}
        </Link>

        <h1 className="mb-4 font-display text-4xl font-bold text-[var(--dk-navy)]">{copy.title}</h1>
        <p className="mb-8 text-xl font-semibold text-slate-700">{copy.lead}</p>
        <p className="mb-10 text-base leading-relaxed text-slate-600">{copy.intro}</p>

        <h2 className="mb-3 font-display text-2xl font-bold text-[var(--dk-navy)]">{copy.whyTitle}</h2>
        <p className="mb-10 text-base leading-relaxed text-slate-600">{copy.why}</p>

        <h3 className="mb-4 text-lg font-bold text-slate-800">{copy.promiseTitle}</h3>
        <ul className="mb-10 space-y-3">
          <li className="flex items-start gap-3">
            <Flame size={20} className="mt-0.5 flex-shrink-0 text-brand-red" />
            <span className="text-slate-600"><strong>KAZAN AI</strong> — {copy.promiseKazan}</span>
          </li>
          <li className="flex items-start gap-3">
            <BarChart3 size={20} className="mt-0.5 flex-shrink-0 text-brand-red" />
            <span className="text-slate-600"><strong>OCAQ</strong> — {copy.promiseOcaq}</span>
          </li>
          <li className="flex items-start gap-3">
            <Shield size={20} className="mt-0.5 flex-shrink-0 text-brand-red" />
            <span className="text-slate-600"><strong>ŞEDD</strong> — {copy.promiseShedd}</span>
          </li>
          <li className="flex items-start gap-3">
            <Store size={20} className="mt-0.5 flex-shrink-0 text-brand-red" />
            <span className="text-slate-600"><strong>Devir &amp; Satış</strong> — {copy.promiseMarketplace}</span>
          </li>
        </ul>

        <h2 className="mb-3 font-display text-2xl font-bold text-[var(--dk-navy)]">{copy.storyTitle}</h2>
        <div className="space-y-4 text-base leading-relaxed text-slate-600">
          <p>{copy.story1}</p>
          <p>{copy.story2}</p>
          <p>{copy.story3}</p>
          <p>{copy.story4}</p>
        </div>

        <p className="mt-10 text-xl font-bold text-[var(--dk-navy)]">{copy.closing}</p>
      </div>
    </div>
  );
}
