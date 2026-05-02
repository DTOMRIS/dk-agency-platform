import { and, desc, eq, gte, ilike, inArray, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
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

// ── Food Cost Report ───────────────────────────────────────────────

export interface FoodCostFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;
  branchId?: number;
  userId?: number;
}

export interface CategoryCost {
  categoryId: number | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalAmount: number; // qəpiklə
  itemCount: number;
  percentage: number;
}

export interface FoodCostReport {
  categories: CategoryCost[];
  grandTotal: number;
  invoiceCount: number;
  dateFrom: string;
  dateTo: string;
}

export async function getFoodCostReport(filters: FoodCostFilters = {}): Promise<FoodCostReport | null> {
  if (!db) return null;

  const now = new Date();
  const dateFrom = filters.dateFrom ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const dateTo = filters.dateTo ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const invoiceConditions = [
    gte(invoices.invoiceDate, dateFrom),
    lte(invoices.invoiceDate, dateTo),
    eq(invoices.status, 'confirmed' as const),
  ];
  if (filters.branchId) invoiceConditions.push(eq(invoices.branchId, filters.branchId));
  if (filters.userId) invoiceConditions.push(eq(invoices.userId, filters.userId));

  // Kateqoriya üzrə xərc cəmləri
  const rows = await db
    .select({
      categoryId: invoiceItems.categoryId,
      categoryName: sql<string>`coalesce(${invoiceCategories.name}, 'Kateqoriyasız')`,
      categoryColor: sql<string>`coalesce(${invoiceCategories.color}, '#6B7280')`,
      categoryIcon: sql<string>`coalesce(${invoiceCategories.icon}, 'package')`,
      totalAmount: sql<number>`coalesce(sum(${invoiceItems.totalPrice}), 0)::int`,
      itemCount: sql<number>`count(${invoiceItems.id})::int`,
    })
    .from(invoiceItems)
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .leftJoin(invoiceCategories, eq(invoiceItems.categoryId, invoiceCategories.id))
    .where(and(...invoiceConditions))
    .groupBy(invoiceItems.categoryId, invoiceCategories.name, invoiceCategories.color, invoiceCategories.icon)
    .orderBy(sql`sum(${invoiceItems.totalPrice}) desc`);

  const grandTotal = rows.reduce((sum, r) => sum + r.totalAmount, 0);

  // Fatura sayı
  const [countRow] = await db
    .select({ count: sql<number>`count(distinct ${invoices.id})::int` })
    .from(invoices)
    .where(and(...invoiceConditions));

  const categories: CategoryCost[] = rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    categoryColor: r.categoryColor,
    categoryIcon: r.categoryIcon,
    totalAmount: r.totalAmount,
    itemCount: r.itemCount,
    percentage: grandTotal > 0 ? Math.round((r.totalAmount / grandTotal) * 10000) / 100 : 0,
  }));

  return {
    categories,
    grandTotal,
    invoiceCount: countRow?.count ?? 0,
    dateFrom,
    dateTo,
  };
}

export interface MonthlyTrendItem {
  month: string; // YYYY-MM
  totalAmount: number;
  invoiceCount: number;
}

export async function getMonthlyTrend(months: number = 6, filters: FoodCostFilters = {}): Promise<MonthlyTrendItem[]> {
  if (!db) return [];

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const dateFrom = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;

  const conditions = [
    gte(invoices.invoiceDate, dateFrom),
    eq(invoices.status, 'confirmed' as const),
  ];
  if (filters.branchId) conditions.push(eq(invoices.branchId, filters.branchId));
  if (filters.userId) conditions.push(eq(invoices.userId, filters.userId));

  const rows = await db
    .select({
      month: sql<string>`to_char(${invoices.invoiceDate}::date, 'YYYY-MM')`,
      totalAmount: sql<number>`coalesce(sum(${invoices.grandTotal}), 0)::int`,
      invoiceCount: sql<number>`count(*)::int`,
    })
    .from(invoices)
    .where(and(...conditions))
    .groupBy(sql`to_char(${invoices.invoiceDate}::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(${invoices.invoiceDate}::date, 'YYYY-MM')`);

  return rows;
}

export interface SupplierCostItem {
  supplierName: string;
  totalAmount: number;
  invoiceCount: number;
  avgAmount: number;
}

export async function getSupplierComparison(filters: FoodCostFilters = {}): Promise<SupplierCostItem[]> {
  if (!db) return [];

  const now = new Date();
  const dateFrom = filters.dateFrom ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const dateTo = filters.dateTo ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const conditions = [
    gte(invoices.invoiceDate, dateFrom),
    lte(invoices.invoiceDate, dateTo),
    eq(invoices.status, 'confirmed' as const),
  ];
  if (filters.branchId) conditions.push(eq(invoices.branchId, filters.branchId));
  if (filters.userId) conditions.push(eq(invoices.userId, filters.userId));

  const rows = await db
    .select({
      supplierName: invoices.supplierName,
      totalAmount: sql<number>`coalesce(sum(${invoices.grandTotal}), 0)::int`,
      invoiceCount: sql<number>`count(*)::int`,
      avgAmount: sql<number>`coalesce(avg(${invoices.grandTotal}), 0)::int`,
    })
    .from(invoices)
    .where(and(...conditions))
    .groupBy(invoices.supplierName)
    .orderBy(sql`sum(${invoices.grandTotal}) desc`)
    .limit(20);

  return rows;
}

export interface TopProductItem {
  name: string;
  categoryName: string;
  totalQuantity: number;
  unit: string;
  totalAmount: number;
  avgUnitPrice: number;
}

export async function getTopProducts(filters: FoodCostFilters = {}, limit: number = 20): Promise<TopProductItem[]> {
  if (!db) return [];

  const now = new Date();
  const dateFrom = filters.dateFrom ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const dateTo = filters.dateTo ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const conditions = [
    gte(invoices.invoiceDate, dateFrom),
    lte(invoices.invoiceDate, dateTo),
    eq(invoices.status, 'confirmed' as const),
  ];
  if (filters.branchId) conditions.push(eq(invoices.branchId, filters.branchId));
  if (filters.userId) conditions.push(eq(invoices.userId, filters.userId));

  const rows = await db
    .select({
      name: invoiceItems.name,
      categoryName: sql<string>`coalesce(${invoiceCategories.name}, 'Kateqoriyasız')`,
      totalQuantity: sql<number>`coalesce(sum(${invoiceItems.quantity}), 0)::real`,
      unit: invoiceItems.unit,
      totalAmount: sql<number>`coalesce(sum(${invoiceItems.totalPrice}), 0)::int`,
      avgUnitPrice: sql<number>`coalesce(avg(${invoiceItems.unitPrice}), 0)::int`,
    })
    .from(invoiceItems)
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .leftJoin(invoiceCategories, eq(invoiceItems.categoryId, invoiceCategories.id))
    .where(and(...conditions))
    .groupBy(invoiceItems.name, invoiceCategories.name, invoiceItems.unit)
    .orderBy(sql`sum(${invoiceItems.totalPrice}) desc`)
    .limit(limit);

  return rows;
}

// ── Product Price Lookup (Toolkit food-cost) ────────────────────────

export interface ProductPriceLookup {
  name: string;
  unit: string;
  avgUnitPrice: number; // qəpiklə
  minUnitPrice: number;
  maxUnitPrice: number;
  occurrences: number;
  lastSeen: string;
}

export async function lookupProductPrices(query?: string, limit: number = 20): Promise<ProductPriceLookup[]> {
  if (!db) return [];

  // Son 90 günün confirmed faturalarından
  const now = new Date();
  const dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const dateFromStr = `${dateFrom.getFullYear()}-${String(dateFrom.getMonth() + 1).padStart(2, '0')}-01`;

  const conditions = [
    gte(invoices.invoiceDate, dateFromStr),
    eq(invoices.status, 'confirmed' as const),
  ];

  const baseQuery = db
    .select({
      name: invoiceItems.name,
      unit: invoiceItems.unit,
      avgUnitPrice: sql<number>`coalesce(avg(${invoiceItems.unitPrice}), 0)::int`,
      minUnitPrice: sql<number>`coalesce(min(${invoiceItems.unitPrice}), 0)::int`,
      maxUnitPrice: sql<number>`coalesce(max(${invoiceItems.unitPrice}), 0)::int`,
      occurrences: sql<number>`count(*)::int`,
      lastSeen: sql<string>`max(${invoices.invoiceDate})`,
    })
    .from(invoiceItems)
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .where(and(...conditions, query ? ilike(invoiceItems.name, `%${query}%`) : undefined))
    .groupBy(invoiceItems.name, invoiceItems.unit)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return baseQuery;
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
