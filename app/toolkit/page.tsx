/**
 * /toolkit — tool directory (v2 design, TASK-0514). Metadata lives in ./layout.tsx;
 * app/[locale]/toolkit/page.tsx re-renders this page for /ru, /en, /tr.
 */
import ToolkitDirectory from '@/components/toolkit/ToolkitDirectory';

export default function ToolkitPage() {
  return <ToolkitDirectory />;
}
