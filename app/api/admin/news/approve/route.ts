import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Node.js runtime required for fs (self-hosted / local)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATA_DIR = join(process.cwd(), 'lib', 'data');
const CURATED_FILE = join(DATA_DIR, 'curatedNews.json');
const PENDING_FILE = join(DATA_DIR, 'pendingNews.json');

function load(path: string): unknown[] {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return [];
  }
}

function save(path: string, items: unknown[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(items, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids or id required' }, { status: 400 });
    }

    const curated = load(CURATED_FILE) as { id: string; [k: string]: unknown }[];
    const pending = load(PENDING_FILE) as { id: string; [k: string]: unknown }[];

    const toApprove = pending.filter((p) => ids.includes(p.id));
    const newCurated = [...toApprove, ...curated]
      .sort((a, b) => new Date((b.date as string) || 0).getTime() - new Date((a.date as string) || 0).getTime())
      .slice(0, 80);
    const newPending = pending.filter((p) => !ids.includes(p.id));

    save(CURATED_FILE, newCurated);
    save(PENDING_FILE, newPending);

    return NextResponse.json({ ok: true, approved: toApprove.length });
  } catch (e) {
    console.error('[approve]', e);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
