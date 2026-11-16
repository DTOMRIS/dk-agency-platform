import { z } from 'zod';

export const salesStages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;
export const salesServices = ['undecided', 'discovery', 'diagnostic', 'monthly'] as const;
export type SalesStage = typeof salesStages[number];
export const legacyStage = (status: string): SalesStage => status === 'converted' ? 'won' : status === 'dismissed' ? 'lost' : salesStages.includes(status as SalesStage) ? status as SalesStage : 'new';
export const legacyStatus = (stage: SalesStage) => stage === 'proposal' ? 'qualified' : stage === 'won' ? 'converted' : stage === 'lost' ? 'dismissed' : stage;
export const isClosed = (stage: SalesStage) => stage === 'won' || stage === 'lost';
export const escapeSalesSearch = (value: string) => value.replace(/[\\%_]/g, char => '\\' + char);
export const bakuDay = (now: Date = new Date()) => new Date(now.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
const money = z.number().finite().min(0).max(9999999999.99).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.0001);
const calendarDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s);
export const salesInput = z.object({
  leadId: z.string().uuid(), version: z.number().int().min(0).max(2147483646), stage: z.enum(salesStages),
  ownerName: z.string().trim().max(100), nextAction: z.string().trim().max(1000),
  nextContactOn: calendarDay.nullable(), service: z.enum(salesServices),
  proposalAmount: money.nullable(), collectedAmount: money, spentMinutes: z.number().int().min(0).max(525600),
  lossReason: z.string().trim().max(1000), addNote: z.string().trim().max(2000).default(''),
}).strict().superRefine((v, ctx) => {
  if (!isClosed(v.stage)) {
    for (const key of ['ownerName', 'nextAction', 'nextContactOn'] as const) {
      if (!v[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'Required for active follow-up' });
    }
  }
  if (v.stage === 'lost' && !v.lossReason) ctx.addIssue({ code: 'custom', path: ['lossReason'], message: 'Required for lost request' });
});
export type SalesInput = z.infer<typeof salesInput>;
export type SalesFollowup = Omit<SalesInput, 'addNote'>;
export function initialFollowup(lead: { id: string; status: string; nextContactAt?: Date | string | null }): SalesFollowup {
  return { leadId: lead.id, stage: legacyStage(lead.status), ownerName: '', nextAction: '', nextContactOn: lead.nextContactAt ? new Date(lead.nextContactAt).toISOString().slice(0, 10) : null,
    service: 'undecided', proposalAmount: null, collectedAmount: 0, spentMinutes: 0, lossReason: '', version: 0 };
}
export function followupFlag(v: SalesFollowup, today: string): 'closed' | 'unplanned' | 'overdue' | 'today' | 'scheduled' {
  if (isClosed(v.stage)) return 'closed';
  if (!v.ownerName || !v.nextAction || !v.nextContactOn) return 'unplanned';
  return v.nextContactOn < today ? 'overdue' : v.nextContactOn === today ? 'today' : 'scheduled';
}
export function salesSummary(items: SalesFollowup[], today: string) {
  return { total: items.length, won: items.filter(v => v.stage === 'won').length,
    overdue: items.filter(v => followupFlag(v, today) === 'overdue').length,
    unplanned: items.filter(v => followupFlag(v, today) === 'unplanned').length,
    pipeline: items.filter(v => v.stage === 'proposal').reduce((sum, v) => sum + (v.proposalAmount ?? 0), 0),
    collected: items.reduce((sum, v) => sum + v.collectedAmount, 0), minutes: items.reduce((sum, v) => sum + v.spentMinutes, 0) };
}
/** Admin replies to the customer's phone. This is not the public inbound DK number. */
export function customerWhatsappHref(phone: string, message: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^0[1-9]\d{8}$/.test(digits)) digits = `994${digits.slice(1)}`;
  return /^[1-9]\d{6,14}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
