import { notFound } from 'next/navigation';

// TASK-0526: every sidebar item has its own page; this catch-all only received mistyped / old URLs and
// answered «Bu bölmə tezliklə aktivləşdiriləcək» for anything — hiding real 404s. Unknown = 404.
export default function B2BPanelUnknownPage() {
  notFound();
}
