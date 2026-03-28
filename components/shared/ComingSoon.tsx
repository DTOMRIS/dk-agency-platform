'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, BookOpen } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  category?: string;
}

export default function ComingSoon({ title, description, category }: ComingSoonProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log('ComingSoon email signup:', email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--dk-paper)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[color-mix(in srgb, var(--dk-gold) 22%, white)] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Wrench size={32} className="text-[color-mix(in srgb, var(--dk-gold) 78%, black)]" />
        </div>

        {category && (
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.3em] mb-4 block">
            {category}
          </span>
        )}

        <h1 className="text-3xl font-display font-bold text-[var(--dk-navy)] mb-4">{title}</h1>
        <p className="text-[var(--dk-muted)] text-base leading-relaxed mb-10">{description}</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-poçt ünvanınız"
              className="flex-1 bg-white border-[1.5px] border-[var(--dk-border-soft)] rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[var(--dk-gold)] transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-[var(--dk-gold)] text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[color-mix(in srgb, var(--dk-gold) 92%, black)] transition-colors whitespace-nowrap"
            >
              Xəbər ver
            </button>
          </form>
        ) : (
          <div className="bg-[color-mix(in srgb, var(--dk-success) 12%, white)] border border-[color-mix(in srgb, var(--dk-success) 28%, white)] rounded-xl p-4 mb-10">
            <p className="text-[color-mix(in srgb, var(--dk-success) 76%, black)] font-medium text-sm">Tesekkurler! Hazir olanda Xəbər vereceyik.</p>
          </div>
        )}

        <div className="border-t border-[var(--dk-border-soft)] pt-8 mb-8">
          <p className="text-sm text-[var(--dk-muted)] mb-4">Bu arada baxmağa dəyər:</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/blog"
              className="flex items-center gap-2 bg-white border border-[var(--dk-border-soft)] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[var(--dk-gold)] transition-colors"
            >
              <BookOpen size={16} /> Blog
            </Link>
            <Link
              href="/b2b-panel/toolkit"
              className="flex items-center gap-2 bg-white border border-[var(--dk-border-soft)] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[var(--dk-gold)] transition-colors"
            >
              <Wrench size={16} /> Toolkit
            </Link>
          </div>
        </div>

        <Link href="/" className="text-sm text-[var(--dk-muted)] hover:text-[var(--dk-gold)] transition-colors inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
}

