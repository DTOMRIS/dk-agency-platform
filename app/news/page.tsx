import { redirect } from 'next/navigation';

/**
 * Legacy /news rendered invented sample news (components/constants NEWS_ITEMS).
 * Real, admin-approved news live at /haberler (TASK-0472).
 */
export default function LegacyNewsPage() {
  redirect('/haberler');
}
