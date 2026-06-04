import GuesthouseRoiCalculator from '@/components/toolkit/GuesthouseRoiCalculator';

export default function GuesthouseRoiPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <GuesthouseRoiCalculator />
      </div>
    </div>
  );
}
