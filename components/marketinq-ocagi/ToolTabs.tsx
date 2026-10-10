'use client';

/**
 * @file ToolTabs.tsx
 * @purpose TASK-0523 (Marketinq audit «birləşdirmə»): one page for tools that answer the same
 *          question — ROI, season, complaints, restaurant check. Each old URL opens the merged page on
 *          its own tab (`initialTab`), and the tab is mirrored to `?tab=` so a link can open a tab.
 *          Tabs stay mounted once opened, so switching does not wipe what the owner typed.
 */

import { useEffect, useState, type ReactNode } from 'react';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

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

  // TASK-0524: v2 pill tabs — same look as the /toolkit group tabs (ink pill = selected).
  const hint = tabs.find((tab) => tab.key === active)?.hint;
  return (
    <div>
      <div className={`${home.wrap} border-b border-[#E4DCCD]`}>
        <div role="tablist" aria-label={label} className={s.tabs} data-testid="tool-tabs">
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
                className={s.tab}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {hint && <p className="pb-3 text-[13px] font-semibold text-slate-600">{hint}</p>}
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
