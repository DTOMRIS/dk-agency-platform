'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: string;
  isPremium: boolean;
  publishDate: string;
}

export default function DashboardBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetch('/api/blog?status=all')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.id))
    );

  const bulkAction = async (action: string, label: string) => {
    if (action === 'delete' && !window.confirm(`${selected.size} yazını silmək istədiyinizə əminsiniz?`)) return;
    setActing(true);
    try {
      const ids = [...selected].map(Number).filter(Boolean);
      const res = await fetch('/api/blog/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${label} — ${data.affected} yazı yeniləndi`);
        setSelected(new Set());
        const fresh = await fetch('/api/blog?status=all').then((r) => r.json());
        setPosts(fresh.posts || []);
      } else {
        showToast(`Xəta: ${data.error}`);
      }
    } catch {
      showToast('Əməliyyat uğursuz oldu');
    } finally {
      setActing(false);
    }
  };

  const deleteOne = async (post: BlogPost) => {
    if (!window.confirm(`"${post.title}" silinsin?`)) return;
    try {
      await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' });
      showToast(`"${post.title}" silindi`);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      showToast('Silmə uğursuz oldu');
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      published: 'bg-emerald-50 text-emerald-700',
      draft: 'bg-amber-50 text-amber-700',
      archived: 'bg-slate-100 text-slate-500',
    };
    const labelMap: Record<string, string> = {
      published: 'Dərc edilib',
      draft: 'Qaralama',
      archived: 'Arxivdə',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${map[s] || 'bg-slate-50 text-slate-400'}`}>
        {labelMap[s] || s}
      </span>
    );
  };

  const n = selected.size;

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Bloq idarəetmə</h1>
            <p className="mt-3 text-sm text-slate-500">
              {posts.length} yazı · {posts.filter((p) => p.status === 'published').length} dərc edilib
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/blog/translation-status"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400"
            >
              Tərcümə statusu
            </Link>
            <Link
              href="/dashboard/blog/new"
              className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
            >
              Yeni yazı +
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">Yüklənir...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-400">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={n === posts.length && posts.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 accent-[var(--dk-red)]"
                    />
                  </th>
                  <th className="px-4 py-4 font-black uppercase tracking-[0.18em]">Başlıq</th>
                  <th className="px-4 py-4 font-black uppercase tracking-[0.18em]">Kateqoriya</th>
                  <th className="px-4 py-4 font-black uppercase tracking-[0.18em]">Status</th>
                  <th className="px-4 py-4 font-black uppercase tracking-[0.18em]">Tarix</th>
                  <th className="w-28 px-4 py-4 font-black uppercase tracking-[0.18em]">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`border-t border-slate-100 transition ${selected.has(post.id) ? 'bg-red-50/40' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[var(--dk-red)]"
                      />
                    </td>
                    <td className="max-w-xs truncate px-4 py-4 font-semibold text-[var(--dk-navy)]">
                      {post.title}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{post.category}</td>
                    <td className="px-4 py-4">{statusBadge(post.status)}</td>
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(post.publishDate).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/blog/${post.slug}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                          title="Düzəlt"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteOne(post)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk toolbar — sticky bottom */}
      {n > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t border-slate-700 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <span className="text-sm font-bold text-white">{n} seçildi</span>
          <button
            type="button"
            disabled={acting}
            onClick={() => void bulkAction('publish', 'Dərc et')}
            className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Dərc et ({n})
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => void bulkAction('draft', 'Qaralama')}
            className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            Qaralama ({n})
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => void bulkAction('archive', 'Arxivlə')}
            className="rounded-full bg-slate-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            Arxivlə ({n})
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => void bulkAction('delete', 'Sil')}
            className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            Sil ({n})
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="rounded-full border border-slate-600 px-4 py-2 text-xs font-bold text-slate-400 transition hover:text-white"
          >
            Ləğv et
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
