/**
 * @file glyphs.ts
 * Tile texture generation for HeroMotif canvas engine.
 * Each tile is an offscreen canvas: organic blob shape + radial gradient noise.
 * Matches Anthropic SparkCellularHero texture approach — no halftone overlay.
 */

export type GlyphKind = 'spark' | 'sprig';

/** 5×5 dot-matrix patterns used by motifEngine drawTile (1 = filled, 0 = empty) */
export const GLYPHS: Record<GlyphKind, number[][]> = {
  spark: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  sprig: [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
};

/** Seeded LCG pseudo-random — deterministic per tile index */
export function seededRng(seed: number): () => number {
  let s = (seed ^ 0x9e3779b1) >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    s = s >>> 0;
    return s / 0xffffffff;
  };
}

/** DK palette — red + gold + terracotta tones */
const TILE_COLORS = [
  '#E94560', // red primary
  '#D03050', // deep red
  '#B8324B', // darker red
  '#C5A022', // gold
  '#B8901F', // dark gold
  '#D98E73', // terracotta
  '#C47A5F', // deep terracotta
  '#E05070', // rose red
];

const SOLID_COLORS = [
  '#E94560',
  '#D03050',
  '#C5A022',
  '#D98E73',
  '#B8324B',
];

/** Pool size — matches Anthropic's 12 texture pool */
export const TEXTURE_POOL_SIZE = 12;

/**
 * Generate one organically-shaped tile texture (152x152 offscreen canvas).
 * Uses seeded RNG so textures are deterministic per slot.
 */
export function generateTileTexture(slot: number): HTMLCanvasElement {
  const rng = seededRng(slot * 0x165667b1);
  const size = 152;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  // Base fill
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = TILE_COLORS[Math.floor(rng() * TILE_COLORS.length)];
  ctx.fillRect(0, 0, size, size);

  // Radial gradient overlays (4 blobs of color noise)
  for (let i = 0; i < 4; i++) {
    const cx = size * rng();
    const cy = size * rng();
    const r = size * (0.3 + 0.35 * rng());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const col = TILE_COLORS[Math.floor(rng() * TILE_COLORS.length)];
    grad.addColorStop(0, col);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.14 + 0.14 * rng();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Fine noise dots
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = TILE_COLORS[Math.floor(rng() * TILE_COLORS.length)];
    const dotSize = 1 + 2 * rng();
    ctx.fillRect(size * rng(), size * rng(), dotSize, dotSize);
  }

  // Subtle stroke rim (DK red tint)
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#E94560';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#E94560';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(8, 8, size - 16, size - 16, 22);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Organic blob mask — superellipse shape
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#000';
  const a1 = rng() * Math.PI * 2;
  const a2 = rng() * Math.PI * 2;
  const a3 = rng() * Math.PI * 2;
  ctx.beginPath();
  const cx = size / 2, cy = size / 2;
  for (let i = 0; i <= 56; i++) {
    const t = (i / 56) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    // Superellipse: r = 1 / (|cos|^4 + |sin|^4)^(1/4)
    const r =
      (1 / Math.pow(Math.pow(Math.abs(cos), 4) + Math.pow(Math.abs(sin), 4), 0.25)) *
      (size * 0.385) *
      (1 + 0.03 * Math.sin(3 * t + a1) + 0.018 * Math.sin(7 * t + a2) + 0.01 * Math.sin(11 * t + a3));
    const x = cx + cos * r;
    const y = cy + sin * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
  return c;
}

/** Generate solid color tile (shown when fully revealed) */
export function generateSolidTile(slot: number): HTMLCanvasElement {
  const rng = seededRng(0x9e3779b1 * slot);
  const size = 152;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 27);
  ctx.fillStyle = SOLID_COLORS[slot % SOLID_COLORS.length];
  ctx.fill();

  ctx.save();
  ctx.clip();
  for (let i = 0; i < 3; i++) {
    const cx = size * rng();
    const cy = size * rng();
    const r = size * (0.35 + 0.35 * rng());
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, SOLID_COLORS[Math.floor(rng() * SOLID_COLORS.length)]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.restore();

  return c;
}
