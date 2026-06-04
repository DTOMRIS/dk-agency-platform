import OtaReadinessQuiz from '@/components/toolkit/OtaReadinessQuiz';

export default function OtaReadinessPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <OtaReadinessQuiz />
      </div>
    </div>
  );
}
