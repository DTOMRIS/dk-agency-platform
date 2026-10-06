/**
 * POST /api/listings/admin/whatsapp-import (TASK-0497) — admin only.
 *
 *   { rawText, preview: true }  → DeepSeek parse + read-only duplicate check. No DB write.
 *   { items, confirm: true }    → creates drafts (status 'submitted') via createListing().
 *
 * Max 30 items per request. Contact data is returned to the admin only (this route is guarded).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireApiAdmin } from '@/lib/api/guards';
import { dbAvailable } from '@/lib/db';
import {
  WA_IMPORT_MAX_CHARS,
  WA_IMPORT_MAX_ITEMS,
  confirmItemSchema,
  deepSeekCaller,
  parseWhatsAppListings,
} from '@/lib/listings/whatsapp-import';
import { createImportedDrafts, findDuplicates } from '@/lib/listings/whatsapp-import-db';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const bodySchema = z.union([
  z.object({
    preview: z.literal(true),
    rawText: z.string().trim().min(10).max(WA_IMPORT_MAX_CHARS),
  }),
  z.object({
    confirm: z.literal(true),
    items: z.array(confirmItemSchema).min(1).max(WA_IMPORT_MAX_ITEMS),
  }),
]);

export async function POST(request: NextRequest) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Yanlış sorğu.', issues: parsed.error.issues.slice(0, 5) },
      { status: 400 }
    );
  }

  if ('preview' in parsed.data) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'DEEPSEEK_API_KEY təyin olunmayıb.' },
        { status: 503 }
      );
    }
    const result = await parseWhatsAppListings(parsed.data.rawText, deepSeekCaller(apiKey));
    let duplicates: Awaited<ReturnType<typeof findDuplicates>> = {};
    try {
      duplicates = await findDuplicates(result.items);
    } catch {
      // Duplicate check is advisory; a DB hiccup must not block the preview.
    }
    return NextResponse.json({
      success: true,
      preview: true,
      candidates: result.candidates,
      truncated: result.truncated,
      items: result.items.map((item, index) => ({ ...item, duplicate: duplicates[index] ?? null })),
      skipped: result.skipped,
      errors: result.errors,
    });
  }

  if (!dbAvailable) {
    return NextResponse.json(
      { success: false, error: 'Verilənlər bazası əlçatmazdır.' },
      { status: 503 }
    );
  }
  const { created, failed } = await createImportedDrafts(parsed.data.items, 'admin');
  return NextResponse.json(
    { success: failed.length === 0, confirm: true, created, failed },
    { status: created.length ? 201 : 500 }
  );
}
