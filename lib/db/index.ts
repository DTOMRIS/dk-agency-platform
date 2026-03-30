import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { getDatabaseUrlOrNull, hasDatabaseUrl } from './runtime';

const databaseUrl = getDatabaseUrlOrNull();
const sql = databaseUrl ? neon(databaseUrl) : null;

export const db = sql ? drizzle(sql, { schema }) : null;
export const dbAvailable = hasDatabaseUrl();
export { schema };
