import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import SettingsPageClient from '@/components/settings/SettingsPageClient';
import { db } from '@/lib/db';
import { loginLogs, users } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';

/**
 * TASK-0530: the login history came from the in-memory mock store (lib/auth/mock-state), so a real user
 * always saw an empty list. Now the last 10 rows of `login_logs` (written by /api/auth/login).
 */
async function getRecentLogins(email: string) {
  if (!db || !email) return [];
  try {
    const rows = await db
      .select({
        createdAt: loginLogs.createdAt,
        ipAddress: loginLogs.ipAddress,
        userAgent: loginLogs.userAgent,
        city: loginLogs.city,
        country: loginLogs.country,
        success: loginLogs.success,
      })
      .from(loginLogs)
      .innerJoin(users, eq(users.id, loginLogs.userId))
      .where(eq(users.email, email.trim().toLowerCase()))
      .orderBy(desc(loginLogs.createdAt))
      .limit(10);
    return rows.map((row) => ({
      createdAt: (row.createdAt ?? new Date()).toISOString(),
      ipAddress: row.ipAddress ?? '—',
      userAgent: row.userAgent ?? '—',
      city: row.city ?? '',
      country: row.country ?? '',
      success: row.success ?? true,
    }));
  } catch {
    return [];
  }
}

export default async function SettingsPage() {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    redirect('/auth/login?next=/settings');
  }

  const logs = await getRecentLogins(session.email);

  return <SettingsPageClient session={session} logs={logs} />;
}
