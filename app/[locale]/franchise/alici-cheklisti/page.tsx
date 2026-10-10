import BuyerChecklist from '@/components/franchise/BuyerChecklist';
import PageBack from '@/components/inner/PageBack';

export default function BuyerChecklistPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <PageBack to="franchise" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BuyerChecklist />
      </div>
    </div>
  );
}
