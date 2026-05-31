/**
 * Run migration 0009 — Member Profile V2
 * Usage: node --env-file=.env.local scripts/run-migration-0009.mjs
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const statements = [
  // Company / business identity
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS voen VARCHAR(20)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS sector VARCHAR(80)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS description TEXT`,

  // Contact person
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS authorized_person VARCHAR(150)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS position VARCHAR(100)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(30)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(30)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255)`,

  // Location
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(80)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS district VARCHAR(80)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS street_address TEXT`,

  // Bio & social
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS bio TEXT`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS instagram VARCHAR(120)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)`,

  // Visibility + approval
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}'`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'draft' NOT NULL`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,

  // Public slug + language
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS slug VARCHAR(150)`,
  sql`ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'az'`,
];

console.log('[migration-0009] Running 22 ALTER TABLE statements...');

let ok = 0;
let fail = 0;
for (let i = 0; i < statements.length; i++) {
  try {
    await statements[i];
    ok++;
    process.stdout.write('.');
  } catch (e) {
    fail++;
    console.error(`\nFAIL statement ${i}: ${e.message}`);
  }
}

// Indexes (separate since they need WHERE clause)
try {
  await sql`CREATE INDEX IF NOT EXISTS idx_member_profiles_approval ON member_profiles(approval_status) WHERE deleted_at IS NULL`;
  ok++;
  process.stdout.write('.');
} catch (e) {
  fail++;
  console.error(`\nFAIL approval index: ${e.message}`);
}

try {
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_member_profiles_slug ON member_profiles(slug) WHERE slug IS NOT NULL`;
  ok++;
  process.stdout.write('.');
} catch (e) {
  fail++;
  console.error(`\nFAIL slug index: ${e.message}`);
}

console.log(`\n[migration-0009] Done: ${ok} OK, ${fail} FAIL`);

// Verify
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'member_profiles' ORDER BY ordinal_position`;
console.log(`[migration-0009] member_profiles columns (${cols.length}):`);
console.log(cols.map(c => c.column_name).join(', '));
