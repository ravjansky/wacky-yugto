/**
 * SMOOTH SCROLL · Lenis, wired into GSAP's ticker and ScrollTrigger.
 *
 * Lenis must drive ScrollTrigger.update, or every trigger reads a stale scroll
 * position. We drive Lenis from gsap.ticker rather than its own RAF so both
 * run on one loop.
 */

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothScroll({ reducedMotion }) {
  // Smooth scroll is itself a motion effect — honour the preference.
  if (reducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // gsap.ticker is in seconds, Lenis wants ms.
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
