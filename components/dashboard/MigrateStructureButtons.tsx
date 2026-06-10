'use client';

import { useState } from 'react';

interface MigrationDetail {
  id: number;
  slug: string;
  guruExtracted: Array<{ name: string; quotePreview: string }>;
  doganPreview: string | null;
  contentStripped: boolean;
}
interface MigrationResult {
  ok: boolean;
  apply: boolean;
  postsScanned: number;
  guruInserted: number;
  doganSet: number;
  contentStripped: number;
  details: MigrationDetail[];
  error?: string;
}

type RunState = 'idle' | 'running' | 'done' | 'error';

// Dual content-model migration, run on the server from the admin UI.
// Dry-run previews exactly what would change; apply writes (after confirm).
export default function MigrateStructureButtons() {
  const [state, setState] = useState<RunState>('idle');
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [err, setErr] = useState('');

  async function run(apply: boolean) {
    if (state === 'running') return;
    if (apply) {
      if (
        !window.confirm(
          'TƏTBIQ ET: köhnə blogların guru/Doğan bloklarını strukturlu sahələrə köçür və markdown-dan sil. content_az DƏYIŞIR. Neon backup aldın? Davam?'
        )
      ) {
        return;
      }
    }
    setState('running');
    setErr('');
    setResult(null);
    try {
      const res = await fetch(
        `/api/blog/migrate-structure?${apply ? 'apply=true' : 'dryRun=true'}`,
        { method: 'POST' }
      );
      const data = (await res.json()) as MigrationResult;
      if (!res.ok || !data.ok) {
        setState('error');
        setErr(data.error || `Xəta: ${res.status}`);
        return;
      }
      setState('done');
      setResult(data);
    } catch (e) {
      setState('error');
      setErr(e instanceof Error ? e.message : 'Şəbəkə xətası');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={state === 'running'}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-60"
        >
          {state === 'running' ? 'İşləyir…' : 'Öncəbaxış (dry-run)'}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={state === 'running' || !result || result.apply}
          title={!result || result.apply ? 'Əvvəlcə dry-run işlət və çıxışı yoxla' : ''}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tətbiq et (apply)
        </button>
        {err && <span className="text-sm font-semibold text-red-600">{err}</span>}
      </div>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-bold text-slate-800">
            {result.apply ? '✅ TƏTBIQ OLUNDU' : '👁 ÖNCƏBAXIŞ (yazılmadı)'} · {result.postsScanned}{' '}
            blog skan · guru: {result.guruInserted} · Doğan: {result.doganSet} · content silinən:{' '}
            {result.contentStripped}
          </p>
          {result.details.length === 0 ? (
            <p className="text-sm text-slate-600">Dəyişəcək heç nə tapılmadı.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {result.details.map((d) => (
                <div key={d.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-700">{d.slug}</p>
                  {d.guruExtracted.map((g, i) => (
                    <p key={i} className="mt-1 text-xs text-slate-600">
                      🎓 <span className="font-semibold">{g.name}</span> — “{g.quotePreview}…”
                    </p>
                  ))}
                  {d.doganPreview && (
                    <p className="mt-1 text-xs text-slate-600">📝 Doğan: “{d.doganPreview}…”</p>
                  )}
                  {d.contentStripped && (
                    <p className="mt-1 text-[11px] font-semibold text-amber-700">
                      content_az təmizlənəcək
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
