import Link from 'next/link';
import { adminBlogPosts } from '@/lib/data/adminContent';

export default function DashboardBlogPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Bloq İdarəetmə</h1>
            <p className="mt-3 text-sm text-slate-500">Mock blog yazıları field-by-field CRUD ilə idarə olunur.</p>
          </div>
          <Link href="/dashboard/blog/new" className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">Yeni Yazı +</Link>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Başlıq</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Kateqoriya</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Müəllif</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Status</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Paywall</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Tarix</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Düzəlt</th>
              </tr>
            </thead>
            <tbody>
              {adminBlogPosts.map((post) => (
                <tr key={post.slug} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">{post.titleAz}</td>
                  <td className="px-5 py-4 text-slate-600">{post.category}</td>
                  <td className="px-5 py-4 text-slate-600">{post.author}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : post.status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>{post.status}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{post.paywall ? '✓' : '✗'}</td>
                  <td className="px-5 py-4 text-slate-500">{post.publishDate}</td>
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/blog/${post.slug}`} className="rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white">Düzəlt</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
