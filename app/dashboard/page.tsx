import Link from 'next/link';
import { ArrowRight, Newspaper, PenSquare, Store } from 'lucide-react';
import { sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { blogPosts, memberProfiles } from '@/lib/db/schema';
import { adminUsers } from '@/lib/data/adminContent';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { getDashboardListingMetrics } from '@/lib/repositories/listingRepository';

const quickActions = [
  { href: '/dashboard/ilanlar?status=submitted', label: 'Yeni elan incele', icon: Store },
  { href: '/dashboard/blog/new', label: 'Blog yaz', icon: PenSquare },
  { href: '/dashboard/xeberler/rss', label: 'RSS yoxla', icon: Newspaper },
];

export default async function DashboardPage() {
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

  const stats = [
    {
      label: 'Umumi uzv sayi',
      value: String(memberCount[0]?.count || 0),
      note: dbAvailable ? 'Member profiles cedvelinden' : `${adminUsers.length} fallback profil`,
      tone: 'bg-slate-50 text-slate-700',
    },
    {
      label: 'Aktiv elan sayi',
      value: String(listingMetrics.active),
      note: 'Vitrinde gorunen elanlar',
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Gozleyen elan',
      value: String(listingMetrics.pending),
      note: 'Review workflow-da olanlar',
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Bu hefte lead sayi',
      value: String(listingMetrics.weeklyLeads),
      note: 'Son 7 gunde gelen leadler',
      tone: 'bg-rose-50 text-rose-700',
    },
    {
      label: 'Blog yazi sayi',
      value: String(blogCount[0]?.count || 0),
      note: 'Blog posts cedvelinden',
      tone: 'bg-blue-50 text-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            OCAQ
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">Idareetme merkezi</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Dashboard artik real listing, blog ve member verileri ile dolur. DB baglantisi yoxdursa eyni ekran
            kontrollu fallback ile acilir.
          </p>
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
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Son emeliyyatlar</h2>
                <p className="mt-1 text-sm text-slate-500">Listing ve lead axini</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Son 5 elan</h3>
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
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Son 5 lead</h3>
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
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Tez kecidler</h2>
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
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Son blog yazilari</h2>
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
