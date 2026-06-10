import NewsEditorForm from '@/components/dashboard/NewsEditorForm';

export const dynamic = 'force-dynamic';

export default function NewNewsPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Yeni Xəbər</h1>
        </div>
        <NewsEditorForm />
      </div>
    </div>
  );
}
