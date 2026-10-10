import FranchbookGenerator from '@/components/franchise/FranchbookGenerator';
import PageBack from '@/components/inner/PageBack';

export default function FranchbookGeneratorPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <PageBack to="franchise" />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <FranchbookGenerator />
      </div>
    </div>
  );
}
