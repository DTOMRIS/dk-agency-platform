/**
 * @file presets.ts
 * SSOT for HeroMotif preset configurations.
 * Pure data — engine reads these, no side effects.
 */

import type { GlyphKind } from './glyphs';

export type MotifPreset = 'brand' | 'kazan' | 'editorial';
export type ClusterShape = 'staircase' | 'centered' | 'band';
export type Variant = 'sidebar' | 'band' | 'fill';

export interface PaletteEntry {
  color: string;
  weight: number; // 0..1, relative frequency
}

export interface PresetConfig {
  palette: PaletteEntry[];
  density: number;       // 0..1
  speed: number;         // multiplier, 1 = default
  glyphs: GlyphKind[];
  glyphRatio: number;    // 0..1
  cluster: ClusterShape;
  variant: Variant;
}

/** DK brand colors */
const RED = '#E94560';
const GOLD = '#C5A022';
const TERRACOTTA = '#D98E73';
const DEEP_RED = '#B8324B';
const NAVY = '#1A1A2E';

export const PRESETS: Record<MotifPreset, PresetConfig> = {
  /** Ana sayfa hero — red-forward, yavaş, staircase */
  brand: {
    palette: [
      { color: RED, weight: 0.45 },
      { color: GOLD, weight: 0.25 },
      { color: DEEP_RED, weight: 0.15 },
      { color: TERRACOTTA, weight: 0.1 },
      { color: NAVY, weight: 0.05 },
    ],
    density: 0.5,
    speed: 0.7,
    glyphs: ['spark', 'sprig'],
    glyphRatio: 0.15,
    cluster: 'staircase',
    variant: 'sidebar',
  },

  /** KAZAN advisor hero — toplanma hissi, centered */
  kazan: {
    palette: [
      { color: RED, weight: 0.35 },
      { color: TERRACOTTA, weight: 0.3 },
      { color: GOLD, weight: 0.15 },
      { color: DEEP_RED, weight: 0.15 },
      { color: NAVY, weight: 0.05 },
    ],
    density: 0.7,
    speed: 1.0,
    glyphs: ['spark', 'sprig'],
    glyphRatio: 0.2,
    cluster: 'centered',
    variant: 'fill',
  },

  /** Amiral Editorial — sakin, band */
  editorial: {
    palette: [
      { color: NAVY, weight: 0.3 },
      { color: RED, weight: 0.25 },
      { color: GOLD, weight: 0.25 },
      { color: TERRACOTTA, weight: 0.1 },
      { color: DEEP_RED, weight: 0.1 },
    ],
    density: 0.3,
    speed: 0.4,
    glyphs: ['spark'],
    glyphRatio: 0.1,
    cluster: 'band',
    variant: 'band',
  },
};
