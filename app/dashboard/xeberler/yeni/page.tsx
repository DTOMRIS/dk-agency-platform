import NewsEditorForm from '@/components/dashboard/NewsEditorForm';

export const dynamic = 'force-dynamic';

export default function NewNewsPage() {
  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">Yeni Xəbər</h1>
        </div>
        <NewsEditorForm />
      </div>
    </div>
  );
}
