import { useEffect, useRef } from 'react';
import { reducedMotion } from '../motion/gsap';

const GAP = 24;
const RADIUS = 1.5;
const REACH = 150;

/**
 * Grid of dots behind a band: dots near the pointer swell and are pushed aside, then settle back. It only
 * draws while something moves. `color` is a CSS colour or a custom property (--band-ink) read from the
 * page; with reduced motion the grid stays still.
 */
export function DotField({ color }: { color: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const still = reducedMotion();
    const fill = color.startsWith('--')
      ? getComputedStyle(element).getPropertyValue(color).trim() || '#000'
      : color;
    let width = 0;
    let height = 0;
    let points: { x: number; y: number; dx: number; dy: number; s: number }[] = [];
    const pointer = { x: -1e4, y: -1e4, inside: false };
    let frame = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = fill;
      let moving = false;
      for (const point of points) {
        let tx = 0;
        let ty = 0;
        let ts = 0;
        if (pointer.inside) {
          const ox = point.x - pointer.x;
          const oy = point.y - pointer.y;
          const distance = Math.hypot(ox, oy);
          if (distance < REACH) {
            const force = (1 - distance / REACH) ** 2;
            tx = (ox / (distance || 1)) * force * 14;
            ty = (oy / (distance || 1)) * force * 14;
            ts = force;
          }
        }
        point.dx += (tx - point.dx) * 0.18;
        point.dy += (ty - point.dy) * 0.18;
        point.s += (ts - point.s) * 0.18;
        if (Math.abs(tx - point.dx) + Math.abs(ty - point.dy) + Math.abs(ts - point.s) > 0.02)
          moving = true;
        context.globalAlpha = 0.28 + point.s * 0.6;
        context.beginPath();
        context.arc(
          point.x + point.dx,
          point.y + point.dy,
          RADIUS * (1 + point.s * 1.8),
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;
      frame = moving || pointer.inside ? requestAnimationFrame(draw) : 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = [];
      const offsetX = (width % GAP) / 2;
      const offsetY = (height % GAP) / 2;
      for (let y = offsetY + GAP / 2; y < height; y += GAP)
        for (let x = offsetX + GAP / 2; x < width; x += GAP)
          points.push({ x, y, dx: 0, dy: 0, s: 0 });
      schedule();
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(element);
    resize();
    if (still) return () => sizes.disconnect();

    const host = element.parentElement ?? element;
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.inside = true;
      schedule();
    };
    const leave = () => {
      pointer.inside = false;
      schedule();
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
    };
  }, [color]);

  return <canvas ref={canvas} className="dot-field" aria-hidden="true" />;
}
