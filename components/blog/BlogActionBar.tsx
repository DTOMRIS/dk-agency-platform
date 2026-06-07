'use client';

import { startTransition, useEffect, useState } from 'react';
import { Share2, Bookmark, Check } from 'lucide-react';

interface BlogActionBarProps {
  title: string;
  slug: string;
}

export default function BlogActionBar({ title, slug }: BlogActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if the article is saved in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedBlogs = JSON.parse(localStorage.getItem('dk_saved_blogs') || '[]');
        startTransition(() => {
          setSaved(savedBlogs.includes(slug));
        });
      } catch (e) {
        console.error('Error reading saved blogs:', e);
      }
    }
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log('Share aborted or failed:', err);
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  const handleSave = () => {
    if (typeof window === 'undefined') return;
    try {
      const savedBlogs: string[] = JSON.parse(localStorage.getItem('dk_saved_blogs') || '[]');
      let updated: string[];

      if (savedBlogs.includes(slug)) {
        updated = savedBlogs.filter((s) => s !== slug);
        setSaved(false);
      } else {
        updated = [...savedBlogs, slug];
        setSaved(true);
      }

      localStorage.setItem('dk_saved_blogs', JSON.stringify(updated));
      // Dispatch custom event to notify other components (e.g. favorites page)
      window.dispatchEvent(new CustomEvent('dk-saved-blogs-updated'));
    } catch (e) {
      console.error('Error saving blog:', e);
    }
  };

  return (
    <div className="ml-auto flex items-center gap-4 relative">
      {copied && (
        <span className="absolute -top-8 right-12 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white shadow animate-fade-in-up">
          Link kopyalandı!
        </span>
      )}
      
      <button
        onClick={handleShare}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-[var(--dk-red)] hover:text-[var(--dk-red)] shadow-sm hover:shadow"
        title="Paylaş"
        aria-label="Paylaş"
      >
        {copied ? <Check size={16} className="text-[var(--dk-success)]" /> : <Share2 size={16} />}
      </button>

      <button
        onClick={handleSave}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all shadow-sm hover:shadow ${
          saved
            ? 'border-[var(--dk-red)] bg-red-50 text-[var(--dk-red)]'
            : 'border-slate-200 bg-white text-slate-500 hover:border-[var(--dk-red)] hover:text-[var(--dk-red)]'
        }`}
        title={saved ? "Yaddaşdan sil" : "Yadda saxla"}
        aria-label={saved ? "Yaddaşdan sil" : "Yadda saxla"}
      >
        <Bookmark size={16} className={saved ? 'fill-[var(--dk-red)]' : ''} />
      </button>
    </div>
  );
}
