// public-ok: legacy RSS address — TASK-0530: now the real approved-news feed (before: static sample
// stories from lib/data/newsroomFeed). /api/rss/xeberler/[locale] passes ?locale= through to this.
export const dynamic = 'force-dynamic';
export { GET } from '@/app/api/rss/haberler/route';
