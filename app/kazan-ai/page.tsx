import Link from 'next/link';

export const metadata = {
  title: 'KAZAN AI Estimator | DK Agency',
  description: 'Rapid P&L estimation entry point for DK growth operations.',
};

export default function KazanAiPage() {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#101a27] text-[#f4f5f2] px-4 py-16">
      <div className="max-w-3xl mx-auto rounded-2xl border border-[#2d3a4d] bg-[#172538] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9eb6d1]">KAZAN AI</p>
        <h1 className="text-3xl font-bold mt-2">P&L estimator entry point</h1>
        <p className="text-[#c8d4e2] mt-3 leading-7">
          Lightweight route for scenario testing. Full assistant UI is intentionally deferred to keep home performance safe.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#35445a] p-4">
            <p className="text-sm text-[#c8d4e2]">Inputs</p>
            <strong>Revenue, food cost, labor, fixed cost</strong>
          </div>
          <div className="rounded-xl border border-[#35445a] p-4">
            <p className="text-sm text-[#c8d4e2]">Outputs</p>
            <strong>Gross margin trend + action hints</strong>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/" className="inline-flex items-center rounded-lg bg-[#c14f35] px-4 py-2 font-semibold text-white">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
