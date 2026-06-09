import LaunchCampaignBanner from '@/components/LaunchCampaignBanner';
import FaturalarModule from '@/app/dashboard/faturalar/page';

// Member-facing invoice (Fatura) module. Reuses the invoice UI; data is
// session-scoped by /api/invoices (SEC-P0 #318), so each member sees only
// their own invoices. Launch banner on top (free until campaign end + grace).
export default function B2BFaturalarPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <LaunchCampaignBanner />
      </div>
      <FaturalarModule />
    </div>
  );
}
