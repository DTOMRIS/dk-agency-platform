import Link from 'next/link';
import { getLocalizedNews, getTopRead, type NewsLocale } from '@/lib/data/newsroomFeed';

const localeOptions: NewsLocale[] = ['az', 'en', 'ru', 'tr'];

function resolveLocale(input: string | undefined): NewsLocale {
  if (input && localeOptions.includes(input as NewsLocale)) {
    return input as NewsLocale;
  }
  return 'az';
}

export const metadata = {
  title: 'Xeberler | DK Agency Editorial',
  description: 'Featured editorial flow with multilingual consistency and RSS distribution layer.',
};

export default async function XeberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const locale = resolveLocale(params.locale);
  const feed = getLocalizedNews(locale);
  const featured = feed[0];
  const list = feed.slice(1);
  const mostRead = getTopRead(locale, 3);

  return (
    <div className="min-h-screen bg-[#f4f3ed] text-[#1f2a2b] px-4 py-10">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <main className="rounded-2xl border border-[#d4d0c4] bg-[#fffdf7] p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {localeOptions.map((item) => (
              <Link
                key={item}
                href={`/xeberler?locale=${item}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  locale === item ? 'border-[#c14f35] bg-[#f9e0d7]' : 'border-[#d6d0bf] bg-[#f9f6ee]'
                }`}
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </div>

          <article className="rounded-xl border border-[#d7d2c3] bg-[#fff9ed] p-5">
            <small>{new Date(featured.publishedAt).toLocaleDateString('en-GB')}</small>
            <h1 className="text-3xl font-semibold leading-tight mt-2">{featured.localizedTitle}</h1>
            <p className="mt-3 text-[#4f5a55] leading-7">{featured.localizedSummary}</p>
          </article>

          <section className="mt-6 grid gap-3">
            {list.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#d7d2c3] bg-white p-4">
                <small>
                  {item.category} | {item.readTime} min
                </small>
                <h2 className="text-xl font-semibold mt-1">{item.localizedTitle}</h2>
                <p className="mt-2 text-[#4f5a55]">{item.localizedSummary}</p>
              </article>
            ))}
          </section>
        </main>

        <aside className="rounded-2xl border border-[#d4d0c4] bg-[#fffdf7] p-6 h-fit">
          <h3 className="text-lg font-semibold">Most Read</h3>
          <div className="mt-3 grid gap-2">
            {mostRead.map((item) => (
              <article key={item.id} className="rounded-lg border border-[#dcd7ca] bg-white p-3">
                <strong>{item.localizedTitle}</strong>
                <p className="text-sm text-[#59645f] mt-1">{item.views.toLocaleString()} reads</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-[#d8d2c3] bg-[#f9f3e7] p-4">
            <h4 className="font-semibold">RSS</h4>
            <p className="text-sm text-[#5a625d] mt-1">/api/rss/xeberler?locale={locale}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
