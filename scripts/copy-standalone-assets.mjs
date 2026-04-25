import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const standaloneDir = join('.next', 'standalone');
const standaloneNextDir = join(standaloneDir, '.next');

if (!existsSync(standaloneDir)) {
  throw new Error('Standalone output missing. Run next build before copying assets.');
}

mkdirSync(standaloneNextDir, { recursive: true });

cpSync('public', join(standaloneDir, 'public'), { recursive: true });
cpSync(join('.next', 'static'), join(standaloneNextDir, 'static'), { recursive: true });

console.log('Copied public and .next/static into .next/standalone');
