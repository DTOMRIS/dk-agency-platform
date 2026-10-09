import WhatsappTemplatesPanel from '@/components/toolkit/WhatsappTemplatesPanel';
import ToolPageShell from '@/components/toolkit/ToolPageShell';

export default function WhatsappTemplatesPage() {
  return (
    <ToolPageShell slug="whatsapp-template-paketi" maxWidth={768}>
      <WhatsappTemplatesPanel />
    </ToolPageShell>
  );
}
