import { notFound } from 'next/navigation';
import BlogEditorForm, { type BlogDraft } from '@/components/dashboard/BlogEditorForm';
import { getBlogPostRaw } from '@/lib/db/blog-repository';
import { requireAdminPage } from '@/lib/auth/guards';

type RawPost = NonNullable<Awaited<ReturnType<typeof getBlogPostRaw>>>;

function toDraft(post: RawPost): BlogDraft {
  return {
    slug: post.slug,
    titleAz: post.title_az,
    titleTr: post.title_tr || '',
    titleEn: post.title_en || '',
    titleRu: post.title_ru || '',
    category: post.category || 'Maliyyə',
    stage: post.stage || '',
    author: post.author || 'DK Agency',
    readTime: post.readTime || 8,
    status: (post.status as BlogDraft['status']) || 'draft',
    paywall: Boolean(post.hasPaywall),
    publishDate: post.publishedAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
    seoTitle: post.seoTitle || '',
    seoDescription: post.seoDescription || '',
    doganNote: post.doganNote || '',
    contentAz: post.content_az,
    contentTr: post.content_tr || '',
    contentEn: post.content_en || '',
    contentRu: post.content_ru || '',
    featuredImage: post.featuredImage || '',
    guruBoxes: post.guruBoxesList
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((box) => ({
        guru: box.guruName || '',
        quote: box.quote_az || '',
        book: box.book || '',
      })),
  };
}

export default async function DashboardBlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const post = await getBlogPostRaw(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">Blog yazısını düzəlt</h1>
        </div>
        <BlogEditorForm initialPost={toDraft(post)} />
      </div>
    </div>
  );
}
