#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const outFile = path.join(root, 'docs', 'STATE.md');
const buildStatus = process.env.BUILD_STATUS || 'UNKNOWN';

function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

function toRoute(file, suffix) {
  const rel = file.replace(appDir, '').replaceAll('\\', '/');
  const cleaned = rel.replace(suffix, '');
  return cleaned === '' ? '/' : cleaned;
}

const files = walk(appDir);
const pageRoutes = files
  .filter((f) => f.endsWith('/page.tsx') || f.endsWith('\\page.tsx'))
  .map((f) => toRoute(f, '/page.tsx'))
  .sort((a, b) => a.localeCompare(b));

const apiRoutes = files
  .filter((f) => f.includes('/api/') && (f.endsWith('/route.ts') || f.endsWith('\\route.ts')))
  .map((f) => toRoute(f, '/route.ts'))
  .sort((a, b) => a.localeCompare(b));

const i18nNamespaces = [];
const i18nDir = path.join(root, 'lib', 'i18n');
if (fs.existsSync(i18nDir)) {
  const i18nFiles = walk(i18nDir).filter((f) => f.endsWith('.json'));
  for (const f of i18nFiles) {
    i18nNamespaces.push(path.basename(f, '.json'));
  }
}
const uniqueNamespaces = [...new Set(i18nNamespaces)].sort((a, b) => a.localeCompare(b));

const now = new Date().toISOString();
const content = `# STATE

Auto-generated. Do not edit manually.

## Snapshot
- GeneratedAt: ${now}
- BuildStatus: ${buildStatus}

## Routes (${pageRoutes.length})
${pageRoutes.map((r) => `- ${r}`).join('\n')}

## API Routes (${apiRoutes.length})
${apiRoutes.map((r) => `- ${r}`).join('\n')}

## i18n Namespaces (${uniqueNamespaces.length})
${uniqueNamespaces.length ? uniqueNamespaces.map((n) => `- ${n}`).join('\n') : '- none detected'}
`;

fs.writeFileSync(outFile, content, 'utf8');
console.log(`[generate-state] Updated ${path.relative(root, outFile)}`);
