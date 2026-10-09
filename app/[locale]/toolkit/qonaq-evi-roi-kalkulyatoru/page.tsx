import GuesthouseRoiCalculator from '@/components/toolkit/GuesthouseRoiCalculator';
import ToolPageShell from '@/components/toolkit/ToolPageShell';

export default function GuesthouseRoiPage() {
  return (
    <ToolPageShell slug="qonaq-evi-roi-kalkulyatoru" showHeader maxWidth={1200}>
      <GuesthouseRoiCalculator />
    </ToolPageShell>
  );
}
