import Link from 'next/link';
import { db } from '@/lib/db';
import { franchiseLeads } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdminPage } from '@/lib/auth/guards';

type FranchiseToolSource =
  | 'readiness_test'
  | 'roi_calc'
  | 'buyer_checklist'
  | 'franchbook_gate'
  | 'academy'
  | 'consulting';

const toolSourceOptions = [
  'all',
  'readiness_test',
  'roi_calc',
  'buyer_checklist',
  'franchbook_gate',
  'academy',
  'consulting',
] as const;

const toolSourceLabels: Record<string, string> = {
  all: 'Hamısı',
  readiness_test: 'Hazırlıq Testi',
  roi_calc: 'ROI Kalkulyator',
  buyer_checklist: 'Alıcı Çeklistı',
  franchbook_gate: 'FranchBook',
  academy: 'Akademiya',
  consulting: 'Konsaltinq',
};

function buildFilterHref(
  current: { toolSource?: string },
  next: Partial<{ toolSource: string }>,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.toolSource && merged.toolSource !== 'all') {
    params.set('toolSource', merged.toolSource);
  }
  const query = params.toString();
  return query ? `/dashboard/franchise-leads?${query}` : '/dashboard/franchise-leads';
}

type FranchiseLead = {
  id: string;
  name: string;
  brand: string | null;
  contact: string;
  toolSource: FranchiseToolSource;
  locale: string;
  createdAt: Date;
};

export default async function DashboardFranchiseLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  if (!db) {
    return (
      <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="rounded-[22px] bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-bold text-slate-700">
              Veritabanı əlaqəsi yoxdur. Zəhmət olmasa konfiqurasiyani yoxlayın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentToolSource =
    typeof params.toolSource === 'string' ? params.toolSource : 'all';

  const allLeads = await db
    .select({
      id: franchiseLeads.id,
      name: franchiseLeads.name,
      brand: franchiseLeads.brand,
      contact: franchiseLeads.contact,
      toolSource: franchiseLeads.toolSource,
      locale: franchiseLeads.locale,
      createdAt: franchiseLeads.createdAt,
    })
    .from(franchiseLeads)
    .orderBy(desc(franchiseLeads.createdAt));

  const filteredLeads: FranchiseLead[] =
    currentToolSource === 'all'
      ? allLeads
      : allLeads.filter((lead) => lead.toolSource === currentToolSource);

  const summary: Record<FranchiseToolSource, number> = {
    readiness_test: 0,
    roi_calc: 0,
    buyer_checklist: 0,
    franchbook_gate: 0,
    academy: 0,
    consulting: 0,
  };

  for (const lead of allLeads) {
    summary[lead.toolSource] += 1;
  }

  const summaryCards: Array<{ label: string; value: number }> = [
    { label: 'Hazırlıq Testi', value: summary.readiness_test },
    { label: 'ROI Kalkulyator', value: summary.roi_calc },
    { label: 'FranchBook', value: summary.franchbook_gate },
    { label: 'Konsaltinq', value: summary.consulting },
  ];

  const cardCls =
    'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';
  const dots = ['bg-[#0A5BD6]', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500'];

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">
            Françayz Leadləri
          </h1>
          <p className="mt-1 max-w-3xl text-[15px] text-slate-600">
            Franchise Radar, OTA Guide və konsaltinq alətlərindən daxil olan leadlər.
            Cəmi{' '}
            <span className="font-semibold text-slate-900 tabular-nums">{allLeads.length}</span> lead.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map(({ label, value }, i) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dots[i % dots.length]}`} aria-hidden="true" />
                <p className="truncate text-[14px] font-medium text-slate-600">{label}</p>
              </div>
              <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className={`${cardCls} p-5 sm:p-6`}>
          <p className="text-[13px] font-semibold text-slate-900">Mənbəyə görə filter</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {toolSourceOptions.map((option) => (
              <Link
                key={option}
                href={buildFilterHref({ toolSource: currentToolSource }, { toolSource: option })}
                aria-current={currentToolSource === option ? 'true' : undefined}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                  currentToolSource === option
                    ? 'bg-[#EEF4FF] text-slate-900 ring-1 ring-[#0A5BD6]/20'
                    : 'bg-[#F2F2F7] text-slate-700 hover:bg-slate-200'
                }`}
              >
                {toolSourceLabels[option]}
              </Link>
            ))}
          </div>
        </div>

        {/* Lead list */}
        {filteredLeads.length === 0 ? (
          <div className={`${cardCls} px-6 py-16 text-center text-sm text-slate-600`}>
            Bu filterlə heç bir lead tapılmadı.
          </div>
        ) : (
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4 font-semibold">Ad</th>
                    <th className="px-5 py-4 font-semibold">Əlaqə</th>
                    <th className="px-5 py-4 font-semibold">Brend</th>
                    <th className="px-5 py-4 font-semibold">Mənbə</th>
                    <th className="px-5 py-4 font-semibold">Dil</th>
                    <th className="px-5 py-4 font-semibold">Tarix</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100 transition-colors hover:bg-[#F9F9FB]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF] text-[13px] font-semibold text-[#0A5BD6]"
                            aria-hidden="true"
                          >
                            {initials(lead.name)}
                          </span>
                          <span className="truncate font-medium text-slate-900">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{lead.contact}</td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {lead.brand ?? <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                          {toolSourceLabels[lead.toolSource] ?? lead.toolSource}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[12px] font-semibold uppercase text-[#0A5BD6]">
                          {lead.locale}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 tabular-nums">
                        {new Date(lead.createdAt).toLocaleDateString('az-AZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
