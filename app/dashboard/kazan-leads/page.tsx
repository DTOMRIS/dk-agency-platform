import Link from 'next/link';
import KazanLeadStatusActions from '@/components/dashboard/KazanLeadStatusActions';
import { getKazanLeads, normalizeStatus } from '@/lib/repositories/kazanLeadRepository';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';

const statusOptions = ['all', 'new', 'contacted', 'qualified', 'converted', 'dismissed'] as const;
const intentOptions = ['all', 'food_cost', 'pnl', 'aqta', 'delivery', 'general'] as const;
const businessTypeOptions = ['all', 'restoran', 'kafe', 'franchise', 'diger'] as const;

function buildFilterHref(
  current: { status?: string; intent?: string; businessType?: string },
  next: Partial<{ status: string; intent: string; businessType: string }>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.status && merged.status !== 'all') params.set('status', merged.status);
  if (merged.intent && merged.intent !== 'all') params.set('intent', merged.intent);
  if (merged.businessType && merged.businessType !== 'all') params.set('businessType', merged.businessType);
  const query = params.toString();
  return query ? `/dashboard/kazan-leads?${query}` : '/dashboard/kazan-leads';
}

export default async function DashboardKazanLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const current = {
    status: typeof params.status === 'string' ? params.status : 'all',
    intent: typeof params.intent === 'string' ? params.intent : 'all',
    businessType: typeof params.businessType === 'string' ? params.businessType : 'all',
  };

  const leads = await getKazanLeads({
    status: current.status,
    intent: current.intent,
    businessType: current.businessType,
  });

  const summary = {
    new: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    qualified: leads.filter((lead) => lead.status === 'qualified').length,
    converted: leads.filter((lead) => lead.status === 'converted').length,
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">KAZAN leads</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            Widget-də form dolduran istifadəçilər burada real DB-dən görünür. Status, intent və biznes tipinə görə süzülür.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['New', summary.new],
            ['Contacted', summary.contacted],
            ['Qualified', summary.qualified],
            ['Converted', summary.converted],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
              <div className="mt-3 text-3xl font-black text-[var(--dk-navy)]">{value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Link
                  key={option}
                  href={buildFilterHref(current, { status: option })}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    current.status === option ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {option}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Intent</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {intentOptions.map((option) => (
                <Link
                  key={option}
                  href={buildFilterHref(current, { intent: option })}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    current.intent === option ? 'bg-[var(--dk-navy)] text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {option}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Business type</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {businessTypeOptions.map((option) => (
                <Link
                  key={option}
                  href={buildFilterHref(current, { businessType: option })}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    current.businessType === option ? 'bg-amber-100 text-[var(--dk-navy)]' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {option}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
              Bu filtrə uyğun KAZAN lead tapılmadı.
            </div>
          ) : null}

          {leads.map((lead) => {
            const userMessages = (lead.conversationContext || [])
              .filter((message) => message.role === 'user')
              .map((message) => message.content)
              .reverse();

            return (
              <div key={lead.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Lead</div>
                      <h2 className="mt-2 text-2xl font-black text-[var(--dk-navy)]">{lead.name}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{lead.phone}</span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">{lead.businessType}</span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{lead.intent}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{lead.status}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Son mesajlar</div>
                      <div className="mt-3 space-y-2">
                        {(lead.conversationContext || []).map((message, index) => (
                          <div key={`${lead.id}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <span className="mr-2 font-black text-[var(--dk-navy)]">{message.role === 'user' ? 'User' : 'AI'}</span>
                            {message.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-sm space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Actions</div>
                    <a
                      href={buildWhatsappLink(lead, userMessages)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-bold text-white"
                    >
                      WhatsApp-a aç
                    </a>
                    <KazanLeadStatusActions leadId={lead.id} status={normalizeStatus(lead.status)} />
                    <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500">
                      Yaradılıb: {new Date(lead.createdAt).toLocaleString('az-AZ')}
                      <br />
                      WhatsApp: {lead.whatsappHandoff ? 'bəli' : 'xeyr'}
                      <br />
                      Görüş: {lead.meetingRequested ? 'istənib' : 'yoxdur'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
