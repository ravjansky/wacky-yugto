/**
 * REVEALS · adds .is-in as elements enter. CSS carries the actual motion, so
 * this stays a class toggle rather than a tween — one less thing GSAP has to
 * own, and the transition survives if this module never runs.
 *
 * batch() coordinates elements that enter together (grid rows, skill rows)
 * instead of firing a separate trigger per element.
 */

import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initReveals({ reducedMotion }) {
  const show = (els) => els.forEach((el) => el.classList.add("is-in"));

  if (reducedMotion) {
    // Content arrives instantly.
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
    return { refresh: () => {} };
  }

  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    onEnter: show,
  });

  return {
    /** Re-scan after the grid filters, so newly shown cards still reveal. */
    refresh: () => {
      document.querySelectorAll(".work__item:not([hidden]).reveal").forEach((el) => el.classList.add("is-in"));
      ScrollTrigger.refresh();
    },
  };
}
