import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATA_DIR = join(process.cwd(), 'lib', 'data');
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
  if (!existsSync(join(process.cwd(), 'lib', 'data'))) {
    mkdirSync(join(process.cwd(), 'lib', 'data'), { recursive: true });
  }
  writeFileSync(path, JSON.stringify(items, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids or id required' }, { status: 400 });
    }

    const pending = load(PENDING_FILE) as { id: string }[];
    const newPending = pending.filter((p) => !ids.includes(p.id));
    save(PENDING_FILE, newPending);

    return NextResponse.json({ ok: true, rejected: ids.length });
  } catch (e) {
    console.error('[reject]', e);
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
  }
}
