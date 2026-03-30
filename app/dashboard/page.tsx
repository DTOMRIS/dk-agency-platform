import Link from 'next/link';
import { ArrowRight, Newspaper, PenSquare, Store } from 'lucide-react';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';
import { adminUsers } from '@/lib/data/adminContent';

const submittedCount = MOCK_LISTINGS.filter((item) => item.status === 'submitted').length;
const showcaseCount = MOCK_LISTINGS.filter((item) => item.status === 'showcase_ready').length;

const recentListings = MOCK_LISTINGS.slice(0, 5);
const recentLeads = MOCK_LISTINGS.flatMap((listing) =>
  listing.leads.map((lead) => ({ ...lead, trackingCode: listing.trackingCode, title: listing.title })),
).slice(0, 5);

const quickActions = [
  { href: '/dashboard/ilanlar?status=submitted', label: 'Yeni elan incələ', icon: Store },
  { href: '/dashboard/blog/new', label: 'Blog yaz', icon: PenSquare },
  { href: '/dashboard/xeberler/rss', label: 'RSS yoxla', icon: Newspaper },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            OCAQ
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">İdarəetmə mərkəzi</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            OCAQ paneli ilə elan, blog, xəbərlər və sayt məzmunu bir yerdə idarə olunur. Bu sprintdə bütün CRUD sahələri mock və console.log üzərində işləyir.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Ümumi üzv sayı', value: '47', note: `${adminUsers.length} mock profil`, tone: 'bg-slate-50 text-slate-700' },
            { label: 'Aktiv elan sayı', value: String(showcaseCount), note: 'Vitrində görünən elanlar', tone: 'bg-emerald-50 text-emerald-700' },
            { label: 'Gözləyən elan', value: String(submittedCount), note: 'Komitə baxışı gözləyir', tone: 'bg-amber-50 text-amber-700' },
            { label: 'Bu ay lead sayı', value: '23', note: 'Mock lead axını', tone: 'bg-rose-50 text-rose-700' },
          ].map((item) => (
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
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Son əməliyyatlar</h2>
                <p className="mt-1 text-sm text-slate-500">Elan submission və lead axını</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Son 5 elan</h3>
                <div className="mt-4 space-y-3">
                  {recentListings.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-bold text-[var(--dk-navy)]">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.trackingCode} • {item.city}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Son 5 lead</h3>
                <div className="mt-4 space-y-3">
                  {recentLeads.map((item, index) => (
                    <div key={`${item.trackingCode}-${index}`} className="rounded-2xl bg-white p-4">
                      <div className="text-sm font-bold text-[var(--dk-navy)]">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.trackingCode} • {item.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Tez keçidlər</h2>
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
        </div>
      </div>
    </div>
  );
}
