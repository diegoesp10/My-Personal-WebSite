import { useLayoutEffect, type RefObject } from 'react';
import { gsap, reducedMotion, ScrollTrigger, SplitText } from './gsap';
import { introDone } from './intro';

/**
 * Hero entrance once the intro is over: the role decrypts itself, the headline rises line by line, then the
 * lead, the actions and the portrait plate. While scrolling away, the copy drifts up and fades.
 * Elements are marked with data-hero="eyebrow|title|lead|actions|meta|visual|cue".
 */
export function useHeroIntro(hero: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = hero.current;
    if (!root || reducedMotion()) return;
    const q = gsap.utils.selector(root);
    let cancelled = false;
    const context = gsap.context(() => gsap.set(q('[data-hero]'), { autoAlpha: 0 }), root);

    introDone().then(() => {
      if (cancelled) return;
      context.add(() => {
        const eyebrow = q('[data-hero="eyebrow"]')[0] as HTMLElement | undefined;
        const title = q('[data-hero="title"]')[0] as HTMLElement | undefined;
        const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
        // Containers whose content animates on its own become visible at once; the rest fade in explicitly.
        timeline.set(q('[data-hero="eyebrow"], [data-hero="title"], [data-hero="actions"]'), {
          autoAlpha: 1,
        });
        if (eyebrow)
          timeline.to(
            eyebrow,
            {
              duration: 1.4,
              ease: 'none',
              scrambleText: {
                text: eyebrow.textContent ?? '',
                chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/.·',
                revealDelay: 0.25,
                speed: 0.6,
              },
            },
            0,
          );
        if (title) {
          const split = SplitText.create(title, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'split-line',
          });
          timeline.from(split.lines, { yPercent: 115, duration: 1.3, stagger: 0.1 }, 0.1);
        }
        const show = (selector: string, from: gsap.TweenVars, at: number, duration = 1.1) =>
          timeline.fromTo(
            q(selector),
            { autoAlpha: 0, ...from },
            { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration },
            at,
          );
        show('[data-hero="visual"]', { scale: 0.94 }, 0.2, 1.4);
        show('[data-hero="lead"]', { y: 24, filter: 'blur(6px)' }, 0.45);
        timeline.from(
          q('[data-hero="actions"] > *'),
          { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.9 },
          0.6,
        );
        show('[data-hero="meta"]', {}, 0.85, 0.8);
        show('[data-hero="cue"]', { y: -10 }, 1.1, 0.8);

        gsap.to(q('.hero-copy'), {
          yPercent: -10,
          autoAlpha: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    });
    return () => {
      cancelled = true;
      context.revert();
    };
  }, [hero]);
}

/**
 * Career timeline: an accent line grows down the list while scrolling and each position lights up when the
 * line reaches it. Reduced motion shows the whole line from the start (CSS).
 */
export function useRoleTimeline(track: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = track.current;
    if (!root || reducedMotion()) return;
    const context = gsap.context(() => {
      const list = root.querySelector('.role-list');
      gsap.fromTo(
        root.querySelector('.role-progress'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.4 },
        },
      );
      root.querySelectorAll('.role-list li').forEach((item) =>
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          toggleClass: { targets: item, className: 'is-passed' },
        }),
      );
    }, root);
    return () => context.revert();
  }, [track]);
}
