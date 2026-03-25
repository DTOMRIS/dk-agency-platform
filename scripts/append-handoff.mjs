#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'docs', 'HANDOFF.md');

const changed = process.env.HANDOFF_CHANGED || '';
const unchanged = process.env.HANDOFF_UNCHANGED || '';
const risks = process.env.HANDOFF_RISKS || '';
const next = process.env.HANDOFF_NEXT || '';
const actor = process.env.HANDOFF_ACTOR || 'unknown';

if (!changed || !unchanged || !risks || !next) {
  console.error('append-handoff: provide HANDOFF_CHANGED, HANDOFF_UNCHANGED, HANDOFF_RISKS, HANDOFF_NEXT');
  process.exit(1);
}

const now = new Date().toISOString();
const block = `

## ${now} — ${actor}
- Ne değişti:
${changed
  .split('\n')
  .filter(Boolean)
  .map((x) => `  - ${x}`)
  .join('\n')}
- Ne değişmedi:
${unchanged
  .split('\n')
  .filter(Boolean)
  .map((x) => `  - ${x}`)
  .join('\n')}
- Riskler:
${risks
  .split('\n')
  .filter(Boolean)
  .map((x) => `  - ${x}`)
  .join('\n')}
- Sonraki adım:
${next
  .split('\n')
  .filter(Boolean)
  .map((x) => `  - ${x}`)
  .join('\n')}
`;

fs.appendFileSync(out, block, 'utf8');
console.log('[append-handoff] Appended to docs/HANDOFF.md');
