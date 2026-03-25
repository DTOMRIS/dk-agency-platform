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
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAF8] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Wrench size={32} className="text-[#92700C]" />
        </div>

        {category && (
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.3em] mb-4 block">
            {category}
          </span>
        )}

        <h1 className="text-3xl font-display font-bold text-[#1A1A2E] mb-4">{title}</h1>
        <p className="text-[#888] text-base leading-relaxed mb-10">{description}</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-poçt ünvanınız"
              className="flex-1 bg-white border-[1.5px] border-[#EDEDE9] rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#C5A022] transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-[#C5A022] text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[#B8931E] transition-colors whitespace-nowrap"
            >
              Xəbər ver
            </button>
          </form>
        ) : (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-10">
            <p className="text-[#166534] font-medium text-sm">Tesekkurler! Hazir olanda Xəbər vereceyik.</p>
          </div>
        )}

        <div className="border-t border-[#EDEDE9] pt-8 mb-8">
          <p className="text-sm text-[#888] mb-4">Bu arada baxmağa dəyər:</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/blog"
              className="flex items-center gap-2 bg-white border border-[#EDEDE9] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[#C5A022] transition-colors"
            >
              <BookOpen size={16} /> Blog
            </Link>
            <Link
              href="/b2b-panel/toolkit"
              className="flex items-center gap-2 bg-white border border-[#EDEDE9] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[#C5A022] transition-colors"
            >
              <Wrench size={16} /> Toolkit
            </Link>
          </div>
        </div>

        <Link href="/" className="text-sm text-[#888] hover:text-[#C5A022] transition-colors inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
}

