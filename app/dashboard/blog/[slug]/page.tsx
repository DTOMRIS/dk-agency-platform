import { notFound } from 'next/navigation';
import BlogEditorForm from '@/components/dashboard/BlogEditorForm';
import { adminBlogPosts } from '@/lib/data/adminContent';

export default async function DashboardBlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = adminBlogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Blog Yazısını Düzəlt</h1>
        </div>
        <BlogEditorForm initialPost={post} />
      </div>
    </div>
  );
}
