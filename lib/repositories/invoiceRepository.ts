import { and, desc, eq, gte, ilike, inArray, lte, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import {
  invoices,
  invoiceItems,
  invoiceCategories,
  invoiceImports,
  invoiceCategoryRules,
} from '@/lib/db/schema';

// ── Types ───────────────────────────────────────────────────────────

export interface InvoiceFilters {
  userId?: number;
  status?: string | null;
  source?: string | null;
  supplierName?: string | null;
  categoryId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  query?: string | null;
  limit?: number;
  offset?: number;
}

export interface InvoiceItemInput {
  categoryId?: number | null;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number; // qəpiklə
  totalPrice: number; // qəpiklə
  sortOrder?: number;
  isEdited?: boolean;
}

export interface CreateInvoiceInput {
  userId?: number;
  supplierName: string;
  supplierVoen?: string | null;
  invoiceNumber?: string | null;
  invoiceDate: string; // YYYY-MM-DD
  subtotal: number;
  vatAmount?: number;
  grandTotal: number;
  currency?: string;
  source: 'ocr_camera' | 'ocr_upload' | 'manual' | 'excel' | 'pdf';
  ocrProvider?: 'gemini' | 'deepseek-vision' | 'deepseek-text' | null;
  ocrConfidence?: number | null;
  originalFileUrl?: string | null;
  originalFileSize?: number | null;
  compressedSize?: number | null;
  notes?: string | null;
  branchId?: number | null;
  items: InvoiceItemInput[];
}

// ── Categories ──────────────────────────────────────────────────────

export async function getCategories() {
  if (!db) return [];
  return db
    .select()
    .from(invoiceCategories)
    .where(eq(invoiceCategories.isActive, true))
    .orderBy(invoiceCategories.sortOrder);
}

export async function createCategory(data: {
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}) {
  if (!db) return null;
  const [row] = await db.insert(invoiceCategories).values(data).returning();
  return row;
}

export async function updateCategory(
  id: number,
  data: Partial<{ name: string; slug: string; color: string; icon: string; sortOrder: number; isActive: boolean }>,
) {
  if (!db) return null;
  const [row] = await db
    .update(invoiceCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceCategories.id, id))
    .returning();
  return row;
}

export async function deleteCategory(id: number) {
  if (!db) return false;
  // "Sair" kateqoriyasına köçür (id=12 seed-də)
  await db
    .update(invoiceItems)
    .set({ categoryId: null })
    .where(eq(invoiceItems.categoryId, id));
  await db.delete(invoiceCategoryRules).where(eq(invoiceCategoryRules.categoryId, id));
  await db.delete(invoiceCategories).where(eq(invoiceCategories.id, id));
  return true;
}

export async function bulkDeleteCategories(ids: number[]) {
  if (!db || ids.length === 0) return false;
  await db
    .update(invoiceItems)
    .set({ categoryId: null })
    .where(inArray(invoiceItems.categoryId, ids));
  await db.delete(invoiceCategoryRules).where(inArray(invoiceCategoryRules.categoryId, ids));
  await db.delete(invoiceCategories).where(inArray(invoiceCategories.id, ids));
  return true;
}

// ── Invoices CRUD ───────────────────────────────────────────────────

export async function createInvoice(input: CreateInvoiceInput) {
  if (!db) return null;

  const { items, ...invoiceData } = input;

  const [invoice] = await db
    .insert(invoices)
    .values({
      userId: invoiceData.userId,
      supplierName: invoiceData.supplierName,
      supplierVoen: invoiceData.supplierVoen,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      subtotal: invoiceData.subtotal,
      vatAmount: invoiceData.vatAmount ?? 0,
      grandTotal: invoiceData.grandTotal,
      currency: invoiceData.currency ?? 'AZN',
      source: invoiceData.source,
      ocrProvider: invoiceData.ocrProvider,
      ocrConfidence: invoiceData.ocrConfidence,
      originalFileUrl: invoiceData.originalFileUrl,
      originalFileSize: invoiceData.originalFileSize,
      compressedSize: invoiceData.compressedSize,
      notes: invoiceData.notes,
      branchId: invoiceData.branchId,
    })
    .returning();

  if (items.length > 0) {
    await db.insert(invoiceItems).values(
      items.map((item, i) => ({
        invoiceId: invoice.id,
        categoryId: item.categoryId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sortOrder: item.sortOrder ?? i,
        isEdited: item.isEdited ?? false,
      })),
    );
  }

  return invoice;
}

export async function getInvoices(filters: InvoiceFilters = {}) {
  if (!db) return { rows: [], total: 0 };

  const conditions = [];

  if (filters.userId) conditions.push(eq(invoices.userId, filters.userId));
  if (filters.status) conditions.push(eq(invoices.status, filters.status as 'draft'));
  if (filters.source) conditions.push(eq(invoices.source, filters.source as 'manual'));
  if (filters.dateFrom) conditions.push(gte(invoices.invoiceDate, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(invoices.invoiceDate, filters.dateTo));
  if (filters.query) {
    conditions.push(ilike(invoices.supplierName, `%${filters.query}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(where),
  ]);

  return { rows, total: countResult[0]?.count ?? 0 };
}

export async function getInvoiceById(id: number) {
  if (!db) return null;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id));

  if (!invoice) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id))
    .orderBy(invoiceItems.sortOrder);

  return { ...invoice, items };
}

export async function updateInvoice(
  id: number,
  data: Partial<{
    supplierName: string;
    supplierVoen: string | null;
    invoiceNumber: string | null;
    invoiceDate: string;
    subtotal: number;
    vatAmount: number;
    grandTotal: number;
    status: 'draft' | 'confirmed' | 'disputed' | 'archived';
    notes: string | null;
    confirmedAt: Date;
    confirmedBy: number;
  }>,
) {
  if (!db) return null;
  const [row] = await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return row;
}

export async function confirmInvoice(id: number, userId: number) {
  return updateInvoice(id, {
    status: 'confirmed',
    confirmedAt: new Date(),
    confirmedBy: userId,
  });
}

export async function deleteInvoice(id: number) {
  if (!db) return false;
  // items cascade ilə silinir (onDelete: 'cascade')
  await db.delete(invoices).where(eq(invoices.id, id));
  return true;
}

export async function bulkDeleteInvoices(ids: number[]) {
  if (!db || ids.length === 0) return false;
  await db.delete(invoices).where(inArray(invoices.id, ids));
  return true;
}

// ── Invoice Items ───────────────────────────────────────────────────

export async function addInvoiceItem(invoiceId: number, item: InvoiceItemInput) {
  if (!db) return null;
  const [row] = await db
    .insert(invoiceItems)
    .values({
      invoiceId,
      categoryId: item.categoryId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      sortOrder: item.sortOrder ?? 0,
      isEdited: item.isEdited ?? false,
    })
    .returning();
  return row;
}

export async function updateInvoiceItem(
  itemId: number,
  data: Partial<InvoiceItemInput>,
) {
  if (!db) return null;
  const updateData: Record<string, unknown> = {};
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice;
  if (data.totalPrice !== undefined) updateData.totalPrice = data.totalPrice;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.isEdited !== undefined) updateData.isEdited = data.isEdited;

  const [row] = await db
    .update(invoiceItems)
    .set(updateData)
    .where(eq(invoiceItems.id, itemId))
    .returning();
  return row;
}

export async function deleteInvoiceItem(itemId: number) {
  if (!db) return false;
  await db.delete(invoiceItems).where(eq(invoiceItems.id, itemId));
  return true;
}

export async function bulkDeleteInvoiceItems(itemIds: number[]) {
  if (!db || itemIds.length === 0) return false;
  await db.delete(invoiceItems).where(inArray(invoiceItems.id, itemIds));
  return true;
}

export async function bulkAddInvoiceItems(invoiceId: number, items: InvoiceItemInput[]) {
  if (!db || items.length === 0) return [];
  const rows = await db
    .insert(invoiceItems)
    .values(
      items.map((item, i) => ({
        invoiceId,
        categoryId: item.categoryId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sortOrder: item.sortOrder ?? i,
        isEdited: item.isEdited ?? false,
      })),
    )
    .returning();
  return rows;
}

// ── Invoice Imports ─────────────────────────────────────────────────

export async function createImportLog(data: {
  userId?: number;
  source: 'excel' | 'pdf' | 'manual';
  fileName?: string;
  totalRows: number;
}) {
  if (!db) return null;
  const [row] = await db
    .insert(invoiceImports)
    .values({
      userId: data.userId,
      source: data.source,
      fileName: data.fileName,
      totalRows: data.totalRows,
    })
    .returning();
  return row;
}

export async function updateImportLog(
  id: number,
  data: Partial<{
    successRows: number;
    failedRows: number;
    errorLog: Array<{ row: number; field: string; value: string; error: string }>;
    status: 'processing' | 'completed' | 'failed';
  }>,
) {
  if (!db) return null;
  const [row] = await db
    .update(invoiceImports)
    .set(data)
    .where(eq(invoiceImports.id, id))
    .returning();
  return row;
}

// ── Category Rules (AI auto-mapping) ────────────────────────────────

export async function getCategoryRules() {
  if (!db) return [];
  return db.select().from(invoiceCategoryRules).orderBy(invoiceCategoryRules.keyword);
}

export async function findCategoryByKeyword(keyword: string) {
  if (!db) return null;
  const lower = keyword.toLowerCase().trim();
  const [rule] = await db
    .select()
    .from(invoiceCategoryRules)
    .where(ilike(invoiceCategoryRules.keyword, `%${lower}%`))
    .orderBy(desc(invoiceCategoryRules.confidence))
    .limit(1);
  return rule ?? null;
}

export async function addCategoryRule(data: {
  keyword: string;
  categoryId: number;
  createdBy?: string;
  confidence?: number;
}) {
  if (!db) return null;
  const [row] = await db
    .insert(invoiceCategoryRules)
    .values({
      keyword: data.keyword.toLowerCase().trim(),
      categoryId: data.categoryId,
      createdBy: data.createdBy ?? 'system',
      confidence: data.confidence ?? 1.0,
    })
    .returning();
  return row;
}

// ── Stats (Admin/Super Admin) ───────────────────────────────────────

export async function getInvoiceStats(userId?: number) {
  if (!db) return null;

  const where = userId ? eq(invoices.userId, userId) : undefined;

  const [stats] = await db
    .select({
      totalCount: sql<number>`count(*)::int`,
      totalAmount: sql<number>`coalesce(sum(${invoices.grandTotal}), 0)::int`,
      avgAmount: sql<number>`coalesce(avg(${invoices.grandTotal}), 0)::int`,
      draftCount: sql<number>`count(*) filter (where ${invoices.status} = 'draft')::int`,
      confirmedCount: sql<number>`count(*) filter (where ${invoices.status} = 'confirmed')::int`,
    })
    .from(invoices)
    .where(where);

  return stats;
}
