#!/usr/bin/env node
/**
 * DK Agency — Pending xəbərləri təsdiq et, curatedNews-ə əlavə et
 *
 * İstifadə:
 *   node scripts/approve-news.mjs curated-abc123
 *   node scripts/approve-news.mjs curated-abc123 curated-def456
 *   node scripts/approve-news.mjs --all   # Hamısını təsdiq et
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CURATED_FILE = join(ROOT, 'lib', 'data', 'curatedNews.json');
const PENDING_FILE = join(ROOT, 'lib', 'data', 'pendingNews.json');

function load(path) {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return [];
  }
}

function save(path, items) {
  const dir = join(ROOT, 'lib', 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(items, null, 2), 'utf8');
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const approveAll = process.argv.includes('--all');

const curated = load(CURATED_FILE);
const pending = load(PENDING_FILE);

let toApprove;
if (approveAll) {
  toApprove = pending;
} else if (args.length === 0) {
  console.error('İstifadə: node scripts/approve-news.mjs <id> [id2 ...] və ya --all');
  process.exit(1);
} else {
  toApprove = args
    .map((id) => pending.find((p) => p.id === id))
    .filter(Boolean);
  const notFound = args.filter((id) => !pending.find((p) => p.id === id));
  if (notFound.length) {
    console.warn('[approve-news] Tapılmadı:', notFound.join(', '));
  }
}

if (toApprove.length === 0) {
  console.log('[approve-news] Təsdiq ediləcək xəbər yoxdur.');
  process.exit(0);
}

const newCurated = [...toApprove, ...curated].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 80);
const newPending = pending.filter((p) => !toApprove.some((a) => a.id === p.id));

save(CURATED_FILE, newCurated);
save(PENDING_FILE, newPending);

console.log(`[approve-news] ${toApprove.length} xəbər təsdiq edildi → curatedNews.json`);
toApprove.forEach((n) => console.log(`  - ${n.id}: ${(n.titleAz || n.title).slice(0, 50)}…`));
