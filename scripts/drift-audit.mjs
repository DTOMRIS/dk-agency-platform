#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  {
    name: 'Locale route exists',
    ok: fs.existsSync(path.join(root, 'app', '[locale]', 'page.tsx')),
    hint: 'Expected app/[locale]/page.tsx',
  },
  {
    name: 'i18n routing mapping exists',
    ok: fs.existsSync(path.join(root, 'lib', 'i18n', 'routing.ts')),
    hint: 'Expected lib/i18n/routing.ts',
  },
  {
    name: 'Sitemap route exists',
    ok:
      fs.existsSync(path.join(root, 'app', 'sitemap.ts')) ||
      fs.existsSync(path.join(root, 'app', 'sitemap.xml', 'route.ts')),
    hint: 'Expected app/sitemap.ts or app/sitemap.xml/route.ts',
  },
];

const failures = checks.filter((c) => !c.ok);
const reportPath = path.join(root, 'docs', 'DRIFT-REPORT.md');
const now = new Date().toISOString();
const report = `# Drift Report

- GeneratedAt: ${now}
- Status: ${failures.length ? 'FAIL' : 'PASS'}

${checks
  .map((c) => `- [${c.ok ? 'x' : ' '}] ${c.name}${c.ok ? '' : ` (${c.hint})`}`)
  .join('\n')}
`;

fs.writeFileSync(reportPath, report, 'utf8');
console.log(`[drift-audit] ${failures.length ? 'FAIL' : 'PASS'} -> docs/DRIFT-REPORT.md`);

if (failures.length) process.exit(1);
