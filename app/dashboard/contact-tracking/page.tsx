import Link from 'next/link';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { requireAdminPage } from '@/lib/auth/guards';

type LeadRow = {
  id: number;
  channel: string | null;
  locale: string | null;
  sourceUrl: string | null;
  prefillText: string | null;
  destinationPhone: string | null;
  userAgent: string | null;
  createdAt: Date;
};

const CHANNEL_OPTIONS = ['all', 'whatsapp', 'telegram', 'kazan'] as const;
type ChannelOption = (typeof CHANNEL_OPTIONS)[number];

const ROW_LIMIT = 100;

function channelEmoji(channel: string | null): string {
  if (channel === 'whatsapp') return '💬';
  if (channel === 'telegram') return '✈️';
  if (channel === 'kazan') return '🤖';
  return '—';
}

function channelLabel(channel: string | null): string {
  if (channel === 'whatsapp') return 'WhatsApp';
  if (channel === 'telegram') return 'Telegram';
  if (channel === 'kazan') return 'KAZAN';
  return channel ?? '—';
}

function buildFilterHref(channel: string): string {
  if (channel === 'all') return '/dashboard/contact-tracking';
  return `/dashboard/contact-tracking?channel=${channel}`;
}

// Shorten a source URL to its path for the table; the full URL stays in title.
function shortUrl(value: string | null): string {
  if (!value) return '—';
  try {
    const u = new URL(value);
    return u.pathname + u.search || '/';
  } catch {
    return value;
  }
}

// Compact device label from a raw user-agent string.
function deviceLabel(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Digər';
}

export default async function ContactTrackingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const activeChannel: ChannelOption =
    typeof params.channel === 'string' &&
    (CHANNEL_OPTIONS as readonly string[]).includes(params.channel)
      ? (params.channel as ChannelOption)
      : 'all';

  if (!db) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-700">
              DB unavailable — DATABASE_URL mühit dəyişəni təyin edilməyib.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns = {
    id: leads.id,
    channel: leads.channel,
    locale: leads.locale,
    sourceUrl: leads.sourceUrl,
    prefillText: leads.prefillText,
    destinationPhone: leads.destinationPhone,
    userAgent: leads.userAgent,
    createdAt: leads.createdAt,
  };

  const baseQuery = db.select(columns).from(leads);

  const rows: LeadRow[] =
    activeChannel === 'all'
      ? await baseQuery.orderBy(desc(leads.createdAt)).limit(ROW_LIMIT)
      : await db
          .select(columns)
          .from(leads)
          .where(eq(leads.channel, activeChannel))
          .orderBy(desc(leads.createdAt))
          .limit(ROW_LIMIT);

  // Accurate all-time totals per channel — independent of the display limit,
  // so the summary cards no longer drift when a filter is applied.
  const channelCounts = await db
    .select({ channel: leads.channel, count: sql<number>`count(*)::int` })
    .from(leads)
    .groupBy(leads.channel);

  const countFor = (channel: string) =>
    channelCounts.find((c) => c.channel === channel)?.count ?? 0;

  const summary = {
    whatsapp: countFor('whatsapp'),
    telegram: countFor('telegram'),
    kazan: countFor('kazan'),
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header card */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">
            Əlaqə Kanalı İzləmə
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            Əlaqə səhifəsindəki WhatsApp, Telegram və KAZAN düymələrinə edilən kliklər — hansı
            səhifədən, hansı hazır mesajla və hansı hədəfə. Qeyd: klik mesajın{' '}
            <strong>məzmununu deyil</strong>, niyyətini (bizim hazırladığımız mətn) göstərir —
            WhatsApp söhbətinin özü sayta gəlmir.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              { label: '💬 WhatsApp', value: summary.whatsapp, channel: 'whatsapp' },
              { label: '✈️ Telegram', value: summary.telegram, channel: 'telegram' },
              { label: '🤖 KAZAN', value: summary.kazan, channel: 'kazan' },
            ] as const
          ).map(({ label, value, channel }) => (
            <Link
              key={channel}
              href={buildFilterHref(channel)}
              className={`rounded-3xl border p-5 transition-colors ${
                activeChannel === channel
                  ? 'border-[var(--dk-red)] bg-red-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                {label}
              </div>
              <div className="mt-3 text-3xl font-black text-[var(--dk-navy)]">{value}</div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Ümumi klik
              </div>
            </Link>
          ))}
        </div>

        {/* Filter bar */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
            Kanal filtri
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((option) => (
              <Link
                key={option}
                href={buildFilterHref(option)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  activeChannel === option
                    ? 'bg-[var(--dk-red)] text-white'
                    : 'border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {option === 'all'
                  ? 'Hamısı'
                  : option === 'whatsapp'
                    ? '💬 WhatsApp'
                    : option === 'telegram'
                      ? '✈️ Telegram'
                      : '🤖 KAZAN'}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Nəticə tapılmadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Kanal
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Dil
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Səhifə
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Hazır mesaj
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Hədəf
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Cihaz
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                      Tarix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {channelEmoji(row.channel)} {channelLabel(row.channel)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-bold uppercase text-slate-700">
                        {row.locale ?? '—'}
                      </td>
                      <td
                        className="max-w-[220px] truncate px-5 py-3 text-xs text-slate-700"
                        title={row.sourceUrl ?? undefined}
                      >
                        {shortUrl(row.sourceUrl)}
                      </td>
                      <td
                        className="max-w-[260px] truncate px-5 py-3 text-xs text-slate-700"
                        title={row.prefillText ?? undefined}
                      >
                        {row.prefillText ?? '—'}
                      </td>
                      <td
                        className="max-w-[160px] truncate px-5 py-3 font-mono text-xs text-slate-600"
                        title={row.destinationPhone ?? undefined}
                      >
                        {row.destinationPhone ?? '—'}
                      </td>
                      <td
                        className="px-5 py-3 text-xs text-slate-600"
                        title={row.userAgent ?? undefined}
                      >
                        {deviceLabel(row.userAgent)}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-700">
                        {row.createdAt.toLocaleDateString('az-AZ')}{' '}
                        <span className="text-slate-600">
                          {row.createdAt.toLocaleTimeString('az-AZ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="px-1 text-xs text-slate-600">
          Cədvəldə son {ROW_LIMIT} giriş göstərilir · Yuxarıdakı sayğaclar bütün qeydlər üzrədir ·
          Ən yeni əvvəldə
        </p>
      </div>
    </div>
  );
}
