/**
 * TASK-0567: Hostinger cron entry for RSS news collection (replaces the GitHub `news-collect.yml` schedule,
 * ~360 Actions min/month). hPanel → Cron Jobs → Node.js runs:
 *   node --env-file=<site>/hbuilds/config/.env <site>/hbuilds/current/nodejs/scripts/cron/news-collect.mjs
 * so CRON_SECRET comes from the site's own env — nobody pastes the secret into the cron command.
 * No dependencies (global fetch). Exit 1 on failure so the cron output shows it.
 */
const secret = process.env.CRON_SECRET;
const base = process.env.CRON_BASE_URL || 'https://dkagency.com.tr';
if (!secret) {
  process.stderr.write('news-collect cron: CRON_SECRET missing\n');
  process.exit(1);
}
try {
  const res = await fetch(`${base}/api/cron/news-collect`, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(170_000),
  });
  const body = await res.text();
  process.stdout.write(`${new Date().toISOString()} ${res.status} ${body.slice(0, 500)}\n`);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  process.stderr.write(`news-collect cron: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
