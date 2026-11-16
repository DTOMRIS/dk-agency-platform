import { pgTable, uuid, varchar, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';
import { kazanLeads } from '@/lib/db/schema';

// TASK-0560: additive extension; core lead schema/status enum remains compatible.
export const kazanSalesFollowups = pgTable('kazan_sales_followups', {
  leadId: uuid('lead_id').primaryKey().references(() => kazanLeads.id, { onDelete: 'cascade' }),
  stage: varchar('stage', { length: 24 }).notNull(),
  ownerName: varchar('owner_name', { length: 100 }).notNull().default(''),
  nextAction: text('next_action').notNull().default(''),
  service: varchar('service', { length: 24 }).notNull().default('undecided'),
  proposalAmount: numeric('proposal_amount', { precision: 12, scale: 2 }),
  collectedAmount: numeric('collected_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  spentMinutes: integer('spent_minutes').notNull().default(0),
  lossReason: text('loss_reason').notNull().default(''),
  version: integer('version').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
