import OtaReadinessQuiz from '@/components/toolkit/OtaReadinessQuiz';
import ToolPageShell from '@/components/toolkit/ToolPageShell';

export default function OtaReadinessPage() {
  return (
    <ToolPageShell slug="ota-hazirlig-testi" maxWidth={768}>
      <OtaReadinessQuiz />
    </ToolPageShell>
  );
}
