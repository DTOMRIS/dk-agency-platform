'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getLocalizedNews, type NewsLocale } from '@/lib/data/newsroomFeed';

interface NewsEditorialProps {
  locale: NewsLocale;
}

export default function NewsEditorial({ locale }: NewsEditorialProps) {
  const feed = useMemo(() => getLocalizedNews(locale), [locale]);
  const [sliceCount, setSliceCount] = useState(4);

  const featured = feed[0];
  const list = feed.slice(1, sliceCount);
  const topRead = feed.slice().sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <section id="news">
      <span className="home-kicker">News Editorial</span>
      <h2 className="home-title">Editorial layer with featured lead and most-read rail.</h2>
      <div className="news-grid">
        <article className="news-item">
          <small>{new Date(featured.publishedAt).toLocaleDateString('en-GB')}</small>
          <h3 style={{ marginTop: '0.45rem' }}>{featured.localizedTitle}</h3>
          <p className="home-body">{featured.localizedSummary}</p>
          <Link className="home-btn home-btn-secondary" href="/xeberler">
            Open newsroom
          </Link>
        </article>

        <aside className="news-item">
          <h4>Most read</h4>
          <div className="news-list">
            {topRead.map((item) => (
              <div key={item.id} className="news-item">
                <strong>{item.localizedTitle}</strong>
                <small>{item.views.toLocaleString()} reads</small>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="news-list" style={{ marginTop: '0.8rem' }}>
        {list.map((item) => (
          <article key={item.id} className="news-item">
            <strong>{item.localizedTitle}</strong>
            <p className="home-body">{item.localizedSummary}</p>
          </article>
        ))}
      </div>

      {sliceCount < feed.length && (
        <button type="button" className="home-btn home-btn-secondary" onClick={() => setSliceCount((prev) => prev + 2)}>
          Load more items
        </button>
      )}
    </section>
  );
}
