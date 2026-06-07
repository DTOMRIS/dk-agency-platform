#!/usr/bin/env node
/**
 * auto-journal — git pre-commit step. Appends one compact line per commit to
 * docs/SESSION-JOURNAL.md and stages it so the memory entry travels inside the
 * same commit (persistent in git, survives ephemeral containers, no dirty state).
 *
 * Captured: timestamp · branch · task-id (from branch/message) · staged files.
 * Always exits 0 — journaling must never block a commit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const journal = path.join(root, 'docs', 'SESSION-JOURNAL.md');
const REL_JOURNAL = 'docs/SESSION-JOURNAL.md';

function safe(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

try {
  const branch = safe('git branch --show-current') || 'unknown';

  // Staged files for this commit, excluding the journal itself.
  const staged = safe('git diff --cached --name-only')
    .split('\n')
    .map((f) => f.trim())
    .filter((f) => f && f !== REL_JOURNAL);

  // Nothing meaningful staged → don't journal (avoids empty/self-only entries).
  if (staged.length === 0) process.exit(0);

  // Task id from branch (e.g. feat/task-0231-... → TASK-0231) or commit msg.
  let taskId = '';
  const fromBranch = branch.match(/task-(\d{3,4})/i);
  if (fromBranch) taskId = `TASK-${fromBranch[1]}`;
  if (!taskId) {
    const msg = safe('cat .git/COMMIT_EDITMSG 2>/dev/null') || safe('git log -1 --format=%s');
    const fromMsg = msg.match(/TASK-(\d{3,4})/i);
    if (fromMsg) taskId = `TASK-${fromMsg[1]}`;
  }

  const fileList =
    staged.length <= 6
      ? staged.join(', ')
      : `${staged.slice(0, 6).join(', ')} (+${staged.length - 6} more)`;

  const now = new Date().toISOString();
  const line = `- ${now} · \`${branch}\` · ${taskId || '—'} · ${staged.length} file(s): ${fileList}\n`;

  if (!fs.existsSync(journal)) {
    fs.writeFileSync(
      journal,
      '# Session Journal\n\nAuto-appended by `scripts/auto-journal.mjs` (git pre-commit). One line per commit. Read back at SessionStart by `scripts/session-brain.mjs`.\n\n',
      'utf8',
    );
  }
  fs.appendFileSync(journal, line, 'utf8');

  // Stage the journal so it rides inside this commit (persistent, no dirty state).
  execSync(`git add ${REL_JOURNAL}`, { stdio: 'ignore' });
} catch {
  // Never block a commit because of journaling.
}
process.exit(0);
