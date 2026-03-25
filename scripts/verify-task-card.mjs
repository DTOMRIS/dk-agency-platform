#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TASK_RE = /(TASK-\d{4,})/;
const root = process.cwd();

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function checkTaskId(msg, source) {
  const m = msg.match(TASK_RE);
  if (!m) {
    throw new Error(`[verify-task-card] Missing Task Card ID in ${source}. Required pattern: TASK-0001`);
  }
  const id = m[1];
  const cardPath = path.join(root, 'docs', 'tasks', `${id}.md`);
  if (!fs.existsSync(cardPath)) {
    throw new Error(`[verify-task-card] Task Card file not found: docs/tasks/${id}.md`);
  }
}

try {
  if (process.argv.includes('--commit-msg')) {
    const i = process.argv.indexOf('--commit-msg');
    const file = process.argv[i + 1];
    const msg = fs.readFileSync(file, 'utf8');
    checkTaskId(msg, 'commit message');
    process.exit(0);
  }

  if (process.argv.includes('--range')) {
    const i = process.argv.indexOf('--range');
    const range = process.argv[i + 1];
    if (!range) throw new Error('[verify-task-card] --range requires git range argument');
    const log = git(`git log --format=%H:::%s ${range}`);
    if (!log) process.exit(0);
    for (const line of log.split('\n')) {
      const [sha, subject] = line.split(':::');
      if (!subject || subject.startsWith('Merge ')) continue;
      checkTaskId(subject, `commit ${sha.slice(0, 7)}`);
    }
    process.exit(0);
  }

  throw new Error('[verify-task-card] Provide --commit-msg <file> or --range <gitRange>');
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
