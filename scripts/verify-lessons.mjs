#!/usr/bin/env node
/**
 * verify-lessons — kodda/sənəddə istinad edilən hər `L-0XX` dərsi
 * `docs/LESSONS.md`-də başlıq kimi mövcud olmalıdır (TASK-0445).
 *
 * Niyə: CLAUDE.md «yeni task-dan əvvəl LESSONS.md oxu» deyir. Kod `// (L-037)`
 * yazıb dərs faylda yoxdursa, növbəti sessiya onu tapa bilmir və eyni səhvi
 * yenidən öyrənir (2026-09-13: L-013 və L-023 belə itmişdi). Bu yoxlama
 * `npm run dk:validate`-ə bağlıdır.
 *
 * Çıxış: 0 = hamısı var · 1 = itmiş dərs var (siyahı ilə).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LESSONS = path.join(ROOT, 'docs', 'LESSONS.md');
const SCAN_DIRS = ['app', 'lib', 'components', 'scripts', 'docs', '.claude'];
const EXT = new Set(['.ts', '.tsx', '.md', '.mjs', '.sh']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.next')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const defined = new Set(
  [...fs.readFileSync(LESSONS, 'utf8').matchAll(/^#{2,4}\s*(L-0\d{2})\b/gm)].map((m) => m[1])
);

const cited = new Map(); // id → ilk istinad yeri
for (const dir of SCAN_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs, [])) {
    if (path.resolve(file) === path.resolve(LESSONS)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\bL-0\d{2}\b/g)) {
      if (!cited.has(m[0])) cited.set(m[0], path.relative(ROOT, file));
    }
  }
}

const missing = [...cited.keys()].filter((id) => !defined.has(id)).sort();
if (missing.length === 0) {
  console.log(`verify-lessons: ${cited.size} istinad, hamısı LESSONS.md-də mövcuddur ✓`);
  process.exit(0);
}
console.error(`verify-lessons: ${missing.length} istinad edilən dərs LESSONS.md-də YOXDUR:`);
for (const id of missing) console.error(`  ${id}  (ilk istinad: ${cited.get(id)})`);
process.exit(1);
