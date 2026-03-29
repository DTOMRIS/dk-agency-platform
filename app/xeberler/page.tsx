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
  title: 'Xəbərlər | DK Agency',
  description: 'HoReCa sektorundan ən son xəbərlər, analiz və trendlər.',
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
    <div className="min-h-screen bg-[var(--dk-paper)] text-[var(--dk-ink)] px-4 py-10">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <main className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {localeOptions.map((item) => (
              <Link
                key={item}
                href={`/xeberler?locale=${item}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  locale === item ? 'border-[var(--dk-red-strong)] bg-[color-mix(in_srgb,var(--dk-red)_18%,white)]' : 'border-[var(--dk-warm-border)] bg-[color-mix(in_srgb,var(--dk-paper)_82%,white)]'
                }`}
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </div>

          <article className="rounded-xl border border-[var(--dk-warm-border)] bg-dk-paper p-5">
            <small>{new Date(featured.publishedAt).toLocaleDateString('en-GB')}</small>
            <h1 className="text-3xl font-semibold leading-tight mt-2">{featured.localizedTitle}</h1>
            <p className="mt-3 text-[var(--dk-ink-soft)] leading-7">{featured.localizedSummary}</p>
          </article>

          <section className="mt-6 grid gap-3">
            {list.map((item) => (
              <article key={item.id} className="rounded-xl border border-[var(--dk-warm-border)] bg-white p-4">
                <small>
                  {item.category} | {item.readTime} min
                </small>
                <h2 className="text-xl font-semibold mt-1">{item.localizedTitle}</h2>
                <p className="mt-2 text-[var(--dk-ink-soft)]">{item.localizedSummary}</p>
              </article>
            ))}
          </section>
        </main>

        <aside className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-6 h-fit">
          <h3 className="text-lg font-semibold">Ən Çox Oxunan</h3>
          <div className="mt-3 grid gap-2">
            {mostRead.map((item) => (
              <article key={item.id} className="rounded-lg border border-[var(--dk-warm-border)] bg-white p-3">
                <strong>{item.localizedTitle}</strong>
                <p className="text-sm text-[var(--dk-ink-soft)] mt-1">{item.views.toLocaleString()} oxunuş</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-[var(--dk-warm-border)] bg-[color-mix(in srgb, var(--dk-gold) 14%, white)] p-4">
            <h4 className="font-semibold">RSS</h4>
            <p className="text-sm text-[var(--dk-ink-soft)] mt-1">/api/rss/xeberler?locale={locale}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
