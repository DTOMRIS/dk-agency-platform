'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil } from 'lucide-react';
import { formatAzDate } from '@/lib/i18n/format';

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
      // TASK-0528: «silindi» only when the server deleted it.
      const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`delete ${res.status}`);
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
      archived: 'bg-[#F6F1E9] text-[#5B6474]',
    };
    const labelMap: Record<string, string> = {
      published: 'Dərc edilib',
      draft: 'Qaralama',
      archived: 'Arxivdə',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${map[s] || 'bg-[#FBF8F3] text-[#5B6474]'}`}>
        {labelMap[s] || s}
      </span>
    );
  };

  const n = selected.size;

  return (
    <div className="min-h-full bg-[#F6F1E9] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">Bloq idarəetmə</h1>
            <p className="mt-1 text-[15px] text-[#5B6474]">
              {posts.length} yazı · {posts.filter((p) => p.status === 'published').length} dərc edilib
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/blog/translation-status"
              className="inline-flex h-11 items-center rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#FBF8F3]"
            >
              Tərcümə statusu
            </Link>
            <Link
              href="/dashboard/blog/new"
              className="inline-flex h-11 items-center rounded-full bg-dk-red-strong px-5 text-[14px] font-semibold text-white transition-colors hover:opacity-90"
            >
              Yeni yazı +
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-[22px] border border-[#E4DCCD] bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#5B6474]">Yüklənir...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-[12px] uppercase tracking-wide text-[#5B6474]">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={n === posts.length && posts.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#E4DCCD] accent-[var(--dk-red)]"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Başlıq</th>
                  <th className="px-4 py-3 font-semibold">Kateqoriya</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Tarix</th>
                  <th className="w-28 px-4 py-3 font-semibold">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`border-t border-[#EFE9DE] transition ${selected.has(post.id) ? 'bg-red-50/40' : 'hover:bg-[#FBF8F3]'}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="h-4 w-4 rounded border-[#E4DCCD] accent-[var(--dk-red)]"
                      />
                    </td>
                    <td className="max-w-xs truncate px-4 py-4 font-semibold text-[#0F172A]">
                      {post.title}
                    </td>
                    <td className="px-4 py-4 text-[#5B6474]">{post.category}</td>
                    <td className="px-4 py-4">{statusBadge(post.status)}</td>
                    <td className="px-4 py-4 text-[#5B6474]">
                      {formatAzDate(post.publishDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/blog/${post.slug}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCCD] text-[#5B6474] transition hover:border-[#0F172A] hover:text-[#0F172A]"
                          title="Düzəlt"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteOne(post)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCCD] text-[#5B6474] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
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
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t border-white/10 bg-[#0F172A]/95 px-6 py-4 backdrop-blur-md">
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
            className="rounded-full bg-white/15 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/25 disabled:opacity-50"
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
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold text-white/70 transition hover:text-white"
          >
            Ləğv et
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
