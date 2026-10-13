import { useEffect, type RefObject } from 'react';
import { gsap, reducedMotion } from './gsap';

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * 3D tilt: inside `container`, the `target` of the `selector` element under a mouse leans towards the pointer
 * (perspective set in CSS) and a glare follows it (--glare-x/--glare-y). Touch screens and reduced motion
 * keep the cards flat.
 */
export function useTilt(
  container: RefObject<HTMLElement | null>,
  selector: string,
  target: string,
  degrees = 7,
) {
  useEffect(() => {
    const root = container.current;
    if (!root || reducedMotion() || !finePointer()) return;
    const movers = new WeakMap<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
    let current: HTMLElement | null = null;

    const mover = (element: HTMLElement) => {
      let entry = movers.get(element);
      if (!entry) {
        entry = {
          x: gsap.quickTo(element, 'rotationY', { duration: 0.6, ease: 'power3.out' }),
          y: gsap.quickTo(element, 'rotationX', { duration: 0.6, ease: 'power3.out' }),
        };
        movers.set(element, entry);
      }
      return entry;
    };
    const release = () => {
      if (!current) return;
      const entry = mover(current);
      entry.x(0);
      entry.y(0);
      current.style.removeProperty('--glare-o');
      current = null;
    };
    const move = (event: PointerEvent) => {
      const card = (event.target as Element).closest<HTMLElement>(selector);
      const element = card?.querySelector<HTMLElement>(target) ?? null;
      if (element !== current) release();
      if (!card || !element) return;
      current = element;
      const box = card.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      const entry = mover(element);
      entry.x(nx * degrees * 2);
      entry.y(-ny * degrees * 2);
      element.style.setProperty('--glare-x', `${(nx + 0.5) * 100}%`);
      element.style.setProperty('--glare-y', `${(ny + 0.5) * 100}%`);
      element.style.setProperty('--glare-o', '1');
    };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', release);
    return () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', release);
      release();
    };
  }, [container, selector, target, degrees]);
}

/**
 * Spotlight: the `selector` element under the pointer gets --spot-x/--spot-y (pointer position inside it), which
 * the CSS uses for a soft light and a glowing border that follow the cursor.
 */
export function useSpotlight(container: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const root = container.current;
    if (!root || !finePointer()) return;
    const move = (event: PointerEvent) => {
      const item = (event.target as Element).closest<HTMLElement>(selector);
      if (!item || !root.contains(item)) return;
      const box = item.getBoundingClientRect();
      item.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
      item.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
    };
    root.addEventListener('pointermove', move);
    return () => root.removeEventListener('pointermove', move);
  }, [container, selector]);
}
