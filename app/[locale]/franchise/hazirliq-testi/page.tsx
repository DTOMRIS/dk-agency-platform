import ReadinessQuiz from '@/components/franchise/ReadinessQuiz';
import PageBack from '@/components/inner/PageBack';

export default function ReadinessTestPage() {
  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <PageBack to="franchise" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ReadinessQuiz />
      </div>
    </div>
  );
}
