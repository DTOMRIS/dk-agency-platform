'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const listingsData = {
  ekipman: [
    { title: 'Combi oven set', city: 'Baku', type: 'Supplier', price: 'AZN 14,500' },
    { title: 'Prep line cooling pack', city: 'Ganja', type: 'Verified', price: 'AZN 8,200' },
  ],
  devir: [
    { title: 'Fast-casual branch transfer', city: 'Baku', type: 'Devir', price: 'AZN 185,000' },
    { title: 'Cafe lounge transfer', city: 'Sumqayit', type: 'Devir', price: 'AZN 122,000' },
  ],
  tedarikci: [
    { title: 'Cold chain wholesaler', city: 'Baku', type: 'Vendor', price: 'Contract' },
    { title: 'Fresh produce network', city: 'Shaki', type: 'Vendor', price: 'Contract' },
  ],
};

type ListingTab = keyof typeof listingsData;
type UserRole = 'guest' | 'uzv' | 'sahib';

function detectRole(): UserRole {
  if (typeof window === 'undefined') {
    return 'guest';
  }

  try {
    const raw = window.localStorage.getItem('dk_user');
    if (!raw) {
      return 'guest';
    }

    const parsed = JSON.parse(raw) as { loggedIn?: boolean; email?: string };
    if (!parsed.loggedIn) {
      return 'guest';
    }
    if (parsed.email?.includes('admin')) {
      return 'sahib';
    }
    return 'uzv';
  } catch {
    return 'guest';
  }
}

export default function ListingsPreview() {
  const [tab, setTab] = useState<ListingTab>('ekipman');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [role] = useState<UserRole>(() => detectRole());

  const items = useMemo(() => {
    return listingsData[tab].filter((item) => {
      const q = query.trim().toLowerCase();
      const queryMatch = q.length === 0 || item.title.toLowerCase().includes(q);
      const cityMatch = cityFilter === 'all' || item.city === cityFilter;
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      return queryMatch && cityMatch && typeMatch;
    });
  }, [tab, query, cityFilter, typeFilter]);

  const ctaHref = role === 'guest' ? '/auth/login' : '/b2b-panel/yeni-ilan';
  const ctaLabel = role === 'guest' ? 'Login to post listing' : 'Elan yerlesdir';

  return (
    <section id="listings">
      <span className="home-kicker">Listings Preview</span>
      <h2 className="home-title">Marketplace tabs with role-aware posting flow.</h2>

      <div className="tab-row" role="tablist" aria-label="listing tabs">
        {(['ekipman', 'devir', 'tedarikci'] as ListingTab[]).map((value) => (
          <button key={value} type="button" data-active={tab === value} onClick={() => setTab(value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="listings-toolbar">
        <input
          type="search"
          placeholder="Mini search..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
          <option value="all">All cities</option>
          <option value="Baku">Baku</option>
          <option value="Ganja">Ganja</option>
          <option value="Sumqayit">Sumqayit</option>
          <option value="Shaki">Shaki</option>
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="all">All types</option>
          <option value="Supplier">Supplier</option>
          <option value="Verified">Verified</option>
          <option value="Devir">Devir</option>
          <option value="Vendor">Vendor</option>
        </select>
      </div>

      <div className="news-list" style={{ marginTop: '0.75rem' }}>
        {items.map((item) => (
          <article key={item.title} className="news-item">
            <strong>{item.title}</strong>
            <small>
              {item.city} | {item.type} | {item.price}
            </small>
          </article>
        ))}
      </div>

      <div className="home-cta-row">
        <Link href={ctaHref} className="home-btn home-btn-primary" aria-label="Role gated listing action">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
