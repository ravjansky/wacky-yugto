/**
 * PRELOADER · counts real image decode progress, not a fake timer.
 *
 * Resolves once the hero's critical assets are decoded, then hands its exit
 * timeline back so main.js can hand off into the hero entrance.
 */

import { gsap } from "gsap";

const HERO_ASSETS = ["public/images/self/wacky-portrait.jpg"];

function preload(urls, onProgress) {
  let done = 0;
  const total = urls.length;

  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          const tick = () => {
            done += 1;
            onProgress(done / total);
            resolve();
          };
          img.onload = tick;
          img.onerror = tick; // A missing asset must not hang the page.
          img.src = url;
        })
    )
  );
}

export async function runPreloader({ reducedMotion }) {
  const root = document.getElementById("preloader");
  const fill = document.getElementById("preloader-fill");
  const count = document.getElementById("preloader-count");
  if (!root) return { exit: () => gsap.timeline() };

  const state = { p: 0, shown: 0 };

  const paint = () => {
    const v = Math.round(state.shown * 100);
    count.textContent = String(v).padStart(2, "0");
    gsap.set(fill, { scaleX: state.shown });
  };

  const advance = (p) => {
    state.p = p;
    // Ease the displayed number toward the real one so the count reads as
    // motion rather than a jump from 00 to 100 on a warm cache.
    gsap.to(state, {
      shown: p,
      duration: reducedMotion ? 0 : 0.7,
      ease: "power2.out",
      onUpdate: paint,
    });
  };

  paint();

  await preload(HERO_ASSETS, advance);
  // Fonts matter as much as images here — the hero is nothing but type.
  await (document.fonts?.ready ?? Promise.resolve());
  advance(1);

  // Let the fill visibly land on 100 before the curtain lifts.
  await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 620));

  const exit = () => {
    root.classList.add("is-done");

    if (reducedMotion) {
      gsap.set(root, { autoAlpha: 0, display: "none" });
      return gsap.timeline();
    }

    return gsap
      .timeline()
      .to(root.querySelector(".preloader__center"), {
        yPercent: -18,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.in",
      })
      .to(
        root.querySelector(".preloader__foot"),
        { yPercent: 40, autoAlpha: 0, duration: 0.5, ease: "power2.in" },
        "<"
      )
      .to(root, {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
        onComplete: () => gsap.set(root, { display: "none" }),
      });
  };

  return { exit };
}
