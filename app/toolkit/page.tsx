'use client';

import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ClipboardList,
  HardHat,
  Palette,
  Shield,
  Target,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

type ToolCard = {
  title: string;
  desc: string;
  href: string;
  color: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

interface PageCopy {
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  imageAlt: string;
  startBadge: string;
  startHeading: string;
  startBody: string;
  growthBadge: string;
  growthHeading: string;
  growthBody: string;
  cta: string;
  startTools: Omit<ToolCard, 'icon' | 'color' | 'href'>[];
  growthTools: Omit<ToolCard, 'icon' | 'color' | 'href'>[];
}

const copy: Record<Locale, PageCopy> = {
  az: {
    badge: 'Pulsuz Alətlər',
    heroTitle: 'DK Agency Toolkit',
    heroSubtitle: 'Alətləri mərhələyə görə ayırdıq: əvvəl açılış sistemi qur, sonra rəqəmlə böyüt.',
    imageAlt: 'Restoran stok və sifariş axını',
    startBadge: 'BAŞLA',
    startHeading: 'Restoran Açırsan?',
    startBody:
      'Açılışdan əvvəl ən çox səhv sənəd, layihə, gigiyena və marka tərəfində olur. Bu 5 bələdçi əvvəlcə sistemi düzgün qurmaq üçündür.',
    growthBadge: 'BÖYÜT',
    growthHeading: 'Mövcud Restoranı Optimallaşdır',
    growthBody:
      'Buradakı 5 alət əməliyyat, marja, komanda və delivery performansını ölçmək üçündür. Məqsəd intuisiya ilə yox, rəqəmlə idarə etməkdir.',
    cta: 'Başla',
    startTools: [
      { title: 'Açılış Checklist', desc: 'Hüquqi işlər, məkan, menyu, komanda və marketinq addımlarını yoxla.' },
      { title: 'İnşaat Checklist', desc: 'İnşaatdan açılışa qədər fazalı iş planını və sahə qeydlərini izləyin.' },
      { title: 'AQTA Hazırlıq', desc: 'Gigiyena, sənədləşdirmə və cərimə risklərini bölmə-bölmə yoxla.' },
      { title: 'Markalaşma Guide', desc: 'Marka sözü, vizual kimlik və sosial media xəttini workbook ilə qur.' },
      { title: 'Başabaş Nöqtəsi', desc: 'Aylıq minimum satış, günlük müştəri sayı və təhlükəsizlik marjasını hesabla.' },
    ],
    growthTools: [
      { title: 'Food Cost Kalkulyator', desc: 'Porsiya maya dəyərini hesabla və ideal food cost faizinə görə qiymət qur.' },
      { title: 'P&L Simulyator', desc: 'Gəlir-xərc hesabatı yarat, prime cost və xalis mənfəəti nəzarətdə saxla.' },
      { title: 'Menyu Matrisi', desc: 'Yeməkləri Ulduz, At, Puzzle və İt kateqoriyalarına ayır.' },
      { title: 'İşçi Saxlama', desc: 'Turnover faizini, dəyişmə xərcini və illik kadr itkisini hesabla.' },
      { title: 'Delivery Kalkulyator', desc: 'Wolt, Bolt Food, Yango və öz delivery üçün komissiya marjasını hesabla.' },
    ],
  },
  tr: {
    badge: 'Ücretsiz Araçlar',
    heroTitle: 'DK Agency Toolkit',
    heroSubtitle: 'Araçları aşamaya göre ayırdık: önce açılış sistemini kur, sonra rakamlarla büyüt.',
    imageAlt: 'Restoran stok ve sipariş akışı',
    startBadge: 'BAŞLA',
    startHeading: 'Restoran Açıyor musun?',
    startBody:
      'Açılış öncesinde en çok hata belge, proje, hijyen ve marka tarafında yapılıyor. Bu 5 rehber önce sistemi doğru kurmak içindir.',
    growthBadge: 'BÜYÜT',
    growthHeading: 'Mevcut Restoranı Optimize Et',
    growthBody:
      'Bu 5 araç operasyon, marj, ekip ve delivery performansını ölçmek içindir. Amaç sezgiyle değil, rakamlarla yönetmektir.',
    cta: 'Başla',
    startTools: [
      { title: 'Açılış Checklist', desc: 'Hukuki işler, mekan, menü, ekip ve pazarlama adımlarını kontrol et.' },
      { title: 'İnşaat Checklist', desc: 'İnşaattan açılışa kadar aşamalı iş planını ve saha notlarını takip edin.' },
      { title: 'AQTA Hazırlık', desc: 'Hijyen, belgeleme ve ceza risklerini bölüm bölüm kontrol et.' },
      { title: 'Markalaşma Rehberi', desc: 'Marka sesi, görsel kimlik ve sosyal medya hattını workbook ile oluştur.' },
      { title: 'Başabaş Noktası', desc: 'Aylık minimum satış, günlük müşteri sayısı ve güvenlik marjını hesapla.' },
    ],
    growthTools: [
      { title: 'Food Cost Hesaplayıcı', desc: 'Porsiyon maliyetini hesapla ve ideal food cost yüzdesine göre fiyatlandır.' },
      { title: 'P&L Simülatörü', desc: 'Gelir-gider raporu oluştur, prime cost ve net kârı kontrol altında tut.' },
      { title: 'Menü Matrisi', desc: 'Yemekleri Yıldız, At, Bulmaca ve Köpek kategorilerine ayır.' },
      { title: 'Personel Tutma', desc: 'Turnover oranını, değişim maliyetini ve yıllık kayıpları hesapla.' },
      { title: 'Delivery Hesaplayıcı', desc: 'Wolt, Bolt Food, Yango ve kendi deliveryn için komisyon marjını hesapla.' },
    ],
  },
  en: {
    badge: 'Free Tools',
    heroTitle: 'DK Agency Toolkit',
    heroSubtitle: 'We divided the tools by stage: first build your launch system, then grow with data.',
    imageAlt: 'Restaurant stock and order flow',
    startBadge: 'LAUNCH',
    startHeading: 'Opening a Restaurant?',
    startBody:
      'Most mistakes before opening happen in documents, construction, hygiene, and branding. These 5 guides exist to build the right system first.',
    growthBadge: 'GROW',
    growthHeading: 'Optimise an Existing Restaurant',
    growthBody:
      'These 5 tools measure operational, margin, team, and delivery performance. The goal is to manage with data, not with intuition.',
    cta: 'Start',
    startTools: [
      { title: 'Opening Checklist', desc: 'Track legal, venue, menu, team, and marketing steps.' },
      { title: 'Construction Checklist', desc: 'Follow a phased work plan and site notes from build to opening.' },
      { title: 'AQTA Readiness', desc: 'Audit hygiene, documentation, and penalty risks section by section.' },
      { title: 'Branding Guide', desc: 'Build your brand voice, visual identity, and social media line with a workbook.' },
      { title: 'Break-Even Point', desc: 'Calculate minimum monthly sales, daily customer count, and safety margin.' },
    ],
    growthTools: [
      { title: 'Food Cost Calculator', desc: 'Calculate portion cost and price according to your ideal food cost percentage.' },
      { title: 'P&L Simulator', desc: 'Generate an income-expense report and keep prime cost and net profit in check.' },
      { title: 'Menu Matrix', desc: 'Classify dishes into Star, Ploughhouse, Puzzle, and Dog categories.' },
      { title: 'Staff Retention', desc: 'Calculate turnover rate, replacement cost, and annual talent loss.' },
      { title: 'Delivery Calculator', desc: 'Calculate commission margins for Wolt, Bolt Food, Yango, and your own delivery.' },
    ],
  },
  ru: {
    badge: 'Бесплатные инструменты',
    heroTitle: 'DK Agency Toolkit',
    heroSubtitle: 'Инструменты разделены по этапам: сначала выстроите систему запуска, затем растите с цифрами.',
    imageAlt: 'Поток запасов и заказов ресторана',
    startBadge: 'ЗАПУСК',
    startHeading: 'Открываете ресторан?',
    startBody:
      'Большинство ошибок до открытия происходит в документации, строительстве, гигиене и брендинге. Эти 5 руководств помогут сначала выстроить правильную систему.',
    growthBadge: 'РОСТ',
    growthHeading: 'Оптимизируйте действующий ресторан',
    growthBody:
      'Эти 5 инструментов предназначены для измерения операционных показателей, маржи, командной работы и эффективности доставки. Цель — управлять цифрами, а не интуицией.',
    cta: 'Начать',
    startTools: [
      { title: 'Чеклист открытия', desc: 'Проверьте юридические вопросы, помещение, меню, команду и маркетинг.' },
      { title: 'Строительный чеклист', desc: 'Следите за поэтапным планом работ и полевыми заметками от стройки до открытия.' },
      { title: 'Готовность к AQTA', desc: 'Проверьте гигиену, документацию и риски штрафов по разделам.' },
      { title: 'Руководство по брендингу', desc: 'Создайте голос бренда, визуальную идентичность и линию в соцсетях с воркбуком.' },
      { title: 'Точка безубыточности', desc: 'Рассчитайте минимальные ежемесячные продажи, ежедневное количество клиентов и запас прочности.' },
    ],
    growthTools: [
      { title: 'Калькулятор food cost', desc: 'Рассчитайте стоимость порции и установите цену по идеальному проценту food cost.' },
      { title: 'P&L симулятор', desc: 'Создайте отчёт доходов и расходов, держите prime cost и чистую прибыль под контролем.' },
      { title: 'Матрица меню', desc: 'Классифицируйте блюда на Звезду, Рабочую лошадку, Загадку и Собаку.' },
      { title: 'Удержание персонала', desc: 'Рассчитайте коэффициент текучести, стоимость замены и годовые потери кадров.' },
      { title: 'Калькулятор доставки', desc: 'Рассчитайте комиссионную маржу для Wolt, Bolt Food, Yango и собственной доставки.' },
    ],
  },
};

const START_TOOL_META: Array<{ href: string; color: string; icon: ComponentType<{ size?: number; className?: string }> }> = [
  { href: '/toolkit/checklist', icon: ClipboardList, color: 'bg-rose-500' },
  { href: '/toolkit/insaat-checklist', icon: HardHat, color: 'bg-orange-500' },
  { href: '/toolkit/aqta-checklist', icon: Shield, color: 'bg-red-500' },
  { href: '/toolkit/branding-guide', icon: Palette, color: 'bg-pink-500' },
  { href: '/toolkit/basabas', icon: Target, color: 'bg-amber-500' },
];

const GROWTH_TOOL_META: Array<{ href: string; color: string; icon: ComponentType<{ size?: number; className?: string }> }> = [
  { href: '/toolkit/food-cost', icon: Calculator, color: 'bg-emerald-500' },
  { href: '/toolkit/pnl', icon: BarChart3, color: 'bg-blue-500' },
  { href: '/toolkit/menu-matrix', icon: UtensilsCrossed, color: 'bg-purple-500' },
  { href: '/toolkit/staff-retention', icon: Users, color: 'bg-indigo-500' },
  { href: '/toolkit/delivery-calc', icon: Truck, color: 'bg-orange-500' },
];

function useLocaleFromPath(): Locale {
  const pathname = usePathname();
  const match = pathname?.match(/^\/(ru|en|tr)\//);
  return normalizeLocale(match?.[1]);
}

function ToolGrid({
  tools,
  meta,
  cta,
}: {
  tools: Omit<ToolCard, 'icon' | 'color' | 'href'>[];
  meta: Array<{ href: string; color: string; icon: ComponentType<{ size?: number; className?: string }> }>;
  cta: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => {
        const m = meta[index];
        const Icon = m.icon;
        return (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-red/20 hover:shadow-xl"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${m.color}`}>
              <Icon size={24} className="text-white" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-red">
              {tool.title}
            </h2>
            <p className="mb-4 text-sm text-slate-500">{tool.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-brand-red transition-all group-hover:gap-3">
              {cta} <ArrowRight size={16} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ToolkitPage() {
  const locale = useLocaleFromPath();
  const c = copy[locale];

  const baslaRef = useRef<HTMLElement | null>(null);
  const boyutRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stage = new URLSearchParams(window.location.search).get('stage');
    const target =
      stage === 'basla' ? baslaRef.current : stage === 'boyut' ? boyutRef.current : null;

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-20">
      <div className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="mb-6 inline-block rounded-full bg-brand-red px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {c.badge}
            </span>
            <h1 className="mb-6 text-4xl font-display font-black tracking-tighter text-slate-900 lg:text-6xl">
              {c.heroTitle}
            </h1>
            <p className="max-w-2xl text-xl text-slate-600">{c.heroSubtitle}</p>
          </div>
          <Image
            src="/images/stock-flow.png"
            alt={c.imageAlt}
            width={640}
            height={480}
            priority
            className="hidden max-h-[400px] w-full object-contain lg:block"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <section
          ref={baslaRef}
          className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
        >
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-600">
              {c.startBadge}
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900">{c.startHeading}</h2>
            <p className="mt-3 text-base leading-7 text-slate-500">{c.startBody}</p>
          </div>
          <ToolGrid tools={c.startTools} meta={START_TOOL_META} cta={c.cta} />
        </section>

        <section
          ref={boyutRef}
          className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
        >
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">
              {c.growthBadge}
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900">{c.growthHeading}</h2>
            <p className="mt-3 text-base leading-7 text-slate-500">{c.growthBody}</p>
          </div>
          <ToolGrid tools={c.growthTools} meta={GROWTH_TOOL_META} cta={c.cta} />
        </section>
      </div>
    </div>
  );
}
