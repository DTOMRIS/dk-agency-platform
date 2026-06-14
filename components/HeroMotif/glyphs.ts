/**
 * @file glyphs.ts
 * Dot-matrix glyph definitions for HeroMotif canvas engine.
 * Pure data — engine renders these as filled dots on the grid.
 * Extension point: add new GlyphKind + pattern to grow the library.
 */

export type GlyphKind = 'spark' | 'sprig';

/** Each glyph is a 5x5 grid of 0/1 (1 = filled dot) */
export interface GlyphDef {
  kind: GlyphKind;
  grid: number[][];
}

export const GLYPHS: Record<GlyphKind, number[][]> = {
  /** Spark/kıvılcım — DK "rəqəmsalın şəddi" */
  spark: [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  /** Sprig/başaq — bereket sembolü */
  sprig: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
  ],
};
