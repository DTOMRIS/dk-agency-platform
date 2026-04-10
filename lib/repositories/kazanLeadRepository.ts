import { neon } from '@neondatabase/serverless';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { getDatabaseUrlOrNull } from '@/lib/db/runtime';
import {
  kazanBusinessTypeEnum,
  kazanLeadIntentEnum,
  kazanLeadStatusEnum,
  kazanLeads,
} from '@/lib/db/schema';

export type KazanBusinessType = (typeof kazanBusinessTypeEnum.enumValues)[number];
export type KazanLeadIntent = (typeof kazanLeadIntentEnum.enumValues)[number];
export type KazanLeadStatus = (typeof kazanLeadStatusEnum.enumValues)[number];
export type KazanLeadConversation = Array<{ role: string; content: string }>;

export type CreateKazanLeadInput = {
  name: string;
  phone: string;
  email?: string;
  businessType: KazanBusinessType;
  conversationContext: KazanLeadConversation;
  intent: KazanLeadIntent;
};

export type UpdateKazanLeadInput = {
  id: string;
  whatsappHandoff?: boolean;
  meetingRequested?: boolean;
  status?: KazanLeadStatus;
};

export type GetKazanLeadsFilters = {
  status?: string | null;
  intent?: string | null;
  businessType?: string | null;
};

const validBusinessTypes = ['restoran', 'kafe', 'franchise', 'diger'] as const;
const validIntents = ['food_cost', 'pnl', 'aqta', 'delivery', 'general'] as const;
const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'dismissed'] as const;

let ensured = false;

export function detectKazanIntent(text: string): KazanLeadIntent {
  const value = text.toLowerCase();
  if (value.includes('food') || value.includes('cost') || value.includes('maya')) return 'food_cost';
  if (value.includes('p&l') || value.includes('pnl') || value.includes('mənfəət') || value.includes('menfeet')) return 'pnl';
  if (value.includes('aqta') || value.includes('gigiyena')) return 'aqta';
  if (value.includes('delivery') || value.includes('wolt') || value.includes('bolt')) return 'delivery';
  return 'general';
}

export function normalizeBusinessType(value: string): KazanBusinessType {
  return validBusinessTypes.includes(value as KazanBusinessType) ? (value as KazanBusinessType) : 'diger';
}

export function normalizeIntent(value: string): KazanLeadIntent {
  return validIntents.includes(value as KazanLeadIntent) ? (value as KazanLeadIntent) : 'general';
}

export function normalizeStatus(value: string): KazanLeadStatus {
  return validStatuses.includes(value as KazanLeadStatus) ? (value as KazanLeadStatus) : 'new';
}

export async function ensureKazanLeadsTable() {
  if (ensured) return;
  const databaseUrl = getDatabaseUrlOrNull();
  if (!databaseUrl) return;

  const raw = neon(databaseUrl);
  await raw`
    DO $$ BEGIN
      CREATE TYPE kazan_business_type AS ENUM ('restoran', 'kafe', 'franchise', 'diger');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  await raw`
    DO $$ BEGIN
      CREATE TYPE kazan_lead_intent AS ENUM ('food_cost', 'pnl', 'aqta', 'delivery', 'general');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  await raw`
    DO $$ BEGIN
      CREATE TYPE kazan_lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'dismissed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  await raw`
    CREATE TABLE IF NOT EXISTS kazan_leads (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(150) NOT NULL,
      phone varchar(30) NOT NULL,
      email varchar(255),
      business_type kazan_business_type NOT NULL,
      conversation_context jsonb,
      intent kazan_lead_intent NOT NULL DEFAULT 'general',
      status kazan_lead_status NOT NULL DEFAULT 'new',
      whatsapp_handoff boolean NOT NULL DEFAULT false,
      meeting_requested boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `;
  ensured = true;
}

export async function createKazanLead(input: CreateKazanLeadInput) {
  if (!dbAvailable || !db) throw new Error('DATABASE_URL yoxdur.');
  await ensureKazanLeadsTable();
  const [lead] = await db
    .insert(kazanLeads)
    .values({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      businessType: input.businessType,
      conversationContext: input.conversationContext.slice(-3),
      intent: input.intent,
    })
    .returning();
  return lead;
}

export async function updateKazanLead(input: UpdateKazanLeadInput) {
  if (!dbAvailable || !db) throw new Error('DATABASE_URL yoxdur.');
  await ensureKazanLeadsTable();
  const values: Partial<typeof kazanLeads.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (typeof input.whatsappHandoff === 'boolean') values.whatsappHandoff = input.whatsappHandoff;
  if (typeof input.meetingRequested === 'boolean') values.meetingRequested = input.meetingRequested;
  if (input.status) values.status = input.status;

  const [lead] = await db.update(kazanLeads).set(values).where(eq(kazanLeads.id, input.id)).returning();
  return lead;
}

export async function getKazanLeads(filters: GetKazanLeadsFilters = {}) {
  if (!dbAvailable || !db) return [];
  await ensureKazanLeadsTable();

  const conditions = [];
  if (filters.status && filters.status !== 'all') conditions.push(eq(kazanLeads.status, normalizeStatus(filters.status)));
  if (filters.intent && filters.intent !== 'all') conditions.push(eq(kazanLeads.intent, normalizeIntent(filters.intent)));
  if (filters.businessType && filters.businessType !== 'all') {
    conditions.push(eq(kazanLeads.businessType, normalizeBusinessType(filters.businessType)));
  }

  const query = db.select().from(kazanLeads);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;

  return filtered.orderBy(desc(kazanLeads.createdAt)).limit(100);
}

export async function getNewKazanLeadCount() {
  if (!dbAvailable || !db) return 0;
  await ensureKazanLeadsTable();
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kazanLeads)
    .where(eq(kazanLeads.status, 'new'));
  return result[0]?.count || 0;
}
