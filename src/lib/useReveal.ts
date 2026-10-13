import { useLayoutEffect, useRef, type RefObject } from 'react';

const inViewport = (element: Element) => {
  const box = element.getBoundingClientRect();
  return box.top < window.innerHeight && box.bottom > 0;
};

/**
 * Fades in the elements marked with `data-reveal` as they enter the viewport (styles/motion.css).
 * After a navigation, what is already on screen appears with the page transition instead, so only
 * content further down is revealed while scrolling. Elements added later (data loaded on demand) are
 * picked up too. Without IntersectionObserver or with reduced motion, everything is simply visible.
 */
export function useReveal(container: RefObject<HTMLElement | null>, key: string) {
  const firstPage = useRef(true);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    if (
      !('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    document.documentElement.classList.add('reveal-on');
    const instant = !firstPage.current;
    firstPage.current = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    const watch = (element: Element, now: boolean) => {
      if (element.classList.contains('is-visible')) return;
      if (now && inViewport(element)) element.classList.add('is-visible', 'is-instant');
      else observer.observe(element);
    };
    root.querySelectorAll('[data-reveal]').forEach((element) => watch(element, instant));

    const mutations = new MutationObserver((records) => {
      for (const record of records)
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) watch(node, false);
          node.querySelectorAll('[data-reveal]').forEach((element) => watch(element, false));
        });
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [container, key]);
}
