import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { loadGrid, type Grid } from './portraitGrid';
import { canUse3D, PortraitField3D } from './PortraitField3D';
import type { Profile } from '../lib/types';

type Colors = { ink: string; accent: string; dark: boolean };

const easeOut = (t: number) => 1 - (1 - t) ** 3;
// Stable pseudo-random offset per column: the scan front looks organic, not ruled.
const jitter = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

function readColors(): Colors {
  const style = getComputedStyle(document.documentElement);
  return {
    ink: style.getPropertyValue('--ink').trim() || '#16171a',
    accent: style.getPropertyValue('--accent').trim() || '#e2491d',
    dark: style.getPropertyValue('color-scheme').trim() === 'dark',
  };
}

/**
 * Generative portrait drawn on a canvas. It builds itself with a scan line the first time it is seen,
 * and the dots near the pointer grow and light up in the accent colour. On a light theme dot size follows
 * shadow; on a dark one it follows light, so the face always reads as lit.
 */
function DotCanvas({ label, onReady }: { label: string; onReady: (grid: Grid) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<Grid>();

  useEffect(() => {
    let active = true;
    loadGrid()
      .then((loaded) => {
        if (!active) return;
        setGrid(loaded);
        onReady(loaded);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [onReady]);

  useEffect(() => {
    const element = canvas.current;
    const container = box.current;
    const context = element?.getContext('2d');
    if (!grid || !element || !container || !context) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let colors = readColors();
    let width = 0;
    let height = 0;
    let pitch = 0;
    let started = reduced;
    let intro = reduced ? 1 : 0;
    let introStart = 0;
    let frame = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, target: 0 };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (!started) return;
      const inkDots = new Path2D();
      const accentDots = new Path2D();
      const maxRadius = pitch * 0.52;
      const scanRow = intro < 1 ? easeOut(intro) * (grid.rows + 10) - 5 : Infinity;
      const reach = pitch * 11;
      for (let row = 0; row < grid.rows; row++) {
        const y = (row + 0.5) * pitch;
        for (let column = 0; column < grid.columns; column++) {
          const index = row * grid.columns + column;
          const share = grid.share[index];
          if (!share) continue;
          const tone = grid.tone[index];
          const amount = colors.dark ? (1 - tone) ** 1.35 : tone ** 0.75;
          let radius = maxRadius * (0.12 + 0.88 * amount) * (0.35 + 0.65 * share);
          let lit = false;
          if (intro < 1) {
            const front = scanRow - row + jitter(column) * 3;
            if (front <= 0) continue;
            radius *= easeOut(Math.min(1, front / 5));
            lit = front < 2.4;
          }
          let x = (column + 0.5) * pitch;
          let dotY = y;
          if (pointer.strength > 0.01) {
            // Lens: nearby dots move away from the pointer, grow slightly and take the accent colour.
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < reach && distance > 0.01) {
              const pull = (1 - distance / reach) ** 2 * pointer.strength;
              const push = pitch * 1.6 * pull;
              x += (dx / distance) * push;
              dotY += (dy / distance) * push;
              radius *= 1 + 0.3 * pull;
              lit ||= pull > 0.12;
            }
          }
          if (radius < 0.3) continue;
          const path = lit ? accentDots : inkDots;
          path.moveTo(x + radius, dotY);
          path.arc(x, dotY, radius, 0, Math.PI * 2);
        }
      }
      context.fillStyle = colors.ink;
      context.fill(inkDots);
      context.fillStyle = colors.accent;
      context.fill(accentDots);
    };

    const tick = (now: number) => {
      frame = 0;
      let again = false;
      if (started && intro < 1) {
        introStart ||= now;
        intro = Math.min(1, (now - introStart) / 1900);
        again = intro < 1;
      }
      pointer.strength += (pointer.target - pointer.strength) * 0.14;
      pointer.x += (pointer.targetX - pointer.x) * 0.3;
      pointer.y += (pointer.targetY - pointer.y) * 0.3;
      if (
        Math.abs(pointer.target - pointer.strength) > 0.005 ||
        (pointer.strength > 0.01 &&
          Math.hypot(pointer.targetX - pointer.x, pointer.targetY - pointer.y) > 0.5)
      )
        again = true;
      draw();
      if (again) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(tick);
    };

    const resize = () => {
      width = container.clientWidth;
      pitch = width / grid.columns;
      height = pitch * grid.rows;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      element.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    const finish = () => {
      if (!started || intro >= 1) return;
      intro = 1;
      draw();
    };
    const hidden = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', hidden);
    const sizes = new ResizeObserver(resize);
    sizes.observe(container);
    resize();

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        // Background tabs do not run animation frames: show the finished portrait directly.
        if (document.hidden) finish();
        else schedule();
      },
      { threshold: 0.25 },
    );
    visibility.observe(container);

    const move = (event: PointerEvent) => {
      if (reduced) return;
      const bounds = element.getBoundingClientRect();
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;
      if (pointer.strength < 0.02) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      pointer.target = 1;
      schedule();
    };
    const leave = () => {
      pointer.target = 0;
      schedule();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);

    // Redraw synchronously on theme changes so the theme transition captures the new colours.
    const recolor = () => {
      colors = readColors();
      draw();
    };
    const theme = new MutationObserver(recolor);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', recolor);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', hidden);
      sizes.disconnect();
      visibility.disconnect();
      theme.disconnect();
      scheme.removeEventListener('change', recolor);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  }, [grid]);

  return (
    <div ref={box} className="dot-canvas">
      <canvas ref={canvas} role="img" aria-label={label} />
    </div>
  );
}

/** The portrait framed as a technical plate, with the person's technologies around it. */
export function PortraitPlate({
  profile,
  tags,
  caption = false,
}: {
  profile: Profile;
  tags: string[];
  caption?: boolean;
}) {
  const [grid, setGrid] = useState<Pick<Grid, 'columns' | 'rows' | 'count'>>();
  const [three, setThree] = useState(canUse3D);
  return (
    <figure className="portrait-plate">
      <div className="portrait-frame">
        <span className="hud hud-top-left" aria-hidden="true">
          fig. 01 · retrato generativo
        </span>
        <span className="hud hud-top-right" aria-hidden="true">
          {profile.location || 'retrato'}
        </span>
        {three ? (
          <PortraitField3D
            label={`Retrato de ${profile.name} compuesto por puntos en 3D`}
            onReady={setGrid}
            onFail={() => setThree(false)}
          />
        ) : (
          <DotCanvas label={`Retrato de ${profile.name} compuesto por puntos`} onReady={setGrid} />
        )}
        <span className="hud hud-bottom-left" aria-hidden="true">
          {grid
            ? `${grid.count.toLocaleString('es-ES')} puntos · ${grid.columns}×${grid.rows}`
            : 'renderizando…'}
        </span>
        <span className="hud hud-bottom-right" aria-hidden="true">
          <span className="hud-hint">{three ? 'gira con el cursor' : 'mueve el cursor'}</span>{' '}
          {three ? 'webgl 3d' : 'canvas 2d'}
        </span>
        <i className="corner corner-tl" aria-hidden="true" />
        <i className="corner corner-tr" aria-hidden="true" />
        <i className="corner corner-bl" aria-hidden="true" />
        <i className="corner corner-br" aria-hidden="true" />
      </div>
      {tags.length > 0 && (
        <ul className="portrait-tags" aria-label="Tecnologías principales">
          {tags.map((tag, index) => (
            <li key={tag} style={{ '--i': index } as CSSProperties}>
              {tag}
            </li>
          ))}
        </ul>
      )}
      {caption && (
        <figcaption className="portrait-caption">
          <strong>{profile.name}</strong>
          <span>{profile.role}</span>
        </figcaption>
      )}
    </figure>
  );
}
