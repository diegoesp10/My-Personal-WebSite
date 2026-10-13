import { useEffect, useRef } from 'react';
import type { ThemeColors } from '../lib/useThemeColors';
import { reducedMotion } from '../motion/gsap';

const GLYPHS = '{}[]()<>/\\=+-*;:._#$%&01ABCDEF';
const FONT_SIZE = 15;
const CELL_W = FONT_SIZE * 0.66;
const CELL_H = FONT_SIZE * 1.3;
const RADIUS = 150;

/**
 * Field of code glyphs drawn on a 2D canvas: glyphs mutate, some flash in the accent colour and those around the
 * pointer light up and scramble. It fades out towards the centre, where the page text sits. Only the cells that
 * change are redrawn; with reduced motion it is drawn once and stays still.
 */
export function GlyphField({ colors }: { colors: ThemeColors }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const still = reducedMotion();
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let glyph = new Uint8Array(0);
    let base = new Float32Array(0);
    let heat = new Float32Array(0);
    let fade = new Float32Array(0);
    const pointer = { x: -1e4, y: -1e4, inside: false };
    let frame = 0;
    let last = 0;
    let visible = true;

    const draw = (index: number) => {
      const column = index % columns;
      const row = (index / columns) | 0;
      const x = column * CELL_W;
      const y = row * CELL_H;
      context.clearRect(x, y, CELL_W, CELL_H);
      if (!base[index] && !heat[index]) return;
      const cx = x + CELL_W / 2 - pointer.x;
      const cy = y + CELL_H / 2 - pointer.y;
      const near = pointer.inside ? Math.max(0, 1 - Math.hypot(cx, cy) / RADIUS) : 0;
      if (heat[index] > 0.02) {
        context.globalAlpha = Math.min(1, heat[index]) * fade[index];
        context.fillStyle = colors.accent;
      } else {
        context.globalAlpha = Math.min(1, base[index] + near * 0.55) * fade[index];
        context.fillStyle = near > 0.35 ? colors.ink : colors.muted;
      }
      context.fillText(GLYPHS[glyph[index]], x + CELL_W / 2, y + CELL_H / 2);
    };

    const drawAll = () => {
      context.clearRect(0, 0, width, height);
      for (let index = 0; index < glyph.length; index++) draw(index);
    };

    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.font = `${FONT_SIZE}px 'JetBrains Mono Variable', ui-monospace, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      columns = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      const size = columns * rows;
      glyph = new Uint8Array(size);
      base = new Float32Array(size);
      heat = new Float32Array(size);
      fade = new Float32Array(size);
      for (let index = 0; index < size; index++) {
        glyph[index] = (Math.random() * GLYPHS.length) | 0;
        base[index] = Math.random() < 0.82 ? 0.08 + Math.random() * 0.22 : 0;
        // Elliptical clearing in the centre for the message, softened towards the edges.
        const dx = ((index % columns) * CELL_W - width / 2) / (width * 0.36);
        const dy = (((index / columns) | 0) * CELL_H - height / 2) / (height * 0.34);
        fade[index] = Math.min(1, Math.max(0, Math.hypot(dx, dy) - 0.55) / 0.6);
      }
      drawAll();
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 40) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const dirty = new Set<number>();
      // A few glyphs mutate every frame; some of them flash in the accent colour.
      const changes = Math.max(4, (glyph.length * 0.006) | 0);
      for (let i = 0; i < changes; i++) {
        const index = (Math.random() * glyph.length) | 0;
        glyph[index] = (Math.random() * GLYPHS.length) | 0;
        if (Math.random() < 0.08) heat[index] = 1;
        dirty.add(index);
      }
      for (let index = 0; index < heat.length; index++)
        if (heat[index] > 0) {
          heat[index] = Math.max(0, heat[index] - dt * 1.6);
          dirty.add(index);
        }
      if (pointer.inside) {
        const reach = Math.ceil(RADIUS / CELL_W);
        const pc = (pointer.x / CELL_W) | 0;
        const pr = (pointer.y / CELL_H) | 0;
        for (let r = pr - reach; r <= pr + reach; r++)
          for (let c = pc - reach; c <= pc + reach; c++) {
            if (r < 0 || c < 0 || r >= rows || c >= columns) continue;
            const index = r * columns + c;
            if (Math.random() < 0.18) glyph[index] = (Math.random() * GLYPHS.length) | 0;
            dirty.add(index);
          }
      }
      dirty.forEach(draw);
    };

    const sizes = new ResizeObserver(resize);
    sizes.observe(element);
    resize();
    if (still) return () => sizes.disconnect();

    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    seen.observe(element);
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.inside =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height;
    };
    const leave = () => {
      pointer.inside = false;
      drawAll();
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      seen.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [colors]);

  return <canvas ref={canvas} className="glyph-field" aria-hidden="true" />;
}
