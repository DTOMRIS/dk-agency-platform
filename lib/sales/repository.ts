import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { kazanLeads } from '@/lib/db/schema';
import { kazanSalesFollowups } from './schema';
import { escapeSalesSearch, initialFollowup, legacyStatus, type SalesFollowup, type SalesInput } from './followup';

/** One PostgreSQL statement: versioned save, legacy status/date and note append succeed together. */
export function saveSalesQuery(v: SalesInput, at: string) {
  const note = JSON.stringify([{ at, text: v.addNote }]);
  return sql`
    WITH saved AS (
      INSERT INTO kazan_sales_followups (lead_id, stage, owner_name, next_action, service, proposal_amount, collected_amount, spent_minutes, loss_reason)
      SELECT id, ${v.stage}, ${v.ownerName}, ${v.nextAction}, ${v.service}, ${v.proposalAmount}::numeric, ${v.collectedAmount}::numeric, ${v.spentMinutes}::integer, ${v.lossReason}
      FROM kazan_leads WHERE id = ${v.leadId}::uuid AND (
        ${v.version}::integer = 0 OR EXISTS (SELECT 1 FROM kazan_sales_followups WHERE lead_id = ${v.leadId}::uuid)
      )
      ON CONFLICT (lead_id) DO UPDATE SET stage = EXCLUDED.stage, owner_name = EXCLUDED.owner_name,
        next_action = EXCLUDED.next_action, service = EXCLUDED.service, proposal_amount = EXCLUDED.proposal_amount,
        collected_amount = EXCLUDED.collected_amount, spent_minutes = EXCLUDED.spent_minutes,
        loss_reason = EXCLUDED.loss_reason, version = kazan_sales_followups.version + 1, updated_at = now()
      WHERE kazan_sales_followups.version = ${v.version}::integer
      RETURNING lead_id, version
    )
    UPDATE kazan_leads AS lead SET status = ${legacyStatus(v.stage)}::kazan_lead_status,
      next_contact_at = ${v.nextContactOn}::date,
      notes = CASE WHEN ${v.addNote} <> '' THEN coalesce(lead.notes, '[]'::jsonb) || ${note}::jsonb ELSE lead.notes END,
      updated_at = now()
    FROM saved WHERE lead.id = saved.lead_id RETURNING saved.version`;
}
export async function saveSalesFollowup(input: SalesInput) {
  if (!db) throw new Error('storage_unavailable');
  const result = await db.execute(saveSalesQuery(input, new Date().toISOString()));
  return result.rows.length > 0;
}

export type SalesFilters = { stage: string; intent: string; businessType: string; queue: string; search: string; page: number; today: string };
export const stageExpression = sql<string>`coalesce(${kazanSalesFollowups.stage}, CASE ${kazanLeads.status} WHEN 'converted' THEN 'won' WHEN 'dismissed' THEN 'lost' ELSE ${kazanLeads.status}::text END)`;
export function flagExpression(today: string) {
  return sql<string>`CASE WHEN ${stageExpression} IN ('won','lost') THEN 'closed'
    WHEN coalesce(${kazanSalesFollowups.ownerName}, '') = '' OR coalesce(${kazanSalesFollowups.nextAction}, '') = '' OR ${kazanLeads.nextContactAt} IS NULL THEN 'unplanned'
    WHEN ${kazanLeads.nextContactAt}::date < ${today}::date THEN 'overdue'
    WHEN ${kazanLeads.nextContactAt}::date = ${today}::date THEN 'today' ELSE 'scheduled' END`;
}
export async function getSalesBoardData(filters: SalesFilters) {
  if (!db) throw new Error('storage_unavailable');
  const conditions = [];
  if (filters.stage !== 'all') conditions.push(sql`${stageExpression} = ${filters.stage}`);
  if (filters.intent !== 'all') conditions.push(sql`${kazanLeads.intent}::text = ${filters.intent}`);
  if (filters.businessType !== 'all') conditions.push(sql`${kazanLeads.businessType}::text = ${filters.businessType}`);
  if (filters.queue !== 'all') conditions.push(sql`${flagExpression(filters.today)} = ${filters.queue}`);
  if (filters.search) {
    const q = `%${escapeSalesSearch(filters.search)}%`;
    conditions.push(or(ilike(kazanLeads.name, q), ilike(kazanLeads.phone, q), ilike(kazanLeads.email, q), ilike(kazanSalesFollowups.ownerName, q)));
  }
  const list = db.select({ ...getTableColumns(kazanLeads), sales: kazanSalesFollowups, matched: sql<number>`count(*) over()::int` })
    .from(kazanLeads).leftJoin(kazanSalesFollowups, eq(kazanLeads.id, kazanSalesFollowups.leadId)).where(and(...conditions))
    .orderBy(sql`CASE ${flagExpression(filters.today)} WHEN 'unplanned' THEN 0 WHEN 'overdue' THEN 1 WHEN 'today' THEN 2 WHEN 'scheduled' THEN 3 ELSE 4 END`, sql`${kazanLeads.nextContactAt} ASC NULLS LAST`, desc(kazanLeads.createdAt), kazanLeads.id)
    .limit(25).offset(filters.page * 25);
  const aggregate = salesSummaryQuery(filters.today);
  const [rows, result] = await Promise.all([list, db.execute(aggregate)]);
  const counts = result.rows[0] ?? {};
  const summary = Object.fromEntries(['total','won','overdue','unplanned','pipeline','collected','minutes'].map(k => [k, Number(counts[k] ?? 0)]));
  return { summary, totalMatches: Number(rows[0]?.matched ?? 0), items: rows.map(({ sales, matched, ...lead }) => { void matched; return ({ ...lead,
    sales: sales ? { ...initialFollowup(lead), stage: sales.stage as SalesFollowup['stage'], ownerName: sales.ownerName, nextAction: sales.nextAction,
      service: sales.service as SalesFollowup['service'], proposalAmount: sales.proposalAmount === null ? null : Number(sales.proposalAmount),
      collectedAmount: Number(sales.collectedAmount), spentMinutes: sales.spentMinutes, lossReason: sales.lossReason, version: sales.version } : initialFollowup(lead)
  }); }) };
}
export function salesSummaryQuery(today: string) {
  return sql`SELECT count(*)::int AS total,
    count(*) FILTER (WHERE ${stageExpression} = 'won')::int AS won,
    count(*) FILTER (WHERE ${flagExpression(today)} = 'overdue')::int AS overdue,
    count(*) FILTER (WHERE ${flagExpression(today)} = 'unplanned')::int AS unplanned,
    coalesce(sum(${kazanSalesFollowups.proposalAmount}) FILTER (WHERE ${stageExpression} = 'proposal'), 0) AS pipeline,
    coalesce(sum(${kazanSalesFollowups.collectedAmount}), 0) AS collected,
    coalesce(sum(${kazanSalesFollowups.spentMinutes}), 0) AS minutes
    FROM ${kazanLeads} LEFT JOIN ${kazanSalesFollowups} ON ${kazanLeads.id} = ${kazanSalesFollowups.leadId}`;
}
