import ReadinessQuiz from '@/components/franchise/ReadinessQuiz';

export default function ReadinessTestPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ReadinessQuiz />
      </div>
    </div>
  );
}
