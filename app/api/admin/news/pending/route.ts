import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
  const curated = load(join(DATA_DIR, 'curatedNews.json'));
  const pending = load(join(DATA_DIR, 'pendingNews.json'));
  return NextResponse.json({ curated, pending });
}
