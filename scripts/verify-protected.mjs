#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const settingsPath = path.join(root, '.claude', 'settings.json');

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function readProtectedFiles() {
  if (!fs.existsSync(settingsPath)) return [];
  const raw = fs.readFileSync(settingsPath, 'utf8');
  const json = JSON.parse(raw);
  return Array.isArray(json.protectedFiles) ? json.protectedFiles : [];
}

function getChangedFiles(mode) {
  if (mode === '--staged') {
    return git('git diff --cached --name-only').split('\n').filter(Boolean);
  }
  if (mode === '--range') {
    const range = process.argv[process.argv.indexOf('--range') + 1];
    if (!range) return [];
    return git(`git diff --name-only ${range}`).split('\n').filter(Boolean);
  }
  return git('git diff --name-only').split('\n').filter(Boolean);
}

const mode = process.argv.includes('--staged')
  ? '--staged'
  : process.argv.includes('--range')
    ? '--range'
    : '--worktree';

const allow = process.env.ALLOW_PROTECTED === '1';
const protectedFiles = readProtectedFiles();
const changed = getChangedFiles(mode);
const touched = changed.filter((f) => protectedFiles.includes(f.replaceAll('\\', '/')));

if (!touched.length) {
  process.exit(0);
}

if (allow) {
  console.log(`[verify-protected] ALLOW_PROTECTED=1, bypassed: ${touched.join(', ')}`);
  process.exit(0);
}

console.error('[verify-protected] Protected file change detected.');
console.error('Changed protected files:');
for (const f of touched) console.error(`- ${f}`);
console.error('Set ALLOW_PROTECTED=1 only for approved changes.');
process.exit(1);
