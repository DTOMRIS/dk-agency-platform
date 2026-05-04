import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

const DATA_DIR = join(process.cwd(), 'lib', 'data');

function load(path: string): unknown[] {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return [];
  }
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const curated = load(join(DATA_DIR, 'curatedNews.json'));
  const pending = load(join(DATA_DIR, 'pendingNews.json'));
  return NextResponse.json({ curated, pending });
}
