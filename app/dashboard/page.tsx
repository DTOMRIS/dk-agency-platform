import Link from 'next/link';
import { ArrowRight, Newspaper, PenSquare, Store } from 'lucide-react';
import { sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { blogPosts, memberProfiles } from '@/lib/db/schema';
import { adminUsers } from '@/lib/data/adminContent';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { getDashboardListingMetrics } from '@/lib/repositories/listingRepository';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, type Locale } from '@/i18n/config';

const dashCopy: Record<Locale, {
  badge: string;
  title: string;
  subtitle: string;
  totalMembers: string;
  totalMembersNote: string;
  totalMembersFallback: string;
  activeListings: string;
  activeListingsNote: string;
  pendingListings: string;
  pendingListingsNote: string;
  weeklyLeads: string;
  weeklyLeadsNote: string;
  blogPosts: string;
  blogPostsNote: string;
  recentActivity: string;
  recentActivitySub: string;
  last5Listings: string;
  last5Leads: string;
  quickActions: string;
  recentBlog: string;
  actionReviewListing: string;
  actionWriteBlog: string;
  actionCheckRss: string;
}> = {
  az: {
    badge: 'OCAQ',
    title: 'İdarəetmə mərkəzi',
    subtitle: 'Dashboard artıq real listing, blog və member veriləri ilə dolur. DB bağlantısı yoxdursa eyni ekran kontrollu fallback ilə açılır.',
    totalMembers: 'Ümumi üzv sayı',
    totalMembersNote: 'Member profiles cədvəlindən',
    totalMembersFallback: 'fallback profil',
    activeListings: 'Aktiv elan sayı',
    activeListingsNote: 'Vitrində görünən elanlar',
    pendingListings: 'Gözləyən elan',
    pendingListingsNote: 'Review workflow-da olanlar',
    weeklyLeads: 'Bu həftə lead sayı',
    weeklyLeadsNote: 'Son 7 gündə gələn leadlər',
    blogPosts: 'Blog yazı sayı',
    blogPostsNote: 'Blog posts cədvəlindən',
    recentActivity: 'Son əməliyyatlar',
    recentActivitySub: 'Listing və lead axını',
    last5Listings: 'Son 5 elan',
    last5Leads: 'Son 5 lead',
    quickActions: 'Tez keçidlər',
    recentBlog: 'Son blog yazıları',
    actionReviewListing: 'Yeni elan incələ',
    actionWriteBlog: 'Blog yaz',
    actionCheckRss: 'RSS yoxla',
  },
  ru: {
    badge: 'OCAQ',
    title: 'Центр управления',
    subtitle: 'Дашборд показывает реальные данные объявлений, блога и участников. При отсутствии БД работает с fallback.',
    totalMembers: 'Всего участников',
    totalMembersNote: 'Из таблицы профилей',
    totalMembersFallback: 'fallback профиль',
    activeListings: 'Активные объявления',
    activeListingsNote: 'Отображаемые на витрине',
    pendingListings: 'Ожидающие',
    pendingListingsNote: 'В процессе проверки',
    weeklyLeads: 'Лиды за неделю',
    weeklyLeadsNote: 'За последние 7 дней',
    blogPosts: 'Статей в блоге',
    blogPostsNote: 'Из таблицы блога',
    recentActivity: 'Последние действия',
    recentActivitySub: 'Поток объявлений и лидов',
    last5Listings: 'Последние 5 объявлений',
    last5Leads: 'Последние 5 лидов',
    quickActions: 'Быстрые действия',
    recentBlog: 'Последние статьи',
    actionReviewListing: 'Проверить объявление',
    actionWriteBlog: 'Написать статью',
    actionCheckRss: 'Проверить RSS',
  },
  en: {
    badge: 'OCAQ',
    title: 'Control centre',
    subtitle: 'Dashboard displays real listing, blog, and member data. Falls back gracefully when DB is unavailable.',
    totalMembers: 'Total members',
    totalMembersNote: 'From member profiles table',
    totalMembersFallback: 'fallback profile',
    activeListings: 'Active listings',
    activeListingsNote: 'Visible on showcase',
    pendingListings: 'Pending listings',
    pendingListingsNote: 'In review workflow',
    weeklyLeads: 'Weekly leads',
    weeklyLeadsNote: 'Last 7 days',
    blogPosts: 'Blog posts',
    blogPostsNote: 'From blog posts table',
    recentActivity: 'Recent activity',
    recentActivitySub: 'Listing and lead flow',
    last5Listings: 'Last 5 listings',
    last5Leads: 'Last 5 leads',
    quickActions: 'Quick actions',
    recentBlog: 'Recent blog posts',
    actionReviewListing: 'Review new listing',
    actionWriteBlog: 'Write blog post',
    actionCheckRss: 'Check RSS',
  },
  tr: {
    badge: 'OCAQ',
    title: 'Yönetim merkezi',
    subtitle: 'Dashboard artık gerçek ilan, blog ve üye verileri ile doluyor. DB bağlantısı yoksa kontrollü fallback ile açılır.',
    totalMembers: 'Toplam üye sayısı',
    totalMembersNote: 'Üye profilleri tablosundan',
    totalMembersFallback: 'fallback profil',
    activeListings: 'Aktif ilan sayısı',
    activeListingsNote: 'Vitrinde görünen ilanlar',
    pendingListings: 'Bekleyen ilan',
    pendingListingsNote: 'İnceleme sürecindekiler',
    weeklyLeads: 'Bu hafta lead sayısı',
    weeklyLeadsNote: 'Son 7 günde gelen leadler',
    blogPosts: 'Blog yazı sayısı',
    blogPostsNote: 'Blog yazıları tablosundan',
    recentActivity: 'Son işlemler',
    recentActivitySub: 'İlan ve lead akışı',
    last5Listings: 'Son 5 ilan',
    last5Leads: 'Son 5 lead',
    quickActions: 'Hızlı geçişler',
    recentBlog: 'Son blog yazıları',
    actionReviewListing: 'Yeni ilan incele',
    actionWriteBlog: 'Blog yaz',
    actionCheckRss: 'RSS kontrol et',
  },
};

export default async function DashboardPage() {
  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);
  const copy = dashCopy[locale];

  const listingMetrics = await getDashboardListingMetrics();

  const [blogResult, memberCount, blogCount] = await Promise.all([
    getBlogPostsFromDb({ status: 'all', limit: 5 }),
    dbAvailable && db
      ? db.select({ count: sql<number>`count(*)::int` }).from(memberProfiles)
      : Promise.resolve([{ count: adminUsers.length }]),
    dbAvailable && db
      ? db.select({ count: sql<number>`count(*)::int` }).from(blogPosts)
      : Promise.resolve([{ count: 0 }]),
  ]);

  const quickActions = [
    { href: '/dashboard/ilanlar?status=submitted', label: copy.actionReviewListing, icon: Store },
    { href: '/dashboard/blog/new', label: copy.actionWriteBlog, icon: PenSquare },
    { href: '/dashboard/xeberler/rss', label: copy.actionCheckRss, icon: Newspaper },
  ];

  const stats = [
    {
      label: copy.totalMembers,
      value: String(memberCount[0]?.count || 0),
      note: dbAvailable ? copy.totalMembersNote : `${adminUsers.length} ${copy.totalMembersFallback}`,
      tone: 'bg-slate-50 text-slate-700',
    },
    {
      label: copy.activeListings,
      value: String(listingMetrics.active),
      note: copy.activeListingsNote,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: copy.pendingListings,
      value: String(listingMetrics.pending),
      note: copy.pendingListingsNote,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: copy.weeklyLeads,
      value: String(listingMetrics.weeklyLeads),
      note: copy.weeklyLeadsNote,
      tone: 'bg-rose-50 text-rose-700',
    },
    {
      label: copy.blogPosts,
      value: String(blogCount[0]?.count || 0),
      note: copy.blogPostsNote,
      tone: 'bg-blue-50 text-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {copy.badge}
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">{copy.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{copy.subtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${item.tone}`}>{item.label}</div>
              <div className="mt-4 text-4xl font-black text-[var(--dk-navy)]">{item.value}</div>
              <p className="mt-2 text-sm text-slate-500">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{copy.recentActivity}</h2>
                <p className="mt-1 text-sm text-slate-500">{copy.recentActivitySub}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{copy.last5Listings}</h3>
                <div className="mt-4 space-y-3">
                  {listingMetrics.latestListings.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-bold text-[var(--dk-navy)]">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.trackingCode} • {item.city}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{copy.last5Leads}</h3>
                <div className="mt-4 space-y-3">
                  {listingMetrics.latestLeads.map((item, index) => (
                    <div key={`${item.trackingCode}-${index}`} className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-bold text-[var(--dk-navy)]">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.trackingCode} • {item.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{copy.quickActions}</h2>
              <div className="mt-5 space-y-3">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--dk-red)]">
                          <Icon size={18} />
                        </span>
                        {item.label}
                      </span>
                      <ArrowRight size={16} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{copy.recentBlog}</h2>
              <div className="mt-4 space-y-3">
                {blogResult.posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/dashboard/blog/${post.slug}`}
                    className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-[var(--dk-gold)]"
                  >
                    <div className="text-sm font-bold text-[var(--dk-navy)]">{post.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{post.category}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
