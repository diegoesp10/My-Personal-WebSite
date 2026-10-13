import { reducedMotion } from './gsap';

const KEY = 'intro-seen';
let finished = false;
let resolve: () => void = () => {};
const done = new Promise<void>((settle) => (resolve = settle));

/** Whether the brand intro plays: once per tab session, never with reduced motion. */
export function shouldPlayIntro() {
  if (reducedMotion()) return false;
  try {
    return sessionStorage.getItem(KEY) !== '1';
  } catch {
    return true;
  }
}

/** Called when the intro curtain has lifted (or was skipped): page entrances start then. */
export function markIntroDone() {
  if (finished) return;
  finished = true;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // Storage unavailable: the intro may play again on the next page load.
  }
  resolve();
}

/** Resolves once the intro is over, immediately when it does not play. */
export const introDone = () => {
  if (!finished && !shouldPlayIntro()) markIntroDone();
  return done;
};
