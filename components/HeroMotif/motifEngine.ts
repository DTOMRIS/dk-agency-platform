/**
 * @file motifEngine.ts
 * Framework-agnostic canvas engine for HeroMotif.
 * Renders dot grid + halftone tiles + pixel glyphs with ambient animation.
 * No React dependency — pure canvas + rAF.
 */

import { GLYPHS, type GlyphKind } from './glyphs';
import type { PaletteEntry, ClusterShape } from './presets';

export interface EngineConfig {
  palette: PaletteEntry[];
  density: number;
  speed: number;
  glyphs: GlyphKind[];
  glyphRatio: number;
  cluster: ClusterShape;
  tileCount?: number;
  reducedMotion: boolean;
  isMobile: boolean;
}

interface Tile {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  targetOpacity: number;
  phase: number;        // animation phase offset
  isGlyph: boolean;
  glyphKind?: GlyphKind;
  born: number;         // timestamp born
  lifespan: number;     // ms before fade and respawn
}

const GRID_STEP = 6;    // dot grid spacing
const DOT_RADIUS = 0.8;
const TILE_SIZE_MIN = 16;
const TILE_SIZE_MAX = 40;
const TILE_GAP = 4;

function pickWeighted(palette: PaletteEntry[]): string {
  const total = palette.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of palette) {
    r -= p.weight;
    if (r <= 0) return p.color;
  }
  return palette[0].color;
}

function clusterPosition(
  shape: ClusterShape,
  w: number,
  h: number,
  tileSize: number,
): { x: number; y: number } {
  const pad = tileSize + TILE_GAP;
  switch (shape) {
    case 'staircase': {
      const col = Math.floor(Math.random() * Math.floor(w / pad));
      const row = Math.floor(Math.random() * Math.floor(h / pad));
      // staircase bias: tiles cluster toward bottom-right diagonal
      const diagBias = (col + row) / (Math.floor(w / pad) + Math.floor(h / pad));
      if (Math.random() > diagBias * 0.7 + 0.3) {
        return { x: col * pad, y: row * pad };
      }
      return { x: col * pad, y: row * pad };
    }
    case 'centered': {
      // gaussian-ish cluster around center
      const cx = w / 2, cy = h / 2;
      const spread = Math.min(w, h) * 0.35;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.abs(gaussRand()) * spread;
      return {
        x: Math.max(0, Math.min(w - tileSize, cx + Math.cos(angle) * dist - tileSize / 2)),
        y: Math.max(0, Math.min(h - tileSize, cy + Math.sin(angle) * dist - tileSize / 2)),
      };
    }
    case 'band': {
      // horizontal band in middle third
      const bandTop = h * 0.3;
      const bandH = h * 0.4;
      return {
        x: Math.random() * (w - tileSize),
        y: bandTop + Math.random() * bandH,
      };
    }
  }
}

function gaussRand(): number {
  // Box-Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function createTile(
  config: EngineConfig,
  w: number,
  h: number,
  now: number,
): Tile {
  const size = TILE_SIZE_MIN + Math.random() * (TILE_SIZE_MAX - TILE_SIZE_MIN);
  const pos = clusterPosition(config.cluster, w, h, size);
  const isGlyph = Math.random() < config.glyphRatio && config.glyphs.length > 0;

  return {
    x: pos.x,
    y: pos.y,
    size,
    color: pickWeighted(config.palette),
    opacity: 0,
    targetOpacity: 0.15 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
    isGlyph,
    glyphKind: isGlyph
      ? config.glyphs[Math.floor(Math.random() * config.glyphs.length)]
      : undefined,
    born: now,
    lifespan: 4000 + Math.random() * 8000,
  };
}

export interface MotifEngine {
  start(): void;
  stop(): void;
  resize(): void;
  destroy(): void;
}

export function createMotifEngine(
  canvas: HTMLCanvasElement,
  config: EngineConfig,
): MotifEngine {
  const ctx = canvas.getContext('2d', { alpha: true })!;
  let rafId = 0;
  let running = false;
  let tiles: Tile[] = [];
  let w = 0, h = 0, dpr = 1;

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getTileCount(): number {
    if (config.tileCount) return config.tileCount;
    const area = w * h;
    const base = Math.floor(area / 8000);
    const scaled = Math.round(base * config.density);
    return config.isMobile ? Math.min(scaled, 20) : Math.min(scaled, 50);
  }

  function initTiles(now: number) {
    const count = getTileCount();
    tiles = [];
    for (let i = 0; i < count; i++) {
      const t = createTile(config, w, h, now);
      t.opacity = t.targetOpacity * Math.random(); // stagger initial
      tiles.push(t);
    }
  }

  function drawDotGrid() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.04)'; // navy ultra-faint
    for (let x = 0; x < w; x += GRID_STEP) {
      for (let y = 0; y < h; y += GRID_STEP) {
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawTile(t: Tile, now: number) {
    if (t.opacity < 0.01) return;

    ctx.save();
    ctx.globalAlpha = t.opacity;

    if (t.isGlyph && t.glyphKind) {
      // Draw glyph as dot-matrix
      const grid = GLYPHS[t.glyphKind];
      const dotSize = t.size / 5;
      ctx.fillStyle = t.color;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (grid[row][col]) {
            const dx = t.x + col * dotSize + dotSize * 0.15;
            const dy = t.y + row * dotSize + dotSize * 0.15;
            const dr = dotSize * 0.35;
            ctx.beginPath();
            ctx.arc(dx + dr, dy + dr, dr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else {
      // Halftone textured tile
      ctx.fillStyle = t.color;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(t.x + r, t.y);
      ctx.lineTo(t.x + t.size - r, t.y);
      ctx.quadraticCurveTo(t.x + t.size, t.y, t.x + t.size, t.y + r);
      ctx.lineTo(t.x + t.size, t.y + t.size - r);
      ctx.quadraticCurveTo(t.x + t.size, t.y + t.size, t.x + t.size - r, t.y + t.size);
      ctx.lineTo(t.x + r, t.y + t.size);
      ctx.quadraticCurveTo(t.x, t.y + t.size, t.x, t.y + t.size - r);
      ctx.lineTo(t.x, t.y + r);
      ctx.quadraticCurveTo(t.x, t.y, t.x + r, t.y);
      ctx.closePath();
      ctx.fill();

      // Halftone dot pattern overlay
      ctx.globalAlpha = t.opacity * 0.3;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      const step = 4;
      for (let dx = 0; dx < t.size; dx += step) {
        for (let dy = 0; dy < t.size; dy += step) {
          if ((dx + dy) % (step * 2) === 0) {
            ctx.beginPath();
            ctx.arc(t.x + dx + 2, t.y + dy + 2, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
  }

  function tick(now: number) {
    if (!running) return;

    ctx.clearRect(0, 0, w, h);
    drawDotGrid();

    const speed = config.speed;
    const count = getTileCount();

    for (let i = tiles.length - 1; i >= 0; i--) {
      const t = tiles[i];
      const age = now - t.born;
      const life = t.lifespan;

      // Fade in (first 20%), hold, fade out (last 20%)
      const fadeIn = Math.min(1, age / (life * 0.2));
      const fadeOut = Math.max(0, 1 - Math.max(0, age - life * 0.8) / (life * 0.2));
      const breath = 1 + Math.sin(now * 0.001 * speed + t.phase) * 0.15;

      t.opacity = t.targetOpacity * fadeIn * fadeOut * breath;

      if (age > life) {
        // Respawn
        tiles[i] = createTile(config, w, h, now);
      }

      drawTile(t, now);
    }

    // Maintain tile count
    while (tiles.length < count) {
      tiles.push(createTile(config, w, h, now));
    }

    rafId = requestAnimationFrame(tick);
  }

  function drawStaticFrame() {
    sizeCanvas();
    const now = performance.now();
    initTiles(now);
    ctx.clearRect(0, 0, w, h);
    drawDotGrid();
    for (const t of tiles) {
      t.opacity = t.targetOpacity * 0.7;
      drawTile(t, now);
    }
  }

  return {
    start() {
      sizeCanvas();
      if (config.reducedMotion) {
        drawStaticFrame();
        return;
      }
      running = true;
      const now = performance.now();
      initTiles(now);
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    },
    resize() {
      sizeCanvas();
      if (config.reducedMotion) {
        drawStaticFrame();
      }
    },
    destroy() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      tiles = [];
    },
  };
}
