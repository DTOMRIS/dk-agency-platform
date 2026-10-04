import Link from 'next/link';
import KazanLeadStatusActions from '@/components/dashboard/KazanLeadStatusActions';
import { getKazanLeads, normalizeStatus } from '@/lib/repositories/kazanLeadRepository';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';
import { requireAdminPage } from '@/lib/auth/guards';

const statusOptions = ['all', 'new', 'contacted', 'qualified', 'converted', 'dismissed'] as const;
const intentOptions = ['all', 'food_cost', 'pnl', 'aqta', 'delivery', 'general'] as const;
const businessTypeOptions = ['all', 'restoran', 'kafe', 'franchise', 'diger'] as const;

function buildFilterHref(
  current: { status?: string; intent?: string; businessType?: string },
  next: Partial<{ status: string; intent: string; businessType: string }>
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.status && merged.status !== 'all') params.set('status', merged.status);
  if (merged.intent && merged.intent !== 'all') params.set('intent', merged.intent);
  if (merged.businessType && merged.businessType !== 'all')
    params.set('businessType', merged.businessType);
  const query = params.toString();
  return query ? `/dashboard/kazan-leads?${query}` : '/dashboard/kazan-leads';
}

export default async function DashboardKazanLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);
  const t = await getTranslations('dashboardKazanLeads');

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

  const cardCls =
    'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';
  const chipCls = (active: boolean) =>
    `inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
      active ? 'bg-[#EEF4FF] text-slate-900 ring-1 ring-[#0A5BD6]/20' : 'bg-[#F2F2F7] text-slate-700 hover:bg-slate-200'
    }`;
  const statusTone: Record<string, string> = {
    new: 'bg-[#EEF4FF] text-[#0A5BD6]',
    contacted: 'bg-amber-50 text-amber-800',
    qualified: 'bg-violet-50 text-violet-700',
    converted: 'bg-emerald-50 text-emerald-700',
    dismissed: 'bg-slate-100 text-slate-600',
  };
  const labelFrom = (
    list: readonly string[],
    ns: 'statusOptions' | 'intentOptions' | 'businessTypeOptions',
    value: string,
  ) => (list.includes(value) ? t(`${ns}.${value}`) : value);
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">{t('title')}</h1>
          <p className="mt-1 max-w-3xl text-[15px] text-slate-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(
            [
              [t('summary.new'), summary.new, 'bg-[#0A5BD6]'],
              [t('summary.contacted'), summary.contacted, 'bg-amber-500'],
              [t('summary.qualified'), summary.qualified, 'bg-violet-500'],
              [t('summary.converted'), summary.converted, 'bg-emerald-500'],
            ] as const
          ).map(([label, value, dot]) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                <p className="truncate text-[14px] font-medium text-slate-600">{label}</p>
              </div>
              <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        <div className={`${cardCls} space-y-5 p-5 sm:p-6`}>
          {(
            [
              ['filters.status', statusOptions, 'status', 'statusOptions'],
              ['filters.intent', intentOptions, 'intent', 'intentOptions'],
              ['filters.businessType', businessTypeOptions, 'businessType', 'businessTypeOptions'],
            ] as const
          ).map(([labelKey, options, field, ns]) => (
            <div key={field}>
              <p className="text-[13px] font-semibold text-slate-900">{t(labelKey)}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {options.map((option) => (
                  <Link
                    key={option}
                    href={buildFilterHref(current, { [field]: option })}
                    aria-current={current[field] === option ? 'true' : undefined}
                    className={chipCls(current[field] === option)}
                  >
                    {t(`${ns}.${option}`)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className={`${cardCls} px-6 py-16 text-center text-sm text-slate-600`}>{t('emptyState')}</div>
          ) : null}

          {leads.map((lead) => {
            const userMessages = (lead.conversationContext || [])
              .filter((message) => message.role === 'user')
              .map((message) => message.content)
              .reverse();

            return (
              <div key={lead.id} className={`${cardCls} p-5 sm:p-6`}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-5">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF] text-[16px] font-semibold text-[#0A5BD6]"
                        aria-hidden="true"
                      >
                        {initials(lead.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-slate-500">{t('lead')}</p>
                        <h2 className="truncate text-[22px] font-semibold tracking-tight text-slate-900">{lead.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 tabular-nums">{lead.phone}</span>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                            {labelFrom(businessTypeOptions, 'businessTypeOptions', lead.businessType)}
                          </span>
                          <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[#0A5BD6]">
                            {labelFrom(intentOptions, 'intentOptions', lead.intent)}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 ${statusTone[lead.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {labelFrom(statusOptions, 'statusOptions', lead.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">{t('lastMessages')}</p>
                      <div className="mt-3 space-y-2">
                        {(lead.conversationContext || []).map((message, index) => (
                          <div
                            key={`${lead.id}-${index}`}
                            className={`rounded-[16px] px-4 py-3 text-[14px] leading-relaxed text-slate-800 ${
                              message.role === 'user' ? 'bg-[#EEF4FF]' : 'bg-[#F2F2F7]'
                            }`}
                          >
                            <span className="mr-2 font-semibold text-slate-900">
                              {message.role === 'user' ? t('roleUser') : t('roleAi')}
                            </span>
                            {message.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3 rounded-[18px] bg-[#F2F2F7] p-4 lg:max-w-sm">
                    <p className="text-[13px] font-semibold text-slate-900">{t('actions')}</p>
                    <a
                      href={buildWhatsappLink(lead, userMessages)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      {t('openWhatsapp')}
                    </a>
                    <KazanLeadStatusActions
                      leadId={lead.id}
                      status={normalizeStatus(lead.status)}
                      notes={Array.isArray(lead.notes) ? lead.notes : []}
                      leadScore={lead.leadScore ?? null}
                      nextContactAt={
                        lead.nextContactAt ? new Date(lead.nextContactAt).toISOString() : null
                      }
                    />
                    <dl className="space-y-1.5 rounded-[14px] bg-white px-4 py-3 text-[12px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">{t('createdAt')}</dt>
                        <dd className="text-right font-medium text-slate-800 tabular-nums">
                          {new Date(lead.createdAt).toLocaleString(
                            locale === 'az'
                              ? 'az-AZ'
                              : locale === 'ru'
                                ? 'ru-RU'
                                : locale === 'tr'
                                  ? 'tr-TR'
                                  : 'en-GB'
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">{t('whatsapp')}</dt>
                        <dd className="font-medium text-slate-800">{lead.whatsappHandoff ? t('yes') : t('no')}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">{t('meeting')}</dt>
                        <dd className="font-medium text-slate-800">{lead.meetingRequested ? t('requested') : t('none')}</dd>
                      </div>
                    </dl>
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
