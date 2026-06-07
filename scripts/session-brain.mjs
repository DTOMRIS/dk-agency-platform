#!/usr/bin/env node
/**
 * SessionStart hook — injects the curated project brain + live git state into
 * the new session's context so Claude starts "smart" instead of from zero.
 *
 * Reads .claude/memory/CLAUDE-BRAIN.md and appends live repo state (branch,
 * recent commits, dirty files). Always prints valid JSON; never throws.
 *
 * Output schema: { "additionalContext": "<string>" } — matches the format
 * Claude Code SessionStart hooks consume.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const brainPath = path.join(root, '.claude', 'memory', 'CLAUDE-BRAIN.md');
const MAX_CHARS = 8000; // cap so we never bloat the context window

function safe(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

let brain = '';
try {
  if (fs.existsSync(brainPath)) brain = fs.readFileSync(brainPath, 'utf8');
} catch {
  brain = '';
}
if (brain.length > MAX_CHARS) brain = brain.slice(0, MAX_CHARS) + '\n…(truncated — see .claude/memory/CLAUDE-BRAIN.md)';

const branch = safe('git branch --show-current') || 'unknown';
const commits = safe('git log -3 --format=%s') || '(no commits)';
const dirty = safe('git status --porcelain');
const dirtyLine = dirty ? `${dirty.split('\n').length} uncommitted file(s)` : 'clean working tree';

// Read back the auto-journal (written at commit-time by scripts/auto-journal.mjs).
let journalTail = [];
try {
  const journalPath = path.join(root, 'docs', 'SESSION-JOURNAL.md');
  if (fs.existsSync(journalPath)) {
    journalTail = fs
      .readFileSync(journalPath, 'utf8')
      .split('\n')
      .filter((l) => l.startsWith('- '))
      .slice(-8);
  }
} catch {
  journalTail = [];
}

const live = [
  '',
  '## 🔴 CANLI REPO VƏZİYYƏTİ (session başı)',
  `- Branch: ${branch}`,
  `- Working tree: ${dirtyLine}`,
  '- Son 3 commit:',
  ...commits.split('\n').map((c) => `  - ${c}`),
  ...(journalTail.length
    ? ['- Son əməliyyatlar (auto-journal):', ...journalTail.map((l) => `  ${l}`)]
    : []),
].join('\n');

const context =
  (brain || '# CLAUDE BRAIN faylı tapılmadı (.claude/memory/CLAUDE-BRAIN.md)') + '\n' + live;

process.stdout.write(JSON.stringify({ additionalContext: context }));
