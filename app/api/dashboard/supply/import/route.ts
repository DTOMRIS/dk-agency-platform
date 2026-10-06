/**
 * TASK-0498 — WhatsApp ixracını təhlil et (preview) / idxal et (commit). Yalnız admin.
 *
 * Bədən: multipart/form-data
 *   file   — `_chat.txt` (≤ 20 MB) və ya kiçik `.zip` (≤ 25 MB; böyük ZIP-dən
 *            brauzer `_chat.txt`-ni özü çıxarıb göndərir)
 *   months — 1 | 3 | 6 | 12 (default 6)
 *   group  — mənbə qrupun adı (boşdursa fayl adından təxmin olunur)
 *   mode   — 'preview' (heç nə yazmır) | 'commit'
 *
 * Məxfilik: mesaj mətni heç bir xarici xidmətə göndərilmir; təsnifat yerli
 * regex qaydaları ilədir. Mətn log-a yazılmır.
 */

import { inflateRawSync } from 'node:zlib';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireApiAdmin } from '@/lib/api/guards';
import { IMPORT_WINDOWS, SUPPLY_CATEGORY_KEYS, type SupplyCategory } from '@/lib/supply/categories';
import { dbUnavailable, supplyDb, supplyErrorResponse } from '@/lib/supply/api';
import { applyImport, previewAgainstDb, SupplyTablesMissingError } from '@/lib/supply/repository';
import {
  buildImportPlan,
  guessGroupName,
  parseWhatsAppChat,
  windowStart,
  type ImportPlan,
} from '@/lib/supply/wa-parser';
import { extractChatText, looksLikeZip, ZipError } from '@/lib/supply/zip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MAX_TEXT_BYTES = 20 * 1024 * 1024;
const MAX_ZIP_BYTES = 25 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_ZIP_BYTES + 1024 * 1024;
const SAMPLE_ROWS = 12;

const FieldsSchema = z.object({
  months: z.coerce
    .number()
    .int()
    .refine((value) => (IMPORT_WINDOWS as readonly number[]).includes(value))
    .default(6),
  group: z.string().trim().max(120).optional().default(''),
  mode: z.enum(['preview', 'commit']).default('preview'),
});

function countCategories(lists: string[][]): Record<SupplyCategory, number> {
  const counts = Object.fromEntries(SUPPLY_CATEGORY_KEYS.map((key) => [key, 0])) as Record<
    SupplyCategory,
    number
  >;
  for (const list of lists)
    for (const key of list) if (key in counts) counts[key as SupplyCategory] += 1;
  return counts;
}

function summarise(plan: ImportPlan, group: string) {
  return {
    group,
    since: plan.since,
    firstDate: plan.firstDate,
    lastDate: plan.lastDate,
    messagesTotal: plan.messagesTotal,
    messagesInWindow: plan.messagesInWindow,
    classCounts: plan.classCounts,
    reference: plan.reference,
    suppliers: {
      total: plan.suppliers.length,
      withPhone: plan.suppliers.filter((s) => s.phones.length > 0).length,
      offers: plan.suppliers.reduce((sum, s) => sum + s.messageHashes.length, 0),
      categories: countCategories(plan.suppliers.map((s) => s.categories)),
      sample: plan.suppliers.slice(0, SAMPLE_ROWS).map((s) => ({
        displayName: s.displayName,
        phones: s.phones.length,
        categories: s.categories,
        posts: s.messageHashes.length,
        lastSeen: s.lastSeen,
      })),
    },
    requests: {
      total: plan.requests.length,
      byType: plan.requests.reduce<Record<string, number>>((acc, r) => {
        acc[r.requestType] = (acc[r.requestType] ?? 0) + 1;
        return acc;
      }, {}),
      categories: countCategories(plan.requests.map((r) => r.categories)),
      sample: plan.requests.slice(0, SAMPLE_ROWS).map((r) => ({
        requesterName: r.requesterName,
        requestType: r.requestType,
        categories: r.categories,
        text: r.text.slice(0, 220),
        postedAt: r.postedAt,
      })),
    },
  };
}

async function readChatText(
  file: File
): Promise<{ text: string } | { error: string; status: number }> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (looksLikeZip(head)) {
    if (file.size > MAX_ZIP_BYTES) return { error: 'zip_too_large', status: 413 };
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const text = await extractChatText(
        {
          size: buffer.byteLength,
          read: async (offset, length) => buffer.subarray(offset, offset + length),
          inflateRaw: async (data) => inflateRawSync(data),
        },
        MAX_TEXT_BYTES
      );
      return { text };
    } catch (error) {
      if (error instanceof ZipError) {
        return { error: `zip_${error.code}`, status: error.code === 'too_large' ? 413 : 400 };
      }
      return { error: 'zip_not_zip', status: 400 };
    }
  }
  if (file.size > MAX_TEXT_BYTES) return { error: 'text_too_large', status: 413 };
  return { text: await file.text() };
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES)
    return NextResponse.json({ error: 'body_too_large' }, { status: 413 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'file_required' }, { status: 400 });
  }

  const fields = FieldsSchema.safeParse({
    months: form.get('months') ?? undefined,
    group: form.get('group') ?? undefined,
    mode: form.get('mode') ?? undefined,
  });
  if (!fields.success) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });

  const chat = await readChatText(file);
  if ('error' in chat) return NextResponse.json({ error: chat.error }, { status: chat.status });

  const provisional = parseWhatsAppChat(chat.text, '');
  if (provisional.length === 0)
    return NextResponse.json({ error: 'not_whatsapp_export' }, { status: 422 });

  const group = (fields.data.group || guessGroupName(file.name, provisional) || 'WhatsApp').slice(
    0,
    120
  );
  const messages = provisional.map((message) => ({ ...message, group }));
  const plan = buildImportPlan(messages, windowStart(fields.data.months));
  const summary = summarise(plan, group);

  const database = supplyDb();

  if (fields.data.mode === 'preview') {
    if (!database) return NextResponse.json({ ...summary, db: { state: 'unavailable' } });
    try {
      const status = await previewAgainstDb(database, plan);
      return NextResponse.json({ ...summary, db: { state: 'ready', ...status } });
    } catch (error) {
      if (error instanceof SupplyTablesMissingError) {
        return NextResponse.json({ ...summary, db: { state: 'tables_missing' } });
      }
      return supplyErrorResponse(error);
    }
  }

  if (!database) return dbUnavailable();
  try {
    const result = await applyImport(database, plan);
    return NextResponse.json({ ...summary, result });
  } catch (error) {
    return supplyErrorResponse(error);
  }
}
