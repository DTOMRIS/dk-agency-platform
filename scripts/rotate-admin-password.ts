/**
 * @file scripts/rotate-admin-password.ts
 * @purpose Canlı DB-dəki admin/member şifrələrini ADMIN_SEED_PASSWORD / MEMBER_SEED_PASSWORD
 *          environment variable-larından oxuyaraq yeniləyir.
 * @usage
 *   ADMIN_SEED_PASSWORD=YeniŞifrə npx tsx scripts/rotate-admin-password.ts
 */

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '../lib/db/index';
import { users } from '../lib/db/schema';

async function rotateAdminPassword() {
  if (!dbAvailable || !db) {
    console.error('DATABASE_URL tapılmadı. Skript dayandırıldı.');
    process.exitCode = 1;
    return;
  }

  const adminPlain = process.env.ADMIN_SEED_PASSWORD;
  const memberPlain = process.env.MEMBER_SEED_PASSWORD;

  if (!adminPlain && !memberPlain) {
    console.error(
      'Heç bir şifrə mühit dəyişəni təyin edilməyib.\n' +
        'İstifadə: ADMIN_SEED_PASSWORD=... MEMBER_SEED_PASSWORD=... npx tsx scripts/rotate-admin-password.ts'
    );
    process.exitCode = 1;
    return;
  }

  if (adminPlain) {
    const adminHash = await hash(adminPlain, 12);
    const result = await db
      .update(users)
      .set({ passwordHash: adminHash })
      .where(eq(users.role, 'admin'))
      .returning({ email: users.email });

    console.log(
      `Admin şifrəsi yeniləndi: ${result.map((u) => u.email).join(', ')}`
    );
  }

  if (memberPlain) {
    const memberHash = await hash(memberPlain, 12);
    const result = await db
      .update(users)
      .set({ passwordHash: memberHash })
      .where(eq(users.role, 'member'))
      .returning({ email: users.email });

    console.log(
      `Member şifrəsi yeniləndi: ${result.map((u) => u.email).join(', ')}`
    );
  }

  console.log('Rotation tamamlandı.');
}

rotateAdminPassword().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
