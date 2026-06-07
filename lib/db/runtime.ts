import fs from 'fs';
import path from 'path';

// Load env files manually if DATABASE_URL is not set (e.g. during local script run)
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  for (const file of ['.env.local', '.env.production', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...parts] = trimmed.split('=');
            const value = parts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
          }
        }
      } catch (e) {
        // ignore errors
      }
      break;
    }
  }
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseUrlOrNull() {
  return process.env.DATABASE_URL?.trim() || null;
}
