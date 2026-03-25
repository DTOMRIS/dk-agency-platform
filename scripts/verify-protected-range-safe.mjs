#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

let range = 'origin/main...HEAD';
try {
  run('git rev-parse --verify origin/main');
} catch {
  try {
    run('git rev-parse --verify HEAD~1');
    range = 'HEAD~1...HEAD';
  } catch {
    console.log('[verify-protected-range-safe] No comparable range. Skipped.');
    process.exit(0);
  }
}

run(`node scripts/verify-protected.mjs --range ${range}`);
console.log(`[verify-protected-range-safe] OK (${range})`);
