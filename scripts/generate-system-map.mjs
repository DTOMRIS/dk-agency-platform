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
// TASK-0530: (dev) route group = local design sandboxes, not part of the product.
const pageFiles = walk('app', (n) => n === 'page.tsx' || n === 'page.ts').filter((f) => !f.includes('/(dev)/'));
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

const BACK_RE = /BackLink|Crumbs|ToolHeader|ArrowLeft|ChevronLeft|Geri qayıt|back_to_tools|backToList|data-back-button/;
/** Layout files between the page and the app root, excluding the global root / [locale] layouts. */
function areaLayouts(pageFile) {
  const out = [];
  let dir = pageFile.replace(/\/page\.tsx?$/, '');
  while (dir.includes('/')) {
    dir = dir.slice(0, dir.lastIndexOf('/'));
    if (dir === 'app' || dir === 'app/[locale]') break;
    const l = `${dir}/layout.tsx`;
    if (fs.existsSync(l)) out.push(l);
  }
  return out;
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

  // TASK-0530: also `export { default, metadata } from …` (the root mirrors of [locale] pages were read as pages).
  const reexport = src.match(/export\s+\{\s*default\b[^}]*\}\s+from\s+['"]([^'"]+)['"]/);
  // TASK-0530: any redirect/permanentRedirect whose first path literal is the target (withLocale(normalizeLocale(…), '/x') too).
  const redirect = src.match(/(?:permanentRedirect|redirect)\([^;]*?['"`](\/[^'"`]*)['"`]/);
  const comps = importsOf(file, src).filter((p) => p.startsWith('components/') || p.startsWith('app/'));
  const second = comps.flatMap((c) => importsOf(c, read(c)).filter((p) => p.startsWith('components/')));
  const texts = [src, ...comps.map(read), ...second.map(read)];
  // TASK-0530: the shared back pill (v2 CSS) must not make an old page count as v2 / mixed.
  const NAV_ONLY = /components\/inner\/PageBack|components\/panel\/PanelBackBar/;
  const designComps = comps.filter((c) => !NAV_ONLY.test(c));
  const designSecond = designComps.flatMap((c) => importsOf(c, read(c)).filter((p) => p.startsWith('components/') && !NAV_ONLY.test(p)));
  const designTexts = [src, ...designComps.map(read), ...designSecond.map(read)];
  const isMirror = !!reexport;
  if (!isMirror || !entry.kind) {
    entry.kind = redirect && src.length < 1500 ? `→ ${redirect[1]}` : isMirror ? 'güzgü' : 'səhifə';
    entry.main = comps.filter((c) => c.startsWith('components/')).slice(0, 3);
    entry.design = designOf(designTexts);
    entry.auth = /getAuthFromCookie|withAuth|requireAdminPage|requireAdmin\(|getServerMemberSession|checkToolAccess|\bauth\(\)/.test(src) ? 'səhifədə' : '';
    // TASK-0530: a back control in an area layout (or a component it imports) counts for every page under it.
    const layoutTexts = areaLayouts(file).flatMap((l) => {
      const lc = importsOf(l, read(l)).filter((x) => x.startsWith('components/'));
      const lc2 = lc.flatMap((c) => importsOf(c, read(c)).filter((x) => x.startsWith('components/')));
      return [read(l), ...lc.map(read), ...lc2.map(read)];
    });
    entry.back = url === '/dashboard' || url === '/b2b-panel'
      ? '— (panel ana səhifəsi)'
      : BACK_RE.test([...texts, ...layoutTexts].join('\n')) ? '✓' : '✗';
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
const GUARD = /requireApiAdmin|requireApiMember|getAuthFromCookie|withAuth|getServerMemberSession|requireAdmin|\bauth\(\)|CRON_SECRET|x-telegram-bot-api-secret-token|verifySignature|canAccessNewsAdmin|isAdmin\(|NEWS_API_SECRET|validateWebhookSecret/;
const apis = apiFiles.map((file) => {
  const src = read(file);
  const methods = [...src.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)/g)].map((m) => m[1]);
  const url = file.replace(/^app/, '').replace(/\/route\.tsx?$/, '');
  // TASK-0530: `public-ok: <reason>` in the route file = public on purpose (reason shown in the map).
  const publicOk = src.match(/public-ok:\s*([^\n*]+)/)?.[1]?.trim() ?? null;
  return { url, file, methods: [...new Set(methods)], guard: GUARD.test(src), publicOk };
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

// ── fake behaviour scan (TASK-0528, owner 10.10: «hata bulmayacağım artık») ───────
// Patterns that make the UI claim something that did not happen. Each hit must be fixed or justified.
const FAKE_RULES = [
  { key: 'Saxta gözləmə (setTimeout ilə «uğurlu»)', re: /new Promise\(\s*\(?\s*r(?:esolve)?\s*\)?\s*=>\s*setTimeout\(\s*r(?:esolve)?\s*,\s*\d+/ },
  { key: 'Mock data dəyər kimi (tip yox)', re: /(?<!type\s)\bMOCK_[A-Z][A-Z_]+\b(?!\s*[:,]?\s*(?:type|interface))/ },
  { key: 'buildMock / mockData funksiyası', re: /\bbuildMock\w*\(|\bmockData\b|\bgenerateMock\w*\(/ },
  { key: 'Cavabı oxunmayan sorğu (await fetch nəticəsi atılır)', re: /^\s*await fetch\(/m },
  { key: 'TODO / gələcək API', re: /TODO[^\n]*(?:API|api|POST|backend|endpoint|real)/ },
  // TASK-0530: /api/news/[slug] served lib/data/mockNewsDB as «DK Agency News API» and /settings read the
  // in-memory mock-state store — a value import from a mock module is fake data reaching the user.
  { key: 'Saxta data mənbəyindən dəyər importu', re: /^import\s+(?!type\b)(?![^;]*\{\s*type\s)[^;]*from\s+'@\/lib\/(?:data\/mock\w*|auth\/mock-state)'/ },
];
const fakeHits = [];
const fakeOk = [];
// Justifications for protected files (no comment can be added there without owner approval).
const PROTECTED_OK = [
  { file: 'components/layout/Header.tsx', re: /api\/member\/session', \{ method: 'DELETE' \}/, why: 'logout: client session cleared and redirected either way (protected file)' },
];
// TASK-0530: API routes are scanned too (the fake news API was invisible before).
for (const f of codeFiles.filter((f) => !/mock|seed|fixtures|\.test\./i.test(f))) {
  const src = read(f);
  const lines = src.split('\n');
  for (const rule of FAKE_RULES) {
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments are not code
      const prot = PROTECTED_OK.find((x) => x.file === f && x.re.test(line));
      if (prot) {
        if (rule.re.test(line)) fakeOk.push({ rule: rule.key, file: f, line: i + 1, why: prot.why });
        return;
      }
      // a justified exception carries «fake-scan-ok: <reason>» on the same or the previous line
      if (/fake-scan-ok/.test(line) || /fake-scan-ok/.test(lines[i - 1] ?? '')) {
        if (rule.re.test(line)) fakeOk.push({ rule: rule.key, file: f, line: i + 1, why: ((line + ' ' + (lines[i - 1] ?? '')).match(/fake-scan-ok:\s*([^*\n]+)/) || [, ''])[1].trim().slice(0, 90) });
        return;
      }
      if (rule.key.startsWith('Mock data') && /^\s*import\b/.test(line)) return; // imports are not uses
      if (rule.key.startsWith('Mock data') && /\btype\s+Mock|Mock\w*\[\]|<Mock/.test(line) && !/MOCK_/.test(line)) return;
      if (rule.re.test(line)) fakeHits.push({ rule: rule.key, file: f, line: i + 1, text: line.trim().slice(0, 110) });
    });
  }
}

// ── dead controls (TASK-0528): <button> that does nothing, «#» / empty links — parsed with the TS compiler ──
let deadHits = [];
try {
  const ts = (await import('typescript')).default;
  for (const f of codeFiles.filter((x) => x.endsWith('.tsx') && !/\.test\.|e2e\//.test(x))) {
    const src = read(f);
    if (!/<button|href=/.test(src)) continue;
    const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sf);
        const attrs = node.attributes.properties;
        const names = attrs.filter(ts.isJsxAttribute).map((a) => a.name.getText(sf));
        const spread = attrs.some((a) => ts.isJsxSpreadAttribute(a));
        const attrText = (n) => {
          const at = attrs.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === n);
          return at && at.initializer ? at.initializer.getText(sf) : null;
        };
        const lineOf = () => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
        if (tag === 'button' && !spread) {
          const type = (attrText('type') || '').replace(/["'{}]/g, '');
          const handled = names.some((n) => /^on[A-Z]/.test(n)) || type === 'submit' || type === 'reset' || names.includes('form') || names.includes('formAction');
          // a button with no handler inside a <form> and no type defaults to submit — only flag explicit type="button"
          if (!handled && type === 'button') deadHits.push({ file: f, line: lineOf(), what: '<button type="button"> — onClick yoxdur' });
        }
        if ((tag === 'a' || tag === 'Link') && !spread) {
          const href = attrText('href');
          if (href !== null && /^["'{]*\s*(#|)\s*["'}]*$/.test(href) && !names.some((n) => /^on[A-Z]/.test(n))) {
            deadHits.push({ file: f, line: lineOf(), what: `<${tag} href=${href}> — heç yerə getmir` });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
} catch (err) {
  deadHits = [{ file: '—', line: 0, what: `skan alınmadı: ${String(err).slice(0, 80)}` }];
}

// ── unused components (TASK-0528): files under components/ that no other file imports ──
const allSrc = [...walk('app', (n) => /\.(tsx?|mjs)$/.test(n)), ...walk('components', (n) => /\.(tsx?|css)$/.test(n)), ...walk('lib', (n) => /\.tsx?$/.test(n)), ...walk('e2e', (n) => /\.tsx?$/.test(n))];
const importIndex = allSrc.map((f) => ({ f, src: read(f) }));
const unusedComponents = walk('components', (n) => /\.tsx?$/.test(n)).filter((file) => {
  const noExt = file.replace(/\.(tsx|ts)$/, '');
  const alias = `@/${noExt}`;
  const aliasDir = noExt.endsWith('/index') ? `@/${noExt.replace(/\/index$/, '')}` : null;
  const base = path.posix.basename(noExt);
  return !importIndex.some(({ f, src }) => {
    if (f === file) return false;
    if (src.includes(`'${alias}'`) || src.includes(`"${alias}"`) || (aliasDir && (src.includes(`'${aliasDir}'`) || src.includes(`"${aliasDir}"`)))) return true;
    // relative import from a neighbour: './X' or '../dir/X'
    if (new RegExp(`from ['"]\\.{1,2}/(?:[\\w.-]+/)*${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(src)) {
      const target = resolveImport(f, (src.match(new RegExp(`from ['"](\\.{1,2}/(?:[\\w.-]+/)*${base})['"]`)) || [])[1] || '');
      return target === file || target === null;
    }
    return false;
  });
});

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
L.push(`- API: **${apis.length}** route · yoxlanmamış qorumasız: **${apis.filter((a) => !a.guard && !a.publicOk).length}** · qəsdən ictimai (səbəbli): ${apis.filter((a) => !a.guard && a.publicOk).length}`);
L.push(`- Sənəd: ${docRows.length} (+ ${taskCount} tapşırıq kartı)`);
L.push('');
L.push('## Eyni işi görən yerlər (dublikat riski)');
L.push('| İş | Səhifələr | Komponentlər | API |');
L.push('|---|---|---|---|');
for (const c of clusterRows) {
  L.push(`| ${c.name} | ${esc(c.routes.join(', ') || '—')} | ${c.comps.length}: ${esc(c.comps.slice(0, 8).map((f) => f.replace(/^components\//, '')).join(', '))}${c.comps.length > 8 ? ' …' : ''} | ${esc(c.api.join(', ') || '—')} |`);
}
L.push('');
L.push('## Saxta davranış taraması (UI olmayan şeyi «oldu» deyir)');
L.push(`Cəmi **${fakeHits.length}** yer. Hər biri ya düzəldilir, ya da kodda niyə qaldığı yazılır.`);
L.push('| Qayda | Fayl:sətir | Kod |');
L.push('|---|---|---|');
for (const h of fakeHits) L.push(`| ${h.rule} | \`${h.file}:${h.line}\` | \`${esc(h.text).replace(/`/g, "'")}\` |`);
L.push('');
L.push(`Əsaslandırılmış istisnalar (\`fake-scan-ok\`): **${fakeOk.length}**`);
for (const h of fakeOk) L.push(`- \`${h.file}:${h.line}\` — ${esc(h.why || h.rule)}`);
L.push('');
L.push('## Ölü düymə / link (basanda heç nə olmur)');
L.push(`Cəmi **${deadHits.length}**.`);
for (const h of deadHits) L.push(`- \`${h.file}:${h.line}\` — ${esc(h.what)}`);
L.push('');
L.push('## İstifadə olunmayan komponentlər (heç bir fayl import etmir)');
L.push(`Cəmi **${unusedComponents.length}**. Silməzdən əvvəl dinamik import / string ilə çağırış yoxlanır.`);
for (const f of unusedComponents) L.push(`- \`${f}\``);
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
L.push('| Route | Metod | Fayl | Qəsdən ictimai — səbəb (`public-ok:`) |');
L.push('|---|---|---|---|');
for (const a of apis.filter((x) => !x.guard).sort((x, y) => Number(!!x.publicOk) - Number(!!y.publicOk))) L.push(`| \`${esc(a.url)}\` | ${a.methods.join(', ')} | ${a.file} | ${a.publicOk ? esc(a.publicOk) : '**yoxlanmayıb**'} |`);
L.push('');
L.push('## Sənədlər, araşdırmalar, qərarlar — işə başlamazdan əvvəl oxu');
L.push('| Fayl | Başlıq | Son dəyişiklik | Sətir |');
L.push('|---|---|---|---|');
for (const d of docRows) L.push(`| \`${d.f}\` | ${esc(d.h)} | ${d.mtime} | ${d.lines} |`);
L.push('');

const outDir = path.join(root, 'docs/ARCHITECTURE');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'SYSTEM-MAP.md'), L.join('\n'));
console.log(`SYSTEM-MAP.md: ${allPages.length} ünvan, ${apis.length} API (${apis.filter((a) => !a.guard && !a.publicOk).length} yoxlanmamış qorumasız), saxta davranış ${fakeHits.length}, ölü düymə/link ${deadHits.length}, istifadəsiz komponent ${unusedComponents.length}, ${docRows.length} sənəd`);
