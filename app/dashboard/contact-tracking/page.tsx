import Link from 'next/link';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { requireAdminPage } from '@/lib/auth/guards';
import { extractRefCode } from '@/lib/leads/ref-code';
import { WHATSAPP_NUMBER } from '@/lib/contact-channels';

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
      <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="rounded-[22px] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
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

  const cardCls =
    'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">
            Əlaqə Kanalı İzləmə
          </h1>
          <p className="mt-1 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Əlaqə səhifəsindəki WhatsApp, Telegram və KAZAN düymələrinə edilən kliklər — hansı
            səhifədən, hansı hazır mesajla və hansı hədəfə. Qeyd: klik mesajın{' '}
            <strong className="font-semibold text-slate-900">məzmununu deyil</strong>, niyyətini (bizim hazırladığımız mətn) göstərir —
            WhatsApp söhbətinin özü sayta gəlmir.
          </p>
        </div>

        {/* TASK-0529 (owner 10.10: «başvurdu, nasıl iletişim kuracağım?») — say plainly where the person is. */}
        <div className={`${cardCls} border-l-4 border-[#25D366] p-5 sm:p-6`} data-testid="contact-howto">
          <p className="text-[15px] font-semibold text-slate-900">Klik edən adamla necə əlaqə saxlayım?</p>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-slate-700">
            <li>
              <strong className="font-semibold text-slate-900">Klik = adam düyməyə basdı.</strong> Sayt onun adını və nömrəsini görmür
              (WhatsApp bunu heç bir sayta vermir). Mesajı göndərsə, adı və nömrəsi telefonunuzdakı{' '}
              <strong className="font-semibold text-slate-900">WhatsApp Business-də (+{WHATSAPP_NUMBER})</strong> görünür — yazışma oradadır.
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Kod sütunu</strong>: hər klikin hazır mesajına «Kod: DK-XXXX» əlavə olunur.
              WhatsApp-da gələn mesajda eyni kodu görsəniz, bu sətirdəki səhifədən gəldiyini bilirsiniz.
              Kodsuz köhnə sətirlər 10.10.2026-dan əvvəlkidir.
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Telegram</strong>: düymə kanala aparır; kanala qoşulan adam özünü göstərmir.
              «t.me/dkagency» olan köhnə sətirlər səhv (başqasının) kanalına gedirdi — 08.10.2026-da düzəldilib.
            </li>
            <li>Nömrəsini istəyirsinizsə: KAZAN və əlaqə forması adı və telefonu soruşur — onlar «Bütün müraciətlər»də adla görünür.</li>
          </ul>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              aria-current={activeChannel === channel ? 'true' : undefined}
              className={`${cardCls} block p-5 transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] ${
                activeChannel === channel ? 'ring-2 ring-[#0A5BD6]/40' : ''
              }`}
            >
              <p className="text-[14px] font-medium text-slate-600">{label}</p>
              <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">{value}</p>
              <p className="mt-2 text-[12px] text-slate-500">Ümumi klik</p>
            </Link>
          ))}
        </div>

        {/* Filter bar */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <span className="hidden px-3 text-[13px] font-semibold text-slate-900 sm:inline">Kanal filtri</span>
            {CHANNEL_OPTIONS.map((option) => (
              <Link
                key={option}
                href={buildFilterHref(option)}
                aria-current={activeChannel === option ? 'true' : undefined}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                  activeChannel === option ? 'bg-[#EEF4FF] text-slate-900' : 'text-slate-700 hover:bg-slate-50'
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
        <div className={`${cardCls} overflow-hidden`}>
          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-600">Nəticə tapılmadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4 font-semibold">Kanal</th>
                    <th className="px-5 py-4 font-semibold">Dil</th>
                    <th className="px-5 py-4 font-semibold">Səhifə</th>
                    <th className="px-5 py-4 font-semibold">Hazır mesaj</th>
                    <th className="px-5 py-4 font-semibold">Kod</th>
                    <th className="px-5 py-4 font-semibold">Cihaz</th>
                    <th className="px-5 py-4 font-semibold">Tarix</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-[#F9F9FB]">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                          {channelEmoji(row.channel)} {channelLabel(row.channel)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[12px] font-semibold uppercase text-[#0A5BD6]">
                          {row.locale ?? '—'}
                        </span>
                      </td>
                      <td
                        className="max-w-[220px] truncate px-5 py-3 text-[13px] text-slate-700"
                        title={row.sourceUrl ?? undefined}
                      >
                        {shortUrl(row.sourceUrl)}
                      </td>
                      <td
                        className="max-w-[260px] truncate px-5 py-3 text-[13px] text-slate-800"
                        title={row.prefillText ?? undefined}
                      >
                        {row.prefillText ?? '—'}
                      </td>
                      {/* TASK-0529: the destination is always our own number — show the click's code instead. */}
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] font-semibold text-slate-800" title={row.destinationPhone ? `Hədəf: ${row.destinationPhone}` : undefined}>
                        {extractRefCode(row.prefillText) ?? (row.destinationPhone?.includes('dkagency') ? 'köhnə kanal' : '—')}
                      </td>
                      <td
                        className="px-5 py-3 text-[13px] text-slate-600"
                        title={row.userAgent ?? undefined}
                      >
                        {deviceLabel(row.userAgent)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[13px] text-slate-700 tabular-nums">
                        {row.createdAt.toLocaleDateString('az-AZ')}{' '}
                        <span className="text-slate-500">
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

        <p className="px-1 text-[12px] text-slate-600">
          Cədvəldə son {ROW_LIMIT} giriş göstərilir · Yuxarıdakı sayğaclar bütün qeydlər üzrədir ·
          Ən yeni əvvəldə
        </p>
      </div>
    </div>
  );
}
