import HotelReadinessQuiz from '@/components/toolkit/HotelReadinessQuiz';
import ToolPageShell from '@/components/toolkit/ToolPageShell';

export default function HotelReadinessTestPage() {
  return (
    <ToolPageShell slug="otel-hazirlig-testi" maxWidth={768}>
      <HotelReadinessQuiz />
    </ToolPageShell>
  );
}
