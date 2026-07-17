/**
 * CURSOR · a coral ring that trails the pointer and labels what it's over.
 *
 * Desktop pointers only. CSS already hides it on coarse pointers; this bails
 * early so we never attach listeners on touch.
 */

import { gsap } from "gsap";

export function initCursor({ reducedMotion }) {
  const el = document.getElementById("cursor");
  const label = document.getElementById("cursor-label");
  if (!el) return;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || reducedMotion) return;

  const xTo = gsap.quickTo(el, "x", { duration: 0.42, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.42, ease: "power3" });

  let shown = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!shown) {
        shown = true;
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
      // Offset by half the ring so it centres on the hotspot.
      xTo(e.clientX - 17);
      yTo(e.clientY - 17);
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => {
    shown = false;
    gsap.to(el, { opacity: 0, duration: 0.3 });
  });

  // Delegated: the work grid is built after this module runs, so binding to
  // the elements directly here would miss every card.
  const HOVER_SELECTOR = "a, button, .work__item";

  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest(HOVER_SELECTOR);
    if (!t) return;
    label.textContent = t.dataset.cursor || (t.closest(".work__item") ? "View" : "Go");
    el.classList.add("is-hovering");
    gsap.to(el, { scale: 1.9, duration: 0.35, ease: "power3.out" });
  });

  document.addEventListener("pointerout", (e) => {
    if (!e.target.closest(HOVER_SELECTOR)) return;
    el.classList.remove("is-hovering");
    gsap.to(el, { scale: 1, duration: 0.35, ease: "power3.out" });
  });
}
