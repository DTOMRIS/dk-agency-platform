'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'dismissed';

const nextStatusMap: Record<LeadStatus, LeadStatus | null> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'converted',
  converted: null,
  dismissed: null,
};

export default function KazanLeadStatusActions({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStatus = nextStatusMap[status];

  async function updateStatus(value: LeadStatus) {
    setLoading(true);
    try {
      await fetch('/api/kazan-ai/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: value }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatus ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus(nextStatus)}
          className="rounded-full bg-[var(--dk-red)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {loading ? 'Yenilənir...' : `Növbəti: ${nextStatus}`}
        </button>
      ) : null}
      {status !== 'dismissed' ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus('dismissed')}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-60"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
