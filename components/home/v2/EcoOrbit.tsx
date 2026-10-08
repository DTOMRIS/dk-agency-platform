/**
 * @file EcoOrbit.tsx
 * @purpose Homepage v2 ecosystem ring — KAZAN AI core, four module nodes, curved ring labels
 *          (POS · Clopos, suppliers, bank, team) and spinning arcs. Replaces PlatformCards on `/`.
 * @pattern A (useTranslations) — homeV2.eco
 * @task TASK-0512
 */

'use client';

import { useTranslations } from 'next-intl';
import styles from './homeV2.module.css';
import { inter } from './font';
import { Icon, Reveal, type IconName } from './shared';

const RING_PATH_ID = 'dk-home-eco-ring';
const RING_LABELS = [
  { key: 'pos', offset: '12.5%' },
  { key: 'suppliers', offset: '37.5%' },
  { key: 'bank', offset: '62.5%' },
  { key: 'team', offset: '87.5%' },
] as const;

const NODES: ReadonlyArray<{ key: 'n1' | 'n2' | 'n3' | 'n4'; icon: IconName; pos: string }> = [
  { key: 'n1', icon: 'calc', pos: styles.n1 },
  { key: 'n2', icon: 'team', pos: styles.n2 },
  { key: 'n3', icon: 'flame', pos: styles.n3 },
  { key: 'n4', icon: 'grid', pos: styles.n4 },
];

const LIST = ['l1', 'l2', 'l3', 'l4'] as const;

export default function EcoOrbit() {
  const t = useTranslations('homeV2.eco');
  return (
    <section className={`${styles.v2} ${inter.className}`} id="ekosistem">
      <div className={styles.sec}>
        <div className={`${styles.wrap} ${styles.eco}`}>
          <Reveal className={styles.orbit} ariaLabel={t('label')}>
            <svg className={styles.ring} viewBox="0 0 560 560" aria-hidden="true">
              <defs>
                <path
                  id={RING_PATH_ID}
                  d="M280,280 m-246,0 a246,246 0 1,1 492,0 a246,246 0 1,1 -492,0"
                />
              </defs>
              <circle
                cx="280"
                cy="280"
                r="246"
                fill="none"
                stroke="#E7E1D6"
                strokeWidth="2"
                strokeDasharray="2 12"
                strokeLinecap="round"
              />
              <circle cx="280" cy="280" r="190" fill="none" stroke="#EFEAE1" strokeWidth="22" />
              {RING_LABELS.map((l) => (
                <text key={l.key} className={styles.ringLabel}>
                  <textPath href={`#${RING_PATH_ID}`} startOffset={l.offset} textAnchor="middle">
                    {t(`ring.${l.key}`)}
                  </textPath>
                </text>
              ))}
              <g className={styles.spin}>
                <circle
                  cx="280"
                  cy="280"
                  r="190"
                  fill="none"
                  stroke="#E94560"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="70 1124"
                />
              </g>
              <g className={`${styles.spin} ${styles.spinRev}`}>
                <circle
                  cx="280"
                  cy="280"
                  r="190"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="18 300 10 866"
                />
              </g>
              <g className={`${styles.spin} ${styles.spinFast}`}>
                <circle
                  cx="280"
                  cy="280"
                  r="190"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="8 22 30 1134"
                />
              </g>
            </svg>
            <div className={styles.core}>
              <div>
                <small>DK AGENCY</small>
                <b className={styles.coreTitle}>
                  KAZAN AI<span className={styles.coreStar} aria-hidden="true">✦</span>
                </b>
              </div>
            </div>
            {NODES.map((node) => (
              <div key={node.key} className={`${styles.node} ${node.pos}`}>
                <Icon name={node.icon} />
                <span>{t(`nodes.${node.key}`)}</span>
              </div>
            ))}
          </Reveal>
          <Reveal>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              {t('eyebrow')}
            </span>
            <h2 className={`${styles.h2} ${styles.ecoH2}`}>{t('title')}</h2>
            <p className={styles.ecoD}>{t('desc')}</p>
            <ul className={styles.ecoList}>
              {LIST.map((key) => (
                <li key={key}>
                  <b>{t(`list.${key}.b`)}</b> — {t(`list.${key}.t`)}
                </li>
              ))}
            </ul>
            <p className={styles.ecoNote}>{t('note')}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
