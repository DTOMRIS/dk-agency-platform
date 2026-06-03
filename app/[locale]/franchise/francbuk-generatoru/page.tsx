import FranchbookGenerator from '@/components/franchise/FranchbookGenerator';

export default function FranchbookGeneratorPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <FranchbookGenerator />
      </div>
    </div>
  );
}
