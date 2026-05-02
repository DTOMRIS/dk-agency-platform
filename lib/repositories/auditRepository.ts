import { and, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { restaurantAudits, restaurantAuditActions } from '@/lib/db/schema';

// ── Types ───────────────────────────────────────────────────────────

interface AuditAiAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{ priority: string; area: string; action: string; dkAgencyHelp: string }>;
  estimatedRevenue: { min: number; max: number; currency: string };
  redFlags: string[];
  whatsappTemplate: string;
  summary: string;
}

export interface CreateAuditInput {
  createdBy?: number;
  name: string;
  address?: string;
  phone?: string;
  category?: 'kafe' | 'restoran' | 'fast-food' | 'fine-dining';
  photos?: string[];
  socialLinks?: { instagram?: string; facebook?: string };
  deliveryLinks?: { wolt?: string; bolt?: string };
  menuPhotoUrl?: string | null;
  aiAnalysis?: AuditAiAnalysis | null;
  status?: 'draft' | 'sent' | 'meeting' | 'converted' | 'rejected';
  notes?: string;
}

export interface AuditFilters {
  status?: string | null;
  category?: string | null;
  query?: string | null;
  limit?: number;
  offset?: number;
}

// ── CRUD ────────────────────────────────────────────────────────────

export async function createAudit(input: CreateAuditInput) {
  if (!db) return null;

  const [row] = await db
    .insert(restaurantAudits)
    .values({
      createdBy: input.createdBy,
      name: input.name,
      address: input.address,
      phone: input.phone,
      category: input.category ?? 'restoran',
      photos: input.photos ?? [],
      socialLinks: input.socialLinks ?? {},
      deliveryLinks: input.deliveryLinks ?? {},
      menuPhotoUrl: input.menuPhotoUrl,
      aiAnalysis: input.aiAnalysis,
      status: input.status ?? 'draft',
      notes: input.notes,
    })
    .returning();

  // Log action
  if (row) {
    await db.insert(restaurantAuditActions).values({
      auditId: row.id,
      actionType: 'created',
      notes: `Audit yaradıldı: ${input.name}`,
    });
  }

  return row;
}

export async function getAudits(filters: AuditFilters = {}) {
  if (!db) return { rows: [], total: 0 };

  const conditions = [];
  if (filters.status) conditions.push(eq(restaurantAudits.status, filters.status as 'draft'));
  if (filters.category) conditions.push(eq(restaurantAudits.category, filters.category as 'kafe'));
  if (filters.query) conditions.push(ilike(restaurantAudits.name, `%${filters.query}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(restaurantAudits)
      .where(where)
      .orderBy(desc(restaurantAudits.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(restaurantAudits)
      .where(where),
  ]);

  return { rows, total: countResult[0]?.count ?? 0 };
}

export async function getAuditById(id: number) {
  if (!db) return null;

  const [audit] = await db
    .select()
    .from(restaurantAudits)
    .where(eq(restaurantAudits.id, id));

  if (!audit) return null;

  const actions = await db
    .select()
    .from(restaurantAuditActions)
    .where(eq(restaurantAuditActions.auditId, id))
    .orderBy(desc(restaurantAuditActions.date));

  return { ...audit, actions };
}

export async function updateAudit(
  id: number,
  data: Partial<{
    name: string;
    address: string;
    phone: string;
    status: 'draft' | 'sent' | 'meeting' | 'converted' | 'rejected';
    notes: string;
    aiAnalysis: AuditAiAnalysis | null;
    photos: string[];
    socialLinks: { instagram?: string; facebook?: string };
    deliveryLinks: { wolt?: string; bolt?: string };
    menuPhotoUrl: string | null;
  }>,
) {
  if (!db) return null;
  const [row] = await db
    .update(restaurantAudits)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(restaurantAudits.id, id))
    .returning();
  return row;
}

export async function deleteAudit(id: number) {
  if (!db) return false;
  await db.delete(restaurantAudits).where(eq(restaurantAudits.id, id));
  return true;
}

export async function bulkDeleteAudits(ids: number[]) {
  if (!db || ids.length === 0) return false;
  await db.delete(restaurantAudits).where(inArray(restaurantAudits.id, ids));
  return true;
}

// ── Actions ─────────────────────────────────────────────────────────

export async function addAuditAction(auditId: number, actionType: string, notes?: string) {
  if (!db) return null;
  const [row] = await db
    .insert(restaurantAuditActions)
    .values({ auditId, actionType, notes })
    .returning();
  return row;
}

// ── Stats ───────────────────────────────────────────────────────────

export async function getAuditStats() {
  if (!db) return null;

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      draft: sql<number>`count(*) filter (where ${restaurantAudits.status} = 'draft')::int`,
      sent: sql<number>`count(*) filter (where ${restaurantAudits.status} = 'sent')::int`,
      meeting: sql<number>`count(*) filter (where ${restaurantAudits.status} = 'meeting')::int`,
      converted: sql<number>`count(*) filter (where ${restaurantAudits.status} = 'converted')::int`,
      rejected: sql<number>`count(*) filter (where ${restaurantAudits.status} = 'rejected')::int`,
    })
    .from(restaurantAudits);

  return stats;
}
