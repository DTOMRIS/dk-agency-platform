'use client';

/**
 * @file ToolTabs.tsx
 * @purpose TASK-0523 (Marketinq audit «birləşdirmə»): one page for tools that answer the same
 *          question — ROI, season, complaints, restaurant check. Each old URL opens the merged page on
 *          its own tab (`initialTab`), and the tab is mirrored to `?tab=` so a link can open a tab.
 *          Tabs stay mounted once opened, so switching does not wipe what the owner typed.
 */

import { useEffect, useState, type ReactNode } from 'react';

export type ToolTab = { key: string; label: string; hint?: string; content: ReactNode };

export default function ToolTabs({ tabs, initialTab, label }: { tabs: ToolTab[]; initialTab?: string; label: string }) {
  const fallback = tabs.some((tab) => tab.key === initialTab) ? (initialTab as string) : tabs[0].key;
  const [active, setActive] = useState(fallback);
  const [opened, setOpened] = useState<Set<string>>(() => new Set([fallback]));

  // A shared link with ?tab=… wins over the route's default tab.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab');
    if (fromUrl && tabs.some((tab) => tab.key === fromUrl)) {
      const id = window.requestAnimationFrame(() => {
        setActive(fromUrl);
        setOpened((prev) => new Set(prev).add(fromUrl));
      });
      return () => window.cancelAnimationFrame(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(key: string) {
    setActive(key);
    setOpened((prev) => new Set(prev).add(key));
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', key);
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {
      /* URL API unavailable — tab still switches */
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" data-testid="tool-tabs">
          {tabs.map((tab) => {
            const on = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tool-tab-${tab.key}`}
                aria-selected={on}
                aria-controls={`tool-panel-${tab.key}`}
                onClick={() => select(tab.key)}
                data-testid={`tool-tab-${tab.key}`}
                className={`min-h-11 flex-1 whitespace-nowrap rounded-lg px-4 text-sm font-bold transition ${on ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {tabs.find((tab) => tab.key === active)?.hint && (
          <p className="mt-2 text-xs text-slate-500">{tabs.find((tab) => tab.key === active)?.hint}</p>
        )}
      </div>
      {tabs.map((tab) =>
        opened.has(tab.key) ? (
          <div key={tab.key} role="tabpanel" id={`tool-panel-${tab.key}`} aria-labelledby={`tool-tab-${tab.key}`} hidden={tab.key !== active}>
            {tab.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
