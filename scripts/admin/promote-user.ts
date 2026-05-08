/**
 * Usage: npx tsx scripts/admin/promote-user.ts <email> [role]
 */
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '../../lib/db';
import { users } from '../../lib/db/schema';

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'admin';

  if (!email) {
    console.error('Usage: npx tsx scripts/promote-user.ts <email> [role]');
    process.exit(1);
  }
  if (!dbAvailable || !db) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const user = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .then((rows) => rows[0]);

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await db.update(users).set({ role }).where(eq(users.id, user.id));
  console.log(`${user.email}: role ${user.role} → ${role}`);
}

main().catch(console.error);
