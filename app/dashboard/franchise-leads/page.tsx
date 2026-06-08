import Link from 'next/link';
import { db } from '@/lib/db';
import { franchiseLeads } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

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
  if (!db) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
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

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">
            Franchise Leadləri
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            Franchise Radar, OTA Guide və konsaltinq alətlərindən daxil olan leadlər.
            Cəmi{' '}
            <span className="font-bold text-slate-700">{allLeads.length}</span> lead.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {summaryCards.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                {label}
              </div>
              <div className="mt-3 text-3xl font-black text-[var(--dk-navy)]">{value}</div>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Mənbəyə görə filter
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {toolSourceOptions.map((option) => (
              <Link
                key={option}
                href={buildFilterHref({ toolSource: currentToolSource }, { toolSource: option })}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  currentToolSource === option
                    ? 'bg-[var(--dk-red)] text-white'
                    : 'border border-slate-200 text-slate-700'
                }`}
              >
                {toolSourceLabels[option]}
              </Link>
            ))}
          </div>
        </div>

        {/* Lead list */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
              Bu filterlə heç bir lead tapılmadı.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Ad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Əlaqə
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Brend
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Mənbə
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Dil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Tarix
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-700">{lead.contact}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {lead.brand ?? (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {toolSourceLabels[lead.toolSource] ?? lead.toolSource}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 uppercase">
                          {lead.locale}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {new Date(lead.createdAt).toLocaleDateString('az-AZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
