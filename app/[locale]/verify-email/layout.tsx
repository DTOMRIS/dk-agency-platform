import type { Metadata } from 'next';

/** Not for search results (TASK-0474): account / email-token / placeholder pages. Links are still followed. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
