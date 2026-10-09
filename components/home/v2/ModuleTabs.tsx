/**
 * @file ModuleTabs.tsx
 * @purpose Homepage v2 «Xərc / Gəlir» module tabs — status badge, stat card, 3 steps, sample table
 *          and an animated «siqnal → addım» card per module. Sticky tab bar under the header.
 *          `/#p-<module>` (Header «Modullar» menu) opens the matching tab.
 * @pattern A (useTranslations) — homeV2.modules
 * @task TASK-0512
 */

'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal, useReducedMotion, whatsappHref } from './shared';

type ModuleId = 'foodcost' | 'delivery' | 'ocaq' | 'menu' | 'kazan';

/** A table cell: literal sample value (identical in every locale) or a message key under homeV2.modules. */
type Cell =
  | { v: string; num?: boolean; hot?: boolean }
  | { k: string; num?: boolean; hot?: boolean }
  | { label: string; k: string };
type Row = { cells: Cell[]; hl?: boolean };

type ModuleDef = {
  id: ModuleId;
  group: 'cost' | 'revenue';
  status: 'live' | 'beta';
  /** Internal route (locale-aware) or 'whatsapp' for the OCAQ lead link. */
  href: string | 'whatsapp';
  ctaKey: string;
  kpi: string | null;
  kpiTone: 'red' | 'ok' | 'beta';
  hasNote: boolean;
  head: boolean;
  sampleKey: 'sample' | 'sampleDialog';
  rows: Row[];
};

const v = (value: string, opts: { num?: boolean; hot?: boolean } = {}): Cell => ({ v: value, ...opts });
const k = (key: string, opts: { num?: boolean; hot?: boolean } = {}): Cell => ({ k: key, ...opts });
const N = { num: true } as const;

/** Sample rows — copied from the approved /tanitim page; internally consistent (3,40 / 7,50 = 45%, 20 × 25% = 5 ₼). */
const MODULES: ModuleDef[] = [
  {
    id: 'foodcost',
    group: 'cost',
    status: 'live',
    href: '/toolkit/food-cost',
    ctaKey: 'openTool',
    kpi: '33%',
    kpiTone: 'red',
    hasNote: true,
    head: true,
    sampleKey: 'sample',
    rows: [
      { cells: [k('dish.chicken'), v('2,10 ₼', N), v('6,50 ₼', N), v('32%', N)] },
      { cells: [k('dish.meat'), v('3,40 ₼', N), v('7,50 ₼', N), v('45%', { num: true, hot: true })], hl: true },
      { cells: [k('dish.lavash'), v('3,00 ₼', N), v('9,00 ₼', N), v('33%', N)] },
      { cells: [k('dish.fries'), v('0,70 ₼', N), v('3,00 ₼', N), v('23%', N)] },
      { cells: [k('dish.ayran'), v('0,45 ₼', N), v('1,50 ₼', N), v('30%', N)] },
    ],
  },
  {
    id: 'delivery',
    group: 'cost',
    status: 'live',
    href: '/toolkit/delivery-calc',
    ctaKey: 'openTool',
    kpi: '8,60 ₼',
    kpiTone: 'red',
    hasNote: false,
    head: true,
    sampleKey: 'sample',
    rows: [
      { cells: [k('delivery.dineIn'), v('0%', N), v('6,40 ₼', N), v('13,60 ₼', N)] },
      { cells: [k('delivery.platformA'), v('25%', N), v('6,40 ₼', N), v('8,60 ₼', { num: true, hot: true })], hl: true },
      { cells: [k('delivery.own'), k('delivery.courier', N), v('6,40 ₼', N), v('10,60 ₼', N)] },
    ],
  },
  {
    id: 'ocaq',
    group: 'cost',
    status: 'live',
    href: 'whatsapp',
    ctaKey: 'ocaq.cta',
    kpi: '7 / 9',
    kpiTone: 'red',
    hasNote: false,
    head: true,
    sampleKey: 'sample',
    rows: [
      { cells: [k('ocaq.fridge'), v('✓ 3°C', N), k('ocaq.cook'), v('08:10', N)] },
      { cells: [k('ocaq.openingCash'), v('✓', N), k('ocaq.cashier'), v('08:30', N)] },
      { cells: [k('ocaq.cashBank'), k('ocaq.diff', { num: true, hot: true }), k('ocaq.manager'), v('09:00', N)], hl: true },
      { cells: [k('ocaq.wasteLog'), k('ocaq.pending', N), k('ocaq.cook'), v('—', N)] },
    ],
  },
  {
    id: 'menu',
    group: 'revenue',
    status: 'live',
    href: '/toolkit/menu-matrix',
    ctaKey: 'openTool',
    kpi: '1',
    kpiTone: 'ok',
    hasNote: false,
    head: true,
    sampleKey: 'sample',
    rows: [
      { cells: [k('dish.chicken'), k('menu.salesHigh', N), k('menu.marginHigh', N), k('menu.star')] },
      { cells: [k('dish.lavash'), k('menu.salesLow', N), k('menu.marginHigh', N), k('menu.puzzle')] },
      { cells: [k('dish.meat'), k('menu.salesHigh', N), k('menu.marginLow', { num: true, hot: true }), k('menu.horse')], hl: true },
      { cells: [k('dish.salad'), k('menu.salesLow', N), k('menu.marginLow', N), k('menu.dog')] },
    ],
  },
  {
    id: 'kazan',
    group: 'revenue',
    status: 'beta',
    href: '/kazan-ai',
    ctaKey: 'kazan.cta',
    kpi: null,
    kpiTone: 'beta',
    hasNote: false,
    head: false,
    sampleKey: 'sampleDialog',
    rows: [
      { cells: [{ label: 'kazan.qLbl', k: 'kazan.q' }] },
      { cells: [{ label: 'kazan.aLbl', k: 'kazan.a' }] },
      { cells: [{ label: 'kazan.stepLbl', k: 'kazan.step' }], hl: true },
    ],
  },
];

const ORDER: ModuleId[] = MODULES.map((m) => m.id);
const isModuleId = (value: string): value is ModuleId => (ORDER as string[]).includes(value);

export default function ModuleTabs() {
  const t = useTranslations('homeV2');
  const tm = useTranslations('homeV2.modules');
  const locale = normalizeLocale(useLocale());
  const [active, setActive] = useState<ModuleId>('foodcost');
  const tabRefs = useRef<Partial<Record<ModuleId, HTMLButtonElement | null>>>({});
  const sectionRef = useRef<HTMLElement>(null);

  // `/#p-ocaq` etc. (Header «Modullar» menu) → open that tab and bring the section into view.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace(/^#p-/, '');
      if (window.location.hash.startsWith('#p-') && isModuleId(id)) {
        setActive(id);
        window.requestAnimationFrame(() =>
          sectionRef.current?.scrollIntoView({ block: 'start' }),
        );
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const onTabKey = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = ORDER.indexOf(active);
      const next = ORDER[(i + (e.key === 'ArrowRight' ? 1 : ORDER.length - 1)) % ORDER.length];
      setActive(next);
      tabRefs.current[next]?.focus();
    },
    [active],
  );

  const renderTab = (m: ModuleDef) => (
    <button
      key={m.id}
      ref={(el) => {
        tabRefs.current[m.id] = el;
      }}
      type="button"
      role="tab"
      id={`t-${m.id}`}
      aria-selected={active === m.id}
      aria-controls={`p-${m.id}`}
      tabIndex={active === m.id ? 0 : -1}
      className={styles.tab}
      onClick={() => setActive(m.id)}
      onKeyDown={onTabKey}
    >
      <span className={`${styles.st} ${m.status === 'beta' ? styles.stBeta : ''}`} aria-hidden="true" />
      {tm(`${m.id}.tab`)}
    </button>
  );

  return (
    <section className={`${styles.v2} ${inter.className}`} id="modullar" ref={sectionRef}>
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <Reveal className={styles.secHead}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              {tm('eyebrow')}
            </span>
            <h2 className={styles.h2}>{tm('title')}</h2>
            <p>{tm.rich('desc', { b: (chunks) => <b>{chunks}</b> })}</p>
          </Reveal>

          <div className={styles.tabbar} role="tablist" aria-label={tm('eyebrow')}>
            <span className={styles.tabGroup}>{tm('groupCost')}</span>
            {MODULES.filter((m) => m.group === 'cost').map(renderTab)}
            <span className={styles.tabSep} aria-hidden="true" />
            <span className={styles.tabGroup}>{tm('groupRevenue')}</span>
            {MODULES.filter((m) => m.group === 'revenue').map(renderTab)}
          </div>

          {MODULES.map((m) => (
            <Panel
              key={m.id}
              def={m}
              hidden={active !== m.id}
              href={
                m.href === 'whatsapp' ? whatsappHref(t('waOcaq')) : withLocale(locale, m.href)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Panel({ def, hidden, href }: { def: ModuleDef; hidden: boolean; href: string }) {
  const t = useTranslations('homeV2');
  const tm = useTranslations('homeV2.modules');
  const id = def.id;
  const external = def.href === 'whatsapp';
  const ctaClass = `${styles.btn} ${styles.btnDark} ${styles.btnSm}`;
  const kpiClass = [
    styles.mockKpi,
    def.kpiTone === 'ok' ? styles.mockKpiOk : '',
    def.kpiTone === 'beta' ? styles.mockKpiBeta : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCell = (cell: Cell, i: number) => {
    if ('label' in cell) {
      return (
        <td key={i}>
          <b>{tm(cell.label)}</b> {tm(cell.k)}
        </td>
      );
    }
    const cls = [cell.num ? styles.num : '', cell.hot ? styles.new : ''].filter(Boolean).join(' ');
    return (
      <td key={i} className={cls || undefined}>
        {'v' in cell ? cell.v : tm(cell.k)}
      </td>
    );
  };

  return (
    <div
      className={styles.panel}
      role="tabpanel"
      id={`p-${id}`}
      aria-labelledby={`t-${id}`}
      hidden={hidden}
    >
      <div>
        <div className={styles.pEyebrow}>
          <span className={styles.eyebrow}>
            {def.group === 'cost' ? tm('costEyebrow') : tm('revEyebrow')}
          </span>
          <span className={`${styles.status} ${def.status === 'live' ? styles.live : styles.beta}`}>
            {def.status === 'live' ? tm('live') : tm('beta')}
          </span>
        </div>
        <h3 className={styles.h3}>{tm(`${id}.title`)}</h3>
        <div className={styles.stat}>
          <b>{tm(`${id}.statValue`)}</b>
          <p>
            {tm(`${id}.stat`)}
            {def.hasNote && <small>{tm(`${id}.statNote`)}</small>}
          </p>
        </div>
        <ol className={styles.steps}>
          {(['1', '2', '3'] as const).map((n) => (
            <li key={n}>
              <span className={styles.n} aria-hidden="true">
                {n}
              </span>
              <div>
                <h4>{tm(`${id}.s${n}t`)}</h4>
                <p>{tm(`${id}.s${n}p`)}</p>
              </div>
            </li>
          ))}
        </ol>
        {external ? (
          <a className={ctaClass} href={href} target="_blank" rel="noopener noreferrer">
            {tm(def.ctaKey)}
          </a>
        ) : (
          <Link className={ctaClass} href={href}>
            {tm(def.ctaKey)}
          </Link>
        )}
      </div>

      <div className={styles.stage}>
        <div className={styles.mock}>
          <div className={styles.mockHead}>
            <div>
              <div className={styles.mockTitle}>{tm(`${id}.mockTitle`)}</div>
              <div className={styles.mockSub}>{tm(`${id}.mockSub`)}</div>
            </div>
            <div className={kpiClass}>
              <small>{tm(`${id}.kpiLabel`)}</small>
              <b>{def.kpi ?? tm('beta')}</b>
            </div>
          </div>
          <table className={styles.mt}>
            {def.head && (
              <thead>
                <tr>
                  {(['c1', 'c2', 'c3', 'c4'] as const).map((c) => (
                    <th key={c} scope="col">
                      {tm(`${id}.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {def.rows.map((row, ri) => (
                <tr key={ri} className={row.hl ? styles.hl : undefined}>
                  {row.cells.map(renderCell)}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.mockFoot}>
            <span>{tm(`${id}.foot1`)}</span>
            <span>{tm(`${id}.foot2`)}</span>
          </div>
        </div>
        <div className={styles.sample}>{t(def.sampleKey)}</div>
        <AgentCard id={id} running={!hidden} />
      </div>
    </div>
  );
}

const STEP_MS = [3200, 1100, 3200] as const;

/** «Siqnal → Addım atıldı» loop: signal (3.2s) → busy (1.1s) → action done (3.2s). Pausable. */
function AgentCard({ id, running }: { id: ModuleId; running: boolean }) {
  const tm = useTranslations('homeV2.modules');
  const reduce = useReducedMotion();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  // null = follow the visitor's motion preference; true/false = the pause button was used.
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduce;
  // Under reduced motion the card rests on its final state until the visitor presses play.
  const shown: 0 | 1 | 2 = override === null && reduce ? 2 : step;

  useEffect(() => {
    if (paused || !running) return;
    const timer = window.setTimeout(
      () => setStep((s) => ((s + 1) % 3) as 0 | 1 | 2),
      STEP_MS[step],
    );
    return () => window.clearTimeout(timer);
  }, [step, paused, running]);

  const done = shown === 2;
  return (
    <div className={styles.agent} role="status" aria-live="polite">
      <div className={styles.agentTop}>
        <span className={styles.agentTag}>
          <span className={styles.sq}>
            <Icon name="check" />
          </span>
          <span>{done ? tm('stepDone') : tm('signal')}</span>
        </span>
        <button
          type="button"
          className={styles.pause}
          aria-label={paused ? tm('resume') : tm('pause')}
          aria-pressed={paused}
          onClick={() => setOverride(!paused)}
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </button>
      </div>
      <p className={styles.agentMsg}>
        {done ? tm(`${id}.agent.action`) : tm(`${id}.agent.signal`)}
      </p>
      <span className={`${styles.agentBtn} ${done ? styles.agentBtnDone : ''}`}>
        {done && <Icon name="check" />}
        {shown === 0 ? tm(`${id}.agent.btn`) : shown === 1 ? tm(`${id}.agent.busy`) : tm(`${id}.agent.done`)}
      </span>
    </div>
  );
}
