import { reducedMotion } from '../motion/gsap';
import LogoLoop from './reactbits/LogoLoop';

/** Endless strip with the technologies of the skills (React Bits LogoLoop); still with reduced motion. */
export function StackMarquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="stack-marquee" aria-label="Stack habitual">
      <LogoLoop
        logos={items.map((item) => ({
          node: <span className="stack-item">{item}</span>,
          title: item,
        }))}
        speed={reducedMotion() ? 0 : 55}
        direction="left"
        logoHeight={44}
        gap={48}
        pauseOnHover
        fadeOut
        fadeOutColor="var(--bg)"
        ariaLabel="Tecnologías que uso"
      />
    </section>
  );
}
