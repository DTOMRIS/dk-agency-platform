#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const CRITICAL_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'app/layout.tsx',
  'app/globals.css',
  'postcss.config.mjs',
]);

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const MOJIBAKE_RE = /(Ã.|Å.|Æ.|â€¢|â€”|â€˜|â€™|â€œ|â€\x9d)/;

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function stagedFiles() {
  return git('git diff --cached --name-only').split('\n').filter(Boolean);
}

function trackedFiles() {
  return git('git ls-files').split('\n').filter(Boolean);
}

function shouldCheck(file, mode) {
  if (mode === '--staged') return true;
  if (CRITICAL_FILES.has(file)) return true;
  return file.startsWith('docs/');
}

const mode = process.argv.includes('--staged') ? '--staged' : '--critical';
const files = mode === '--staged' ? stagedFiles() : trackedFiles().filter((f) => shouldCheck(f, mode));
const offenders = [];

const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf']);

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  if (BINARY_EXT.has(ext)) continue;
  if (file.includes('verify-encoding')) continue;
  const buf = fs.readFileSync(file);
  if (buf.length >= 3 && buf[0] === BOM[0] && buf[1] === BOM[1] && buf[2] === BOM[2]) {
    offenders.push(`${file}: UTF-8 BOM is not allowed`);
    continue;
  }
  const txt = buf.toString('utf8');
  if (MOJIBAKE_RE.test(txt)) {
    offenders.push(`${file}: mojibake-like sequence detected`);
  }
}

if (offenders.length) {
  console.error('[verify-encoding] Failed:');
  for (const o of offenders) console.error(`- ${o}`);
  process.exit(1);
}

process.exit(0);
