/**
 * Usage: npx tsx scripts/admin/reset-user-password.ts <email> <new-password>
 * Example: npx tsx scripts/admin/reset-user-password.ts dogantomris@gmail.com MyNewPass123
 */
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '../../lib/db';
import { users } from '../../lib/db/schema';

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>');
    process.exit(1);
  }

  if (!dbAvailable || !db) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const user = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .then((rows) => rows[0]);

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const passwordHash = await hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  console.log(`Password updated for ${user.email} (id=${user.id}, name=${user.name})`);
}

main().catch(console.error);
