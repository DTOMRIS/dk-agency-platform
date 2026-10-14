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
    'rounded-[22px] border border-[#E4DCCD] bg-white';
  const chipCls = (active: boolean) =>
    `inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
      active ? 'bg-[#0F172A] text-white' : 'border border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A]'
    }`;
  const statusTone: Record<string, string> = {
    new: 'bg-sky-50 text-sky-800',
    contacted: 'bg-amber-50 text-amber-800',
    qualified: 'bg-violet-50 text-violet-700',
    converted: 'bg-emerald-50 text-emerald-700',
    dismissed: 'bg-[#EFE9DE] text-[#5B6474]',
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
    <div className="min-h-full bg-[#F6F1E9] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="min-w-0">
          <h1 className="text-[32px] font-black tracking-[-0.03em] text-[#0F172A] sm:text-[38px]">{t('title')}</h1>
          <p className="mt-1 max-w-3xl text-[15px] text-[#5B6474]">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(
            [
              [t('summary.new'), summary.new, 'bg-[#0F172A]'],
              [t('summary.contacted'), summary.contacted, 'bg-amber-500'],
              [t('summary.qualified'), summary.qualified, 'bg-violet-500'],
              [t('summary.converted'), summary.converted, 'bg-emerald-500'],
            ] as const
          ).map(([label, value, dot]) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                <p className="truncate text-[14px] font-medium text-[#5B6474]">{label}</p>
              </div>
              <p className="mt-3 text-[34px] font-black leading-none tracking-[-0.03em] text-[#0F172A] tabular-nums">{value}</p>
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
              <p className="text-[13px] font-semibold text-[#0F172A]">{t(labelKey)}</p>
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
            <div className={`${cardCls} px-6 py-16 text-center text-sm text-[#5B6474]`}>{t('emptyState')}</div>
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
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFE9DE] text-[16px] font-semibold text-[#0F172A]"
                        aria-hidden="true"
                      >
                        {initials(lead.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[#5B6474]">{t('lead')}</p>
                        <h2 className="truncate text-[22px] font-black tracking-[-0.02em] text-[#0F172A]">{lead.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
                          <span className="rounded-full bg-[#EFE9DE] px-2.5 py-1 text-[#334155] tabular-nums">{lead.phone}</span>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                            {labelFrom(businessTypeOptions, 'businessTypeOptions', lead.businessType)}
                          </span>
                          <span className="rounded-full bg-[#EFE9DE] px-2.5 py-1 text-[#0F172A]">
                            {labelFrom(intentOptions, 'intentOptions', lead.intent)}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 ${statusTone[lead.status] ?? 'bg-[#EFE9DE] text-[#334155]'}`}>
                            {labelFrom(statusOptions, 'statusOptions', lead.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-[#0F172A]">{t('lastMessages')}</p>
                      <div className="mt-3 space-y-2">
                        {(lead.conversationContext || []).map((message, index) => (
                          <div
                            key={`${lead.id}-${index}`}
                            className={`rounded-[16px] px-4 py-3 text-[14px] leading-relaxed text-[#0F172A] ${
                              message.role === 'user' ? 'bg-[#EFE9DE]' : 'bg-[#F6F1E9]'
                            }`}
                          >
                            <span className="mr-2 font-semibold text-[#0F172A]">
                              {message.role === 'user' ? t('roleUser') : t('roleAi')}
                            </span>
                            {message.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3 rounded-[18px] border border-[#EFE9DE] bg-[#FBF8F3] p-4 lg:max-w-sm">
                    <p className="text-[13px] font-semibold text-[#0F172A]">{t('actions')}</p>
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
                        <dt className="text-[#5B6474]">{t('createdAt')}</dt>
                        <dd className="text-right font-medium text-[#0F172A] tabular-nums">
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
                        <dt className="text-[#5B6474]">{t('whatsapp')}</dt>
                        <dd className="font-medium text-[#0F172A]">{lead.whatsappHandoff ? t('yes') : t('no')}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#5B6474]">{t('meeting')}</dt>
                        <dd className="font-medium text-[#0F172A]">{lead.meetingRequested ? t('requested') : t('none')}</dd>
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
