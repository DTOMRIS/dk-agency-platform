'use client';

import Link from 'next/link';

export default function WhatsAppButton() {
  return (
    <div className="fixed z-50 bottom-20 right-4 md:bottom-8 md:right-8 group">
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        Bize yazin
      </span>

      <Link
        href="https://wa.me/994XXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile bize yazin"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        <svg viewBox="0 0 24 24" className="relative z-10 h-7 w-7 fill-current" aria-hidden="true">
          <path d="M20.52 3.48A11.88 11.88 0 0 0 12.03 0C5.39 0 0 5.4 0 12.04c0 2.12.55 4.2 1.59 6.03L0 24l6.1-1.56a11.99 11.99 0 0 0 5.93 1.51h.01c6.63 0 12.03-5.4 12.03-12.03 0-3.21-1.25-6.23-3.55-8.44Zm-8.49 18.43h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.62.92.97-3.53-.23-.37a9.97 9.97 0 0 1-1.53-5.3C2.2 6.58 6.57 2.2 12.03 2.2a9.8 9.8 0 0 1 6.95 2.88 9.78 9.78 0 0 1 2.89 6.95c0 5.46-4.39 9.88-9.84 9.88Zm5.42-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.61.13-.12.3-.32.45-.47.15-.15.2-.25.3-.42.1-.17.05-.32-.03-.47-.07-.15-.66-1.6-.9-2.2-.24-.57-.49-.5-.66-.5h-.56c-.2 0-.47.07-.71.32-.25.25-.96.94-.96 2.28s.98 2.64 1.11 2.82c.15.2 1.94 2.96 4.7 4.15.66.29 1.18.46 1.58.59.67.21 1.27.18 1.74.11.53-.08 1.76-.72 2-.1.25-.57.25-1.06.17-1.16-.07-.1-.27-.17-.57-.32Z" />
        </svg>
      </Link>
    </div>
  );
}
