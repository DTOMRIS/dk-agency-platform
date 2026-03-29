import { redirect } from 'next/navigation';
import SettingsPageClient from '@/components/settings/SettingsPageClient';
import { getLoginLogsForUser, findMockUserByEmail } from '@/lib/auth/mock-state';
import { getServerMemberSession } from '@/lib/members/server-session';

export default async function SettingsPage() {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    redirect('/auth/login?next=/settings');
  }

  const user = findMockUserByEmail(session.email);
  const logs = user ? getLoginLogsForUser(user.id) : [];

  return <SettingsPageClient session={session} logs={logs} />;
}
