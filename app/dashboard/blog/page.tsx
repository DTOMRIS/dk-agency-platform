import Link from 'next/link';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, type Locale } from '@/i18n/config';

const blogCopy: Record<Locale, {
  title: string;
  subtitle: string;
  newPost: string;
  colTitle: string;
  colCategory: string;
  colAuthor: string;
  colStatus: string;
  colPaywall: string;
  colDate: string;
  colEdit: string;
  edit: string;
}> = {
  az: {
    title: 'Bloq idarəetmə',
    subtitle: 'Yazıları DB və statik fallback üzərindən idarə edin.',
    newPost: 'Yeni yazı +',
    colTitle: 'Başlıq',
    colCategory: 'Kateqoriya',
    colAuthor: 'Müəllif',
    colStatus: 'Status',
    colPaywall: 'Paywall',
    colDate: 'Tarix',
    colEdit: 'Düzəlt',
    edit: 'Düzəlt',
  },
  ru: {
    title: 'Управление блогом',
    subtitle: 'Управляйте статьями через БД и статический fallback.',
    newPost: 'Новая статья +',
    colTitle: 'Заголовок',
    colCategory: 'Категория',
    colAuthor: 'Автор',
    colStatus: 'Статус',
    colPaywall: 'Paywall',
    colDate: 'Дата',
    colEdit: 'Редакт.',
    edit: 'Редакт.',
  },
  en: {
    title: 'Blog management',
    subtitle: 'Manage posts via DB and static fallback.',
    newPost: 'New post +',
    colTitle: 'Title',
    colCategory: 'Category',
    colAuthor: 'Author',
    colStatus: 'Status',
    colPaywall: 'Paywall',
    colDate: 'Date',
    colEdit: 'Edit',
    edit: 'Edit',
  },
  tr: {
    title: 'Blog yönetimi',
    subtitle: 'Yazıları DB ve statik fallback üzerinden yönetin.',
    newPost: 'Yeni yazı +',
    colTitle: 'Başlık',
    colCategory: 'Kategori',
    colAuthor: 'Yazar',
    colStatus: 'Durum',
    colPaywall: 'Paywall',
    colDate: 'Tarih',
    colEdit: 'Düzenle',
    edit: 'Düzenle',
  },
};

export default async function DashboardBlogPage() {
  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);
  const copy = blogCopy[locale];
  const { posts } = await getBlogPostsFromDb({ status: 'all' });

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.title}</h1>
            <p className="mt-3 text-sm text-slate-500">{copy.subtitle}</p>
          </div>
          <Link href="/dashboard/blog/new" className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">
            {copy.newPost}
          </Link>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colTitle}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colCategory}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colAuthor}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colStatus}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colPaywall}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colDate}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colEdit}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">{post.title}</td>
                  <td className="px-5 py-4 text-slate-600">{post.category}</td>
                  <td className="px-5 py-4 text-slate-600">{post.author}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : post.status === 'archived'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{post.isPremium ? '✓' : '✗'}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(post.publishDate).toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-GB')}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/blog/${post.slug}`} className="rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white">
                      {copy.edit}
                    </Link>
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
