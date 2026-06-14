/**
 * @file HeroMotif.tsx
 * Reusable animated motif component for DK Agency.
 * 'use client' — canvas + rAF + IntersectionObserver.
 *
 * Usage: <HeroMotif preset="brand" />
 * Three presets: brand (homepage), kazan (advisor), editorial (long-form article).
 */
'use client';

import { useRef, useEffect } from 'react';
import { createMotifEngine, type MotifEngine } from './motifEngine';
import { PRESETS, type MotifPreset, type Variant, type ClusterShape, type PaletteEntry } from './presets';
import type { GlyphKind } from './glyphs';

export interface HeroMotifProps {
  preset?: MotifPreset;
  palette?: PaletteEntry[];
  density?: number;
  speed?: number;
  glyphs?: GlyphKind[];
  glyphRatio?: number;
  cluster?: ClusterShape;
  tileCount?: number;
  variant?: Variant;
  className?: string;
  ariaLabel?: string;
}

export default function HeroMotif({
  preset = 'brand',
  palette,
  density,
  speed,
  glyphs,
  glyphRatio,
  cluster,
  tileCount,
  variant,
  className = '',
  ariaLabel,
}: HeroMotifProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MotifEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const base = PRESETS[preset];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    const engine = createMotifEngine(canvas, {
      palette: palette || base.palette,
      density: density ?? base.density,
      speed: speed ?? base.speed,
      glyphs: glyphs || base.glyphs,
      glyphRatio: glyphRatio ?? base.glyphRatio,
      cluster: cluster || base.cluster,
      tileCount,
      reducedMotion,
      isMobile,
    });

    engineRef.current = engine;

    // IntersectionObserver — offscreen pause
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          engine.start();
        } else {
          engine.stop();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    // Visibility change — tab hidden pause
    const handleVisibility = () => {
      if (document.hidden) {
        engine.stop();
      } else {
        engine.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Resize
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.destroy();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [preset, palette, density, speed, glyphs, glyphRatio, cluster, tileCount]);

  const v = variant || PRESETS[preset].variant;
  const heightClass = v === 'band' ? 'h-32 sm:h-40' : v === 'sidebar' ? 'h-full min-h-[300px]' : 'h-full min-h-[400px]';

  return (
    <div className={`relative overflow-hidden ${heightClass} ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      {ariaLabel && (
        <span className="sr-only">{ariaLabel}</span>
      )}
    </div>
  );
}
