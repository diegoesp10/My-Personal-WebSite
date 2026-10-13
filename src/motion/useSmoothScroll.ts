import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { gsap, reducedMotion, ScrollTrigger } from './gsap';

let instance: Lenis | null = null;

/** The running smooth scroll, if any (null with reduced motion or before the layout mounts). */
export const smoothScroll = () => instance;

/**
 * Smooth, inertial scrolling with Lenis, driven by the GSAP ticker so ScrollTrigger animations stay in sync.
 * Anchor links scroll smoothly too. It stops while the mobile menu is open, and elements marked with
 * data-lenis-prevent (dialogs, the menu) keep their own native scrolling. Off with reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -96 } });
    instance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const menu = new MutationObserver(() =>
      document.body.classList.contains('menu-open') ? lenis.stop() : lenis.start(),
    );
    menu.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      menu.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);
}

/**
 * After a navigation the router restores or resets the scroll position: Lenis drops any scroll still in
 * flight, adopts that position and measures the new page; ScrollTrigger recalculates its positions.
 */
export function syncScrollAfterNavigation() {
  instance?.scrollTo(window.scrollY, { immediate: true, force: true });
  instance?.resize();
  ScrollTrigger.refresh();
}
