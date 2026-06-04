'use client';

import { startTransition, useEffect, useRef, useState } from 'react';

interface RadarChartProps {
  labels: string[];
  values: number[];
  maxValue?: number;
  size?: number;
}

export default function RadarChart({ labels, values, maxValue = 100, size = 300 }: RadarChartProps) {
  const count = labels.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const rings = 4;

  const [drawn, setDrawn] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      startTransition(() => setDrawn(true));
      return;
    }
    const t = window.setTimeout(() => startTransition(() => setDrawn(true)), 100);
    return () => window.clearTimeout(t);
  }, []);

  function angleFor(i: number) {
    return (Math.PI * 2 * i) / count - Math.PI / 2;
  }

  function pointAt(i: number, value: number) {
    const a = angleFor(i);
    const r = (value / maxValue) * radius;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  const gridRings = Array.from({ length: rings }, (_, ring) => {
    const frac = (ring + 1) / rings;
    const pts = Array.from({ length: count }, (__, i) => {
      const p = pointAt(i, maxValue * frac);
      return `${p.x},${p.y}`;
    }).join(' ');
    return pts;
  });

  const axes = Array.from({ length: count }, (_, i) => {
    const p = pointAt(i, maxValue);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const dataPoints = values.map((v, i) => pointAt(i, drawn ? v : 0));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const labelPositions = labels.map((label, i) => {
    const p = pointAt(i, maxValue * 1.18);
    return { label, x: p.x, y: p.y, anchor: p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle' };
  });

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]" aria-label="Radar chart">
      {/* Grid rings */}
      {gridRings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--dk-border-soft, #e2e8f0)" strokeWidth="1" opacity={0.6} />
      ))}

      {/* Axes */}
      {axes.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--dk-border-soft, #e2e8f0)" strokeWidth="1" opacity={0.4} />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(197, 160, 34, 0.15)"
        stroke="var(--dk-gold, #C5A022)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="transition-all duration-1000 ease-out"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--dk-gold, #C5A022)" stroke="white" strokeWidth="2"
          className="transition-all duration-1000 ease-out" />
      ))}

      {/* Labels */}
      {labelPositions.map((lp, i) => (
        <text key={i} x={lp.x} y={lp.y} textAnchor={lp.anchor} dominantBaseline="middle"
          className="fill-slate-700 text-[9px] font-semibold" style={{ fontSize: '9px' }}>
          {lp.label.length > 14 ? lp.label.slice(0, 12) + '…' : lp.label}
        </text>
      ))}
    </svg>
  );
}
