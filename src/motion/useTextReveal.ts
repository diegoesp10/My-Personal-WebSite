import { useLayoutEffect, type RefObject } from 'react';
import { gsap, reducedMotion, SplitText } from './gsap';
import { introDone } from './intro';

const TITLES = '.page-title, .section-heading h2, [data-split]';

/**
 * Titles rise line by line from behind a mask as they enter the viewport (GSAP SplitText + ScrollTrigger).
 * Their block no longer uses the CSS reveal, so nothing animates twice. The hero has its own sequence
 * (pages/HomePage). Lines are recalculated when the width changes; nothing happens with reduced motion.
 */
export function useTextReveal(container: RefObject<HTMLElement | null>, key: string) {
  useLayoutEffect(() => {
    const root = container.current;
    if (!root || reducedMotion()) return;
    let cancelled = false;
    const titles = [...root.querySelectorAll<HTMLElement>(TITLES)].filter(
      (title) => !title.closest('.hero') && !title.dataset.splitDone,
    );
    // Hidden until the intro is over, so the first lines do not finish their entrance under the curtain.
    const context = gsap.context(() => {
      titles.forEach((title) => {
        title.dataset.splitDone = '1';
        title.closest('[data-reveal]')?.classList.add('reveal-by-text');
        gsap.set(title, { autoAlpha: 0 });
      });
    }, root);
    introDone().then(() => {
      if (cancelled) return;
      context.add(() => {
        titles.forEach((title) => {
          gsap.set(title, { autoAlpha: 1 });
          SplitText.create(title, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: 'expo.out',
                stagger: 0.09,
                scrollTrigger: { trigger: title, start: 'top 90%', once: true },
              }),
          });
        });
      });
    });
    return () => {
      cancelled = true;
      context.revert();
      titles.forEach((title) => delete title.dataset.splitDone);
    };
  }, [container, key]);
}
