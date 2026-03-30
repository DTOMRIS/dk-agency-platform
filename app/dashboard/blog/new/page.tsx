import BlogEditorForm from '@/components/dashboard/BlogEditorForm';

export default function DashboardBlogNewPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Yeni Blog Yazısı</h1>
        </div>
        <BlogEditorForm />
      </div>
    </div>
  );
}
