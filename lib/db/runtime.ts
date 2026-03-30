export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseUrlOrNull() {
  return process.env.DATABASE_URL?.trim() || null;
}
