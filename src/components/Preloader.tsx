import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '../motion/gsap';
import { markIntroDone } from '../motion/intro';

const MIN_SECONDS = 1.1;

/**
 * Brand intro on the first page of a visit: the mark appears, a counter runs while the content loads and a
 * curtain lifts to reveal the page. It never waits longer than the content: when `ready` arrives after the
 * minimum time, the counter completes and the curtain goes up. Page entrances start when it finishes
 * (motion/intro.ts).
 */
export function Preloader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const progress = useRef({ value: 0 });
  const loading = useRef<gsap.core.Tween | null>(null);
  const started = useRef(performance.now());

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.preloader-mark > *', {
        yPercent: 110,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.07,
      });
      gsap.from('.preloader-meta', { autoAlpha: 0, y: 12, duration: 0.8, delay: 0.25 });
      loading.current = gsap.to(progress.current, {
        value: 86,
        duration: 2.4,
        ease: 'power2.out',
        onUpdate: () => {
          if (count.current)
            count.current.textContent = String(Math.round(progress.current.value)).padStart(3, '0');
        },
      });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const wait = Math.max(0, MIN_SECONDS - (performance.now() - started.current) / 1000);
    const context = gsap.context(() => {
      loading.current?.kill();
      gsap
        .timeline({ delay: wait, onComplete: onDone })
        .to(progress.current, {
          value: 100,
          duration: 0.45,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count.current)
              count.current.textContent = String(Math.round(progress.current.value)).padStart(
                3,
                '0',
              );
          },
        })
        .to(
          '.preloader-mark > *',
          { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.04 },
          '+=0.1',
        )
        .to('.preloader-meta', { autoAlpha: 0, duration: 0.3 }, '<')
        .call(markIntroDone, undefined, '-=0.15')
        .to(
          root.current,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' },
          '-=0.25',
        );
    }, root);
    return () => context.revert();
  }, [ready, onDone]);

  // Leaving early (the content failed and the error page opened): page entrances must not wait forever.
  useEffect(() => markIntroDone, []);

  return (
    <div ref={root} className="preloader" role="status" aria-label="Cargando la web">
      <div className="preloader-mark" aria-hidden="true">
        <span>de</span>
        <i />
      </div>
      <div className="preloader-meta" aria-hidden="true">
        <span>Cargando portfolio</span>
        <span>
          <span ref={count}>000</span> %
        </span>
      </div>
    </div>
  );
}
