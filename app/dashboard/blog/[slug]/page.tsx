import { notFound } from 'next/navigation';
import BlogEditorForm, { type BlogDraft } from '@/components/dashboard/BlogEditorForm';
import { getBlogPostDetail } from '@/lib/db/blog-repository';

function toDraft(post: NonNullable<Awaited<ReturnType<typeof getBlogPostDetail>>>): BlogDraft {
  return {
    slug: post.slug,
    titleAz: post.title,
    titleTr: '',
    titleEn: '',
    category: post.category,
    author: post.author,
    readTime: post.readingTime,
    status: (post.status as BlogDraft['status']) || 'draft',
    paywall: post.isPremium,
    publishDate: post.publishDate.slice(0, 10),
    seoTitle: post.seoTitle || '',
    seoDescription: post.seoDescription || '',
    doganNote: post.doganNote || '',
    contentAz: post.content,
    contentTr: '',
    contentEn: '',
    featuredImage: post.coverImage || '',
    guruBoxes: post.guruBoxes.map((box) => ({
      guru: box.guruName,
      quote: box.quote,
      book: box.book,
    })),
  };
}

export default async function DashboardBlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostDetail(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Blog yazısını düzəlt</h1>
        </div>
        <BlogEditorForm initialPost={toDraft(post)} />
      </div>
    </div>
  );
}
