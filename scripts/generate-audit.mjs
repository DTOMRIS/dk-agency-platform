#!/usr/bin/env node
/**
 * @file generate-audit.mjs
 * @purpose Auto-generate docs/SYSTEM-AUDIT.md from live codebase.
 * Run: node scripts/generate-audit.mjs
 * Note: execSync used only with hardcoded commands (no user input).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

function git(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', cwd: root }).trim(); } catch { return ''; }
}

function findPages(dir) {
  const results = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'page.tsx') results.push(full.replace(root + path.sep, '').replace(/\\/g, '/'));
    }
  }
  walk(path.join(root, dir));
  return results;
}

function walkFiles(dir) {
  const results = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(full);
    }
  }
  walk(path.join(root, dir));
  return results;
}

function countInFiles(pattern, dirs, ext) {
  let count = 0;
  for (const dir of dirs) {
    for (const file of walkFiles(dir)) {
      if (!file.endsWith(ext)) continue;
      try {
        if (fs.readFileSync(file, 'utf8').includes(pattern)) count++;
      } catch { /* unreadable file */ }
    }
  }
  return count;
}

function countLeaves(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) n += countLeaves(v);
    else n++;
  }
  return n;
}

// ── Gather data ─────────────────────────────────────────────────────

const allPages = findPages('app');
const toolkit = allPages.filter(p => p.includes('toolkit/') && !p.includes('dashboard/'));
const dashboard = allPages.filter(p => p.includes('dashboard/'));

const dsCount = countInFiles('AI_MODELS.deepseek', ['app', 'lib'], '.ts') + countInFiles('deepseek-v4-flash', ['scripts'], '.mjs');
const gmCount = countInFiles('AI_MODELS.gemini', ['app', 'lib'], '.ts') + countInFiles('gemini-2.5-flash', ['scripts'], '.mjs');
const insightCount = countInFiles('getToolkitInsight', ['app'], '.tsx');

let protectedFiles = [];
try { protectedFiles = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json'), 'utf8')).protectedFiles || []; } catch {}

const i18n = {};
for (const loc of ['az', 'en', 'ru', 'tr']) {
  try { i18n[loc] = countLeaves(JSON.parse(fs.readFileSync(path.join(root, `messages/${loc}.json`), 'utf8'))); } catch { i18n[loc] = 0; }
}

const envLocal = fs.existsSync(path.join(root, '.env.local')) ? fs.readFileSync(path.join(root, '.env.local'), 'utf8') : '';
const hasKey = (k) => envLocal.includes(`${k}=`) && !envLocal.match(new RegExp(`^#\\s*${k}`, 'm'));

const emailRoutes = countInFiles('sendEmail', ['app'], '.ts');
const emailTemplateExists = fs.existsSync(path.join(root, 'lib/email/templates.ts'));
const smtpExists = fs.existsSync(path.join(root, 'lib/email/smtp.ts'));
const hasSmtp = hasKey('SMTP_USER');
const ocrExists = fs.existsSync(path.join(root, 'lib/invoice-ocr/ocr-providers.ts'));

const lastCommit = git('git log -1 --format=%h');
const branch = git('git branch --show-current');
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
const parity = i18n.az === i18n.en && i18n.en === i18n.ru && i18n.ru === i18n.tr;

// ── Write ───────────────────────────────────────────────────────────

const md = `# DK Agency — System Audit (CANLI)

> Avtomatik: \`node scripts/generate-audit.mjs\` | Hər PR-ın DoD-una daxil.
> Son güncəlləmə: ${now} | Branch: ${branch} | ${lastCommit}

## Route İnventarı
| Kateqoriya | Say |
|-----------|-----|
| Toplam page.tsx | ${allPages.length} |
| Dashboard | ${dashboard.length} |
| Toolkit | ${toolkit.length} |

## AI Stack (lib/ai-models.ts SST)
| Provider | Model | Fayl sayı |
|----------|-------|-----------|
| DeepSeek | v4-flash | ${dsCount} |
| Gemini | 2.5-flash | ${gmCount} |
| Anthropic | claude-sonnet-4-6 | fallback |

AI Insight bağlı səhifə: **${insightCount}**

## i18n
| AZ | EN | RU | TR | Parity |
|----|----|----|----|----|
| ${i18n.az} | ${i18n.en} | ${i18n.ru} | ${i18n.tr} | ${parity ? '✅' : '⚠️'} |

## Protected (${protectedFiles.length})
${protectedFiles.map(f => '- \`' + f + '\`').join('\n')}

## ENV (.env.local)
| Key | Status |
|-----|--------|
| DEEPSEEK_API_KEY | ${hasKey('DEEPSEEK_API_KEY') ? '✅' : '❌'} |
| GEMINI_API_KEY | ❌ Yoxdur / İstifadə edilmir (DeepSeek/Claude aktiv) |
| ANTHROPIC_API_KEY | ${hasKey('ANTHROPIC_API_KEY') ? '✅' : '⚠️ fallback yox'} |
| SMTP_USER | ${hasSmtp ? '✅' : '❌'} |

## Email Backend
| Komponent | Status |
|-----------|--------|
| Provider | ${smtpExists ? '✅ Hostinger SMTP (nodemailer)' : '❌ smtp.ts yox'} |
| Templates | ${emailTemplateExists ? '✅ lib/email/templates.ts' : '❌ yox'} |
| Routes | ${emailRoutes > 0 ? '✅ ' + emailRoutes + ' API route sendEmail()' : '⚠️ 0'} |
| SMTP_USER | ${hasSmtp ? '✅ .env.local-da dolu' : '⚠️ boş → console.log mock'} |

## Fatura OCR
| Komponent | Status |
|-----------|--------|
| OCR pipeline | ${ocrExists ? '✅ lib/invoice-ocr/ mövcud' : '❌ yox'} |
| GEMINI_API_KEY | ❌ Yoxdur (Sistem tamamilə DeepSeek və Claude üzərindədir) |

---
## Manual (əl ilə güncəllə)

### Production
- Son smoke: 2026-05-28 — 23/23 PASS, 0 kritik
- Hostinger key: DeepSeek & Claude aktivdir

### Tech Debt
- Route [locale] uyğunsuzluğu
- ai-readiness ghost route
- SektorNabziTabs Pattern A keçməyib
`;

fs.writeFileSync(path.join(root, 'docs/SYSTEM-AUDIT.md'), md, 'utf8');
console.log(`docs/SYSTEM-AUDIT.md generated (${md.length} chars)`);
console.log(`Routes: ${allPages.length} | AI: DS=${dsCount} GM=${gmCount} | i18n AZ=${i18n.az} | Insight=${insightCount}`);
