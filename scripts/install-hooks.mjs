#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'githooks');
const dstDir = path.join(root, '.git', 'hooks');

if (!fs.existsSync(dstDir)) {
  console.error('[install-hooks] .git/hooks not found. Run inside git repo root.');
  process.exit(1);
}

for (const file of fs.readdirSync(srcDir)) {
  const src = path.join(srcDir, file);
  const dst = path.join(dstDir, file);
  fs.copyFileSync(src, dst);
  fs.chmodSync(dst, 0o755);
  console.log(`[install-hooks] Installed ${file}`);
}
