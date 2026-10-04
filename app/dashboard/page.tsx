/**
 * @file app/dashboard/page.tsx
 * @purpose OCAQ v2 command centre (TASK-0483) — clean light dashboard: decisions first, real charts.
 * Data: lib/dashboard/overview.ts (each source isolated). Locale from the URL (/ru/dashboard …).
 */

import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowRight, Check, Inbox } from 'lucide-react';
import { requireAdminPage } from '@/lib/auth/guards';
import { getDashboardOverview, type DecisionItem } from '@/lib/dashboard/overview';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/i18n/format';
import {
  AreaChart,
  BarChart,
  BigNumber,
  DashCard,
  RingChart,
} from '@/components/dashboard/ui/Charts';

const COPY: Record<
  Locale,
  {
    title: string;
    greeting: (n: number) => string;
    allClear: string;
    stale: (n: number) => string;
    last30: string;
    decisions: string;
    decisionsSub: string;
    kinds: Record<DecisionItem['kind'], string>;
    leads: string;
    leadsSub: string;
    leadsCaption: string;
    vsPrev: (p: number) => string;
    sources: string;
    sourceNames: Record<string, string>;
    users: string;
    usersSub: string;
    usersCaption: (n: number) => string;
    news: string;
    newsSub: string;
    newsCaption: string;
    newsAwaiting: (n: number) => string;
    newsQueue: (n: number) => string;
    listings: string;
    listingsLive: string;
    listingsPending: string;
    blog: string;
    blogCaption: string;
    quick: string;
    quickLinks: Array<{ label: string; href: string }>;
    noDb: string;
  }
> = {
  az: {
    title: 'İdarəetmə mərkəzi',
    greeting: (n) =>
      n > 0 ? `Sizdən ${n} qərar gözlənilir.` : 'Hər şey qaydasındadır — gözləyən qərar yoxdur.',
    allClear: 'Gözləyən qərar yoxdur.',
    stale: (n) => `${n} köhnə element (14 gündən çox) növbədən çıxarılıb — xəbər və elan siyahılarında baxın.`,
    last30: 'Son 30 gün',
    decisions: 'Qərar gözləyir',
    decisionsSub: 'Xəbər · elan · profil · françayz müraciəti',
    kinds: { news: 'Xəbər', listing: 'Elan', profile: 'Profil', lead: 'Müraciət' },
    leads: 'Müştəri müraciətləri',
    leadsSub: 'Əlaqə · françayz · KAZAN AI · elan',
    leadsCaption: 'Cəmi',
    vsPrev: (p) => `əvvəlki 30 gün: ${p}`,
    sources: 'Mənbəyə görə',
    sourceNames: {
      contact: 'Əlaqə / WhatsApp',
      franchise: 'Françayz',
      kazan: 'KAZAN AI',
      listing: 'Elan',
    },
    users: 'İstifadəçilər',
    usersSub: 'Qeydiyyat',
    usersCaption: (n) => `son 30 gündə +${n}`,
    news: 'Sektor Nəbzi',
    newsSub: 'Yayınlanan xəbərlər',
    newsCaption: 'son 30 gündə yayınlanıb',
    newsAwaiting: (n) => `${n} təsdiq gözləyir`,
    newsQueue: (n) => `${n} DeepSeek növbəsində`,
    listings: 'Elanlar',
    listingsLive: 'Vitrində',
    listingsPending: 'Yoxlamada',
    blog: 'Bloq',
    blogCaption: 'dərc olunmuş yazı',
    quick: 'Tez keçid',
    quickLinks: [
      { label: 'Yeni bloq yazısı', href: '/dashboard/blog/yeni' },
      { label: 'Xəbər əlavə et', href: '/dashboard/xeberler/yeni' },
      { label: 'Elanlar', href: '/dashboard/ilanlar' },
      { label: 'İstifadəçilər', href: '/dashboard/users' },
    ],
    noDb: 'Verilənlər bazası əlçatan deyil — göstəricilər boşdur.',
  },
  ru: {
    title: 'Центр управления',
    greeting: (n) => (n > 0 ? `Вас ждут ${n} решений.` : 'Всё в порядке — решений не ждёт ничего.'),
    allClear: 'Нет ожидающих решений.',
    stale: (n) => `${n} старых элементов (старше 14 дней) скрыты из очереди — смотрите в списках новостей и объявлений.`,
    last30: 'Последние 30 дней',
    decisions: 'Ждут решения',
    decisionsSub: 'Новости · объявления · профили · заявки франшизы',
    kinds: { news: 'Новость', listing: 'Объявление', profile: 'Профиль', lead: 'Заявка' },
    leads: 'Заявки клиентов',
    leadsSub: 'Контакты · франшиза · KAZAN AI · объявления',
    leadsCaption: 'Всего',
    vsPrev: (p) => `предыдущие 30 дней: ${p}`,
    sources: 'По источникам',
    sourceNames: {
      contact: 'Контакты / WhatsApp',
      franchise: 'Франшиза',
      kazan: 'KAZAN AI',
      listing: 'Объявления',
    },
    users: 'Пользователи',
    usersSub: 'Регистрации',
    usersCaption: (n) => `+${n} за 30 дней`,
    news: 'Пульс сектора',
    newsSub: 'Опубликованные новости',
    newsCaption: 'опубликовано за 30 дней',
    newsAwaiting: (n) => `${n} ждут утверждения`,
    newsQueue: (n) => `${n} в очереди DeepSeek`,
    listings: 'Объявления',
    listingsLive: 'На витрине',
    listingsPending: 'На проверке',
    blog: 'Блог',
    blogCaption: 'опубликованных статей',
    quick: 'Быстрые действия',
    quickLinks: [
      { label: 'Новая статья', href: '/dashboard/blog/yeni' },
      { label: 'Добавить новость', href: '/dashboard/xeberler/yeni' },
      { label: 'Объявления', href: '/dashboard/ilanlar' },
      { label: 'Пользователи', href: '/dashboard/users' },
    ],
    noDb: 'База данных недоступна — показатели пусты.',
  },
  en: {
    title: 'Control centre',
    greeting: (n) =>
      n > 0
        ? `${n} decisions are waiting for you.`
        : 'All clear — nothing is waiting for a decision.',
    allClear: 'Nothing is waiting.',
    stale: (n) => `${n} older items (14+ days) are kept out of the queue — see the news and listings lists.`,
    last30: 'Last 30 days',
    decisions: 'Waiting for you',
    decisionsSub: 'News · listings · profiles · franchise enquiries',
    kinds: { news: 'News', listing: 'Listing', profile: 'Profile', lead: 'Enquiry' },
    leads: 'Customer enquiries',
    leadsSub: 'Contact · franchise · KAZAN AI · listings',
    leadsCaption: 'Total',
    vsPrev: (p) => `previous 30 days: ${p}`,
    sources: 'By source',
    sourceNames: {
      contact: 'Contact / WhatsApp',
      franchise: 'Franchise',
      kazan: 'KAZAN AI',
      listing: 'Listings',
    },
    users: 'Users',
    usersSub: 'Sign-ups',
    usersCaption: (n) => `+${n} in 30 days`,
    news: 'Sector Pulse',
    newsSub: 'Published news',
    newsCaption: 'published in 30 days',
    newsAwaiting: (n) => `${n} awaiting approval`,
    newsQueue: (n) => `${n} in the DeepSeek queue`,
    listings: 'Listings',
    listingsLive: 'Live',
    listingsPending: 'In review',
    blog: 'Blog',
    blogCaption: 'published articles',
    quick: 'Quick actions',
    quickLinks: [
      { label: 'New article', href: '/dashboard/blog/yeni' },
      { label: 'Add news', href: '/dashboard/xeberler/yeni' },
      { label: 'Listings', href: '/dashboard/ilanlar' },
      { label: 'Users', href: '/dashboard/users' },
    ],
    noDb: 'Database unavailable — metrics are empty.',
  },
  tr: {
    title: 'Yönetim merkezi',
    greeting: (n) =>
      n > 0 ? `Sizi bekleyen ${n} karar var.` : 'Her şey yolunda — bekleyen karar yok.',
    allClear: 'Bekleyen karar yok.',
    stale: (n) => `${n} eski öğe (14 günden eski) kuyruktan çıkarıldı — haber ve ilan listelerinde bakın.`,
    last30: 'Son 30 gün',
    decisions: 'Karar bekliyor',
    decisionsSub: 'Haber · ilan · profil · franchise başvurusu',
    kinds: { news: 'Haber', listing: 'İlan', profile: 'Profil', lead: 'Başvuru' },
    leads: 'Müşteri başvuruları',
    leadsSub: 'İletişim · franchise · KAZAN AI · ilan',
    leadsCaption: 'Toplam',
    vsPrev: (p) => `önceki 30 gün: ${p}`,
    sources: 'Kaynağa göre',
    sourceNames: {
      contact: 'İletişim / WhatsApp',
      franchise: 'Franchise',
      kazan: 'KAZAN AI',
      listing: 'İlan',
    },
    users: 'Kullanıcılar',
    usersSub: 'Kayıtlar',
    usersCaption: (n) => `son 30 günde +${n}`,
    news: 'Sektör Nabzı',
    newsSub: 'Yayınlanan haberler',
    newsCaption: 'son 30 günde yayınlandı',
    newsAwaiting: (n) => `${n} onay bekliyor`,
    newsQueue: (n) => `${n} DeepSeek kuyruğunda`,
    listings: 'İlanlar',
    listingsLive: 'Vitrinde',
    listingsPending: 'İncelemede',
    blog: 'Blog',
    blogCaption: 'yayınlanmış yazı',
    quick: 'Hızlı işlemler',
    quickLinks: [
      { label: 'Yeni blog yazısı', href: '/dashboard/blog/yeni' },
      { label: 'Haber ekle', href: '/dashboard/xeberler/yeni' },
      { label: 'İlanlar', href: '/dashboard/ilanlar' },
      { label: 'Kullanıcılar', href: '/dashboard/users' },
    ],
    noDb: 'Veritabanı erişilemiyor — göstergeler boş.',
  },
};

const KIND_STYLE: Record<DecisionItem['kind'], string> = {
  news: 'bg-blue-50 text-blue-800',
  listing: 'bg-amber-50 text-amber-900',
  profile: 'bg-emerald-50 text-emerald-800',
  lead: 'bg-rose-50 text-rose-800',
};

const SOURCE_COLOR: Record<string, string> = {
  contact: '#0A7AFF',
  franchise: '#E11D48',
  kazan: '#7C3AED',
  listing: '#F59E0B',
};

function relTime(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  const diffH = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 3_600_000));
  const unit = { az: ['saat', 'gün'], ru: ['ч', 'дн'], en: ['h', 'd'], tr: ['saat', 'gün'] }[
    locale
  ];
  return diffH < 48 ? `${diffH} ${unit[0]}` : `${Math.round(diffH / 24)} ${unit[1]}`;
}

export default async function DashboardPage() {
  await requireAdminPage();
  const locale = normalizeLocale(await getLocale());
  const t = COPY[locale];
  const o = await getDashboardOverview(30);
  const fmt = (n: number) => formatNumber(n, locale);
  const leadDelta = o.leads.total - o.leads.previous;

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">
              {t.title}
            </h1>
            <p className="mt-1 text-[15px] text-slate-600">{t.greeting(o.decisions.length)}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 shadow-sm">
            {t.last30}
          </span>
        </div>

        {!o.dbAvailable && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[14px] text-amber-900">{t.noDb}</p>
        )}

        {/* Decisions first */}
        <DashCard title={t.decisions} subtitle={t.decisionsSub} range={String(o.decisions.length)}>
          {o.decisions.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-4 text-[15px] font-medium text-emerald-800">
              <Check className="h-5 w-5" aria-hidden="true" /> {t.allClear}
            </div>
          ) : (
            <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
              {o.decisions.map((d) => (
                <li key={d.id}>
                  <Link
                    href={withLocale(locale, d.href)}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold ${KIND_STYLE[d.kind]}`}
                    >
                      {t.kinds[d.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-slate-900">
                        {d.title}
                      </span>
                      <span className="block truncate text-[12px] text-slate-500">
                        {d.kind === 'lead' ? t.sourceNames.franchise : d.note}
                        {d.at ? ` · ${relTime(d.at, locale)}` : ''}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {o.staleDecisions > 0 && (
            <p className="mt-3 text-[13px] text-slate-500">
              {t.stale(o.staleDecisions)}{' '}
              <Link href={withLocale(locale, '/dashboard/xeberler')} className="font-medium text-[#0A5BD6] hover:underline">
                {t.news}
              </Link>
              {' · '}
              <Link href={withLocale(locale, '/dashboard/ilanlar')} className="font-medium text-[#0A5BD6] hover:underline">
                {t.listings}
              </Link>
            </p>
          )}
        </DashCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashCard
            title={t.leads}
            subtitle={t.leadsSub}
            range={t.last30}
            className="lg:col-span-2"
          >
            <BigNumber
              value={fmt(o.leads.total)}
              caption={`${t.leadsCaption} · ${t.vsPrev(o.leads.previous)}`}
              delta={leadDelta === 0 ? undefined : `${leadDelta > 0 ? '+' : ''}${leadDelta}`}
              deltaTone={leadDelta > 0 ? 'up' : 'down'}
            />
            <BarChart data={o.leads.series} locale={locale} color="#E11D48" label={t.leads} />
          </DashCard>

          <DashCard title={t.sources} subtitle={t.leads} range={t.last30}>
            {o.leads.bySource.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 py-8 text-slate-500">
                <Inbox className="h-8 w-8" aria-hidden="true" />
                <span className="text-[14px]">0</span>
              </div>
            ) : (
              <RingChart
                label={t.sources}
                parts={o.leads.bySource.map((s) => ({
                  label: t.sourceNames[s.source] ?? s.source,
                  value: s.value,
                  color: SOURCE_COLOR[s.source] ?? '#94A3B8',
                }))}
              />
            )}
          </DashCard>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashCard title={t.users} subtitle={t.usersSub}>
            <BigNumber value={fmt(o.users.total)} caption={t.usersCaption(o.users.newInPeriod)} />
            <AreaChart data={o.users.series} locale={locale} label={t.users} cumulative />
          </DashCard>

          <DashCard title={t.news} subtitle={t.newsSub}>
            <BigNumber value={fmt(o.news.published)} caption={t.newsCaption} />
            <AreaChart data={o.news.series} locale={locale} color="#0A7AFF" label={t.news} />
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              <Link
                href={withLocale(locale, '/dashboard/xeberler')}
                className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-800"
              >
                {t.newsAwaiting(o.news.awaiting)}
              </Link>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                {t.newsQueue(o.news.queue)}
              </span>
            </div>
          </DashCard>

          <DashCard title={t.listings} subtitle={`${t.listingsLive} · ${t.listingsPending}`}>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F2F2F7] p-4">
                <div className="text-[30px] font-semibold tabular-nums text-slate-900">
                  {fmt(o.listings.live)}
                </div>
                <div className="text-[13px] text-slate-600">{t.listingsLive}</div>
              </div>
              <Link
                href={withLocale(locale, '/dashboard/ilanlar')}
                className="rounded-2xl bg-amber-50 p-4 transition-colors hover:bg-amber-100"
              >
                <div className="text-[30px] font-semibold tabular-nums text-amber-900">
                  {fmt(o.listings.pending)}
                </div>
                <div className="text-[13px] text-amber-900">{t.listingsPending}</div>
              </Link>
            </div>
          </DashCard>

          <DashCard title={t.blog}>
            <BigNumber value={fmt(o.blog.published)} caption={t.blogCaption} />
          </DashCard>
        </div>

        <DashCard title={t.quick}>
          <div className="mt-3 flex flex-wrap gap-2">
            {t.quickLinks.map((q) => (
              <Link
                key={q.href}
                href={withLocale(locale, q.href)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#F2F2F7] px-4 text-[14px] font-medium text-slate-900 transition-colors hover:bg-slate-200"
              >
                {q.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  );
}
