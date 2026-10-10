#!/usr/bin/env node
/**
 * @file generate-system-map.mjs
 * @purpose TASK-0525 (owner 10.10: «bütün yapının tam haritası sistemdə olmalı — yamaq edirsiniz, sonra
 *          başqa səhifədə eynisi çıxır»). Writes docs/ARCHITECTURE/SYSTEM-MAP.md from the live code:
 *          every page (what it renders, design generation, auth, back button), every API route (guard),
 *          clusters of pages/components that do the same job, variants of shared UI (logo, header,
 *          back button) and an index of every doc / research report / ADR.
 *          Read it BEFORE touching a page: if the job already exists elsewhere, fix it there.
 * Run: node scripts/generate-system-map.mjs   (read-only scan; no network, no DB)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => p.replace(root + path.sep, '').replace(/\\/g, '/');
const read = (p) => {
  try {
    return fs.readFileSync(path.join(root, p), 'utf8');
  } catch {
    return '';
  }
};
const git = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: root }).trim();
  } catch {
    return '';
  }
};

function walk(dir, pick) {
  const out = [];
  const go = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git'].includes(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) go(full);
      else if (pick(e.name, full)) out.push(rel(full));
    }
  };
  go(path.join(root, dir));
  return out.sort();
}

// ── resolve imports (one level, @/ alias + relative) ─────────────────
function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec));
  else return null;
  for (const cand of [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`, `${base}/page.tsx`]) {
    if (fs.existsSync(path.join(root, cand)) && fs.statSync(path.join(root, cand)).isFile()) return cand;
  }
  return null;
}
const importsOf = (file, src) =>
  [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => resolveImport(file, m[1])).filter(Boolean);

// ── design markers ───────────────────────────────────────────────────
const V2 = [/inner\.module\.css/, /homeV2\.module\.css/, /MarketinqV2/, /ToolkitStudioLayout/, /from '@\/components\/home\/v2\/font'/, /bg-\[#F6F1E9\]/, /DkMark/];
const OLD = [/--dk-gold/, /--dk-navy/, /font-serif/, /Playfair/, /bg-\[#0a0a1a\]/i, /#F2F2F7/, /bg-gray-50/, /bg-\[var\(--dk-navy\)\]/];
function designOf(texts) {
  const all = texts.join('\n');
  const v2 = V2.some((r) => r.test(all));
  const old = OLD.some((r) => r.test(all));
  return v2 && old ? 'qarışıq' : v2 ? 'v2' : old ? 'köhnə' : '—';
}

// ── pages ────────────────────────────────────────────────────────────
const pageFiles = walk('app', (n) => n === 'page.tsx' || n === 'page.ts');
function urlOf(file) {
  let u = file.replace(/^app/, '').replace(/\/page\.tsx?$/, '') || '/';
  u = u.replace(/\/\([^)]+\)/g, '');
  const locale = u.startsWith('/[locale]');
  u = u.replace(/^\/\[locale\]/, '') || '/';
  return { url: u || '/', locale };
}
function areaOf(url) {
  const seg = url.split('/')[1] || 'home';
  if (seg === 'dashboard') return 'Admin (dashboard)';
  if (seg === 'b2b-panel') return 'Müştəri paneli (b2b-panel)';
  if (seg === 'toolkit') return 'Toolkit';
  if (seg === 'marketinq') return 'Marketinq (ictimai)';
  if (['auth', 'login', 'register', 'giris', 'qeydiyyat'].includes(seg)) return 'Giriş / qeydiyyat';
  if (['blog', 'xeberler', 'haberler', 'sektor-nebzi'].includes(seg)) return 'Bloq / xəbərlər';
  if (seg.startsWith('franchise') || seg === 'franchbook') return 'Franchise';
  if (['ilanlar', 'ilan-ver', 'elanlar'].includes(seg)) return 'Elanlar';
  if (seg === 'api') return 'API';
  return 'İctimai səhifələr';
}

const pages = new Map();
for (const file of pageFiles) {
  const { url, locale } = urlOf(file);
  const src = read(file);
  const entry = pages.get(url) ?? { url, files: [], root: false, locale: false };
  entry.files.push(file);
  if (locale) entry.locale = true;
  else entry.root = true;
  pages.set(url, entry);

  const reexport = src.match(/export\s+\{\s*default\s*\}\s+from\s+['"]([^'"]+)['"]/);
  const redirect = src.match(/redirect\(\s*(?:withLocalePrefix\([^,]+,\s*)?['"`]([^'"`]+)['"`]/);
  const comps = importsOf(file, src).filter((p) => p.startsWith('components/') || p.startsWith('app/'));
  const second = comps.flatMap((c) => importsOf(c, read(c)).filter((p) => p.startsWith('components/')));
  const texts = [src, ...comps.map(read), ...second.map(read)];
  const isMirror = !!reexport;
  if (!isMirror || !entry.kind) {
    entry.kind = redirect && src.length < 1500 ? `→ ${redirect[1]}` : isMirror ? 'güzgü' : 'səhifə';
    entry.main = comps.filter((c) => c.startsWith('components/')).slice(0, 3);
    entry.design = designOf(texts);
    entry.auth = /getAuthFromCookie|withAuth|requireAdminPage|requireAdmin\(|getServerMemberSession|checkToolAccess|\bauth\(\)/.test(src) ? 'səhifədə' : '';
    entry.back = /BackLink|Crumbs|ToolHeader|ArrowLeft|ChevronLeft|Geri qayıt|back_to_tools|backToList/.test(texts.join('\n')) ? '✓' : '✗';
    entry.azHard = (src.match(/['">][^'"<>{}\n]*[əıöüğşçƏİÖÜĞŞÇ][^'"<>{}\n]*['"<]/g) || []).length;
  }
}
// area-level guards (layouts)
const guardedAreas = walk('app', (n) => n === 'layout.tsx')
  .filter((f) => /redirect\(|requireAdmin|getServerMemberSession|getAuthFromCookie/.test(read(f)))
  .map((f) => urlOf(f.replace(/layout\.tsx$/, 'page.tsx')).url);
for (const p of pages.values()) {
  const g = guardedAreas.find((a) => a !== '/' && (p.url === a || p.url.startsWith(`${a}/`)));
  if (!p.auth && g) p.auth = `layout (${g})`;
}

// ── API routes ───────────────────────────────────────────────────────
const apiFiles = walk('app/api', (n) => /^route\.tsx?$/.test(n));
const GUARD = /requireApiAdmin|requireApiMember|getAuthFromCookie|withAuth|getServerMemberSession|requireAdmin|\bauth\(\)|CRON_SECRET|x-telegram-bot-api-secret-token|verifySignature|canAccessNewsAdmin|isAdmin\(/;
const apis = apiFiles.map((file) => {
  const src = read(file);
  const methods = [...src.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)/g)].map((m) => m[1]);
  const url = file.replace(/^app/, '').replace(/\/route\.tsx?$/, '');
  return { url, file, methods: [...new Set(methods)], guard: GUARD.test(src) };
});

// ── clusters: same job in several places ─────────────────────────────
const CLUSTERS = {
  'P&L / gəlir-xərc': /pnl|pl-sim|p-l|profit-loss|PLSimulator|Pnl/i,
  'ROI / reklam gəliri': /roi|reklam-roi|promosyon/i,
  'Food cost / yemək xərci': /food-?cost|yemek-xerci|FoodCost/i,
  'Şikayət': /sikayet|sikayat|complaint/i,
  'Menyu analitikası': /menu-?matrix|menyu|MenuAnalytics|menu-engineering/i,
  'Sezon': /sezon|season/i,
  'Lokasiya': /lokasyon|location/i,
  'Audit / KST / yoxlama': /restoran-audit|kst|auditor|yoxlama|aqta/i,
  'Elan / listing': /ilan|listing|elan/i,
  'Faktura / qaimə': /fatura|invoice/i,
  'Giriş / qeydiyyat': /login|register|auth\/|signin|giris|forgot-password|reset-password|verify-email|AuthShell/i,
  'Başabaş': /basabas|break-?even/i,
  'Persona': /persona/i,
};
const compFiles = walk('components', (n) => /\.tsx$/.test(n));
const clusterRows = Object.entries(CLUSTERS).map(([name, re]) => {
  const routes = [...pages.values()].filter((p) => re.test(p.url) && !p.url.startsWith('/api')).map((p) => p.url);
  const comps = compFiles.filter((f) => re.test(f));
  const api = apis.filter((a) => re.test(a.url)).map((a) => a.url);
  return { name, routes, comps, api };
});

// ── shared UI variants ───────────────────────────────────────────────
const codeFiles = [...walk('components', (n) => /\.tsx$/.test(n)), ...walk('app', (n) => /\.tsx$/.test(n))];
const variants = {
  'Logo (DK işarəsi)': codeFiles.filter((f) => /logo-mobil\.png|\/images\/logo|function BrandMark|<DkMark|>DK<\/span>/.test(read(f))),
  'Üst bar / header': codeFiles.filter((f) => /<header\b/.test(read(f)) && /components\//.test(f)),
  'Geri düyməsi komponenti': codeFiles.filter((f) => /export (default )?function \w*(Back|Crumbs)\w*\(/.test(read(f))),
  'Yan menyu (sidebar)': codeFiles.filter((f) => /Sidebar\.tsx$/.test(f)),
};

// ── docs index ───────────────────────────────────────────────────────
const docFiles = walk('docs', (n) => n.endsWith('.md')).filter((f) => !f.startsWith('docs/tasks/') && !f.includes('/archive/'));
const docRows = docFiles.map((f) => {
  const src = read(f);
  const h = (src.match(/^#\s+(.+)$/m) || [, ''])[1].trim().slice(0, 90);
  const mtime = git(`git log -1 --format=%cs -- "${f}"`) || '';
  return { f, h, mtime, lines: src.split('\n').length };
});
const taskCount = walk('docs/tasks', (n) => n.endsWith('.md')).length;

// ── write ────────────────────────────────────────────────────────────
const sha = git('git rev-parse --short HEAD');
const branch = git('git branch --show-current');
const byArea = new Map();
for (const p of [...pages.values()].sort((a, b) => a.url.localeCompare(b.url))) {
  const a = areaOf(p.url);
  if (!byArea.has(a)) byArea.set(a, []);
  byArea.get(a).push(p);
}
const designCount = (list) => {
  const c = { v2: 0, köhnə: 0, qarışıq: 0, '—': 0 };
  list.filter((p) => p.kind === 'səhifə').forEach((p) => (c[p.design] = (c[p.design] || 0) + 1));
  return c;
};
const esc = (s) => String(s).replace(/\|/g, '\\|');
const L = [];
L.push('# DK Agency — Sistem xəritəsi (avtomatik)');
L.push('');
L.push(`> \`node scripts/generate-system-map.mjs\` · ${new Date().toISOString().slice(0, 10)} · ${branch} · ${sha}`);
L.push('> **Qayda (Doğan 10.10.2026):** səhifəyə toxunmazdan əvvəl bu faylı oxu. Eyni işi görən başqa səhifə / komponent varsa, düzəlişi ORADA və ya ortaq komponentdə et — yeni yamaq yazma. İş bitəndə xəritəni yenidən yarat.');
L.push('');
L.push('## Xülasə');
const allPages = [...pages.values()];
const real = allPages.filter((p) => p.kind === 'səhifə');
const dc = designCount(allPages);
L.push(`- Ünvan: **${allPages.length}** (həqiqi səhifə ${real.length}, yönləndirmə ${allPages.filter((p) => p.kind.startsWith('→')).length}, güzgü ${allPages.filter((p) => p.kind === 'güzgü').length}) · page faylı ${pageFiles.length}`);
L.push(`- Dizayn (həqiqi səhifələr): v2 **${dc.v2}** · köhnə **${dc['köhnə']}** · qarışıq **${dc['qarışıq']}** · işarəsiz ${dc['—']}`);
L.push(`- Geri düyməsi yoxdur: **${real.filter((p) => p.back === '✗').length}** səhifə`);
L.push(`- API: **${apis.length}** route · qoruma işarəsi yoxdur: **${apis.filter((a) => !a.guard).length}** (siyahı aşağıda — ictimai olanlar normaldır, qalanı yoxlanmalıdır)`);
L.push(`- Sənəd: ${docRows.length} (+ ${taskCount} tapşırıq kartı)`);
L.push('');
L.push('## Eyni işi görən yerlər (dublikat riski)');
L.push('| İş | Səhifələr | Komponentlər | API |');
L.push('|---|---|---|---|');
for (const c of clusterRows) {
  L.push(`| ${c.name} | ${esc(c.routes.join(', ') || '—')} | ${c.comps.length}: ${esc(c.comps.slice(0, 8).map((f) => f.replace(/^components\//, '')).join(', '))}${c.comps.length > 8 ? ' …' : ''} | ${esc(c.api.join(', ') || '—')} |`);
}
L.push('');
L.push('## Ortaq UI variantları (bir olmalıdır)');
for (const [k, files] of Object.entries(variants)) {
  L.push(`- **${k}** (${files.length}): ${files.map((f) => `\`${f}\``).join(', ') || '—'}`);
}
L.push('');
L.push('## Səhifələr — bölmə üzrə');
L.push('Sütunlar: **Növ** (səhifə / → yönləndirmə / güzgü) · **Dizayn** (v2 = krem + Inter + inner/v2 tokenləri; köhnə = navy/gold/serif/boz fon) · **Giriş** · **Geri** · **AZ** = faylda sabit Azərbaycan mətni (i18n olmalıdır).');
for (const [area, list] of byArea) {
  const c = designCount(list);
  L.push('');
  L.push(`### ${area} — ${list.length} ünvan (v2 ${c.v2} · köhnə ${c['köhnə']} · qarışıq ${c['qarışıq']})`);
  L.push('| Ünvan | Növ | Dizayn | Giriş | Geri | AZ | Əsas komponent |');
  L.push('|---|---|---|---|---|---|---|');
  for (const p of list) {
    L.push(`| \`${esc(p.url)}\`${p.locale && p.root ? '' : p.locale ? ' (yalnız /az-ru…)' : ' (yalnız kök)'} | ${esc(p.kind)} | ${p.design} | ${esc(p.auth || '—')} | ${p.back} | ${p.azHard || ''} | ${esc((p.main || []).map((m) => m.replace(/^components\//, '')).join(', '))} |`);
  }
}
L.push('');
L.push('## API — qoruma işarəsi olmayan route-lar');
L.push('İctimai (lead forması, ictimai elan siyahısı, tracking, cron-un özü və s.) normaldır. Admin/üzv datası qaytaran varsa — dərhal düzəlt.');
L.push('| Route | Metod | Fayl |');
L.push('|---|---|---|');
for (const a of apis.filter((x) => !x.guard)) L.push(`| \`${esc(a.url)}\` | ${a.methods.join(', ')} | ${a.file} |`);
L.push('');
L.push('## Sənədlər, araşdırmalar, qərarlar — işə başlamazdan əvvəl oxu');
L.push('| Fayl | Başlıq | Son dəyişiklik | Sətir |');
L.push('|---|---|---|---|');
for (const d of docRows) L.push(`| \`${d.f}\` | ${esc(d.h)} | ${d.mtime} | ${d.lines} |`);
L.push('');

const outDir = path.join(root, 'docs/ARCHITECTURE');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'SYSTEM-MAP.md'), L.join('\n'));
console.log(`SYSTEM-MAP.md: ${allPages.length} ünvan, ${apis.length} API (${apis.filter((a) => !a.guard).length} qorumasız işarə), ${docRows.length} sənəd`);
