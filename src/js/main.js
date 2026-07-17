/**
 * MAIN · orchestrator.
 *
 * Boot order matters:
 *   1. work grid — the DOM must exist before reveals/ScrollTrigger measure it
 *   2. smooth scroll — must own the scroller before any trigger is created
 *   3. triggers (reveals, nav)
 *   4. preloader resolves → hero entrance
 *
 * Every module takes `reducedMotion` and is expected to degrade itself rather
 * than be branched around from here.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { runPreloader } from "./modules/preloader.js";
import { initSmoothScroll } from "./modules/smooth-scroll.js";
import { initReveals } from "./modules/reveals.js";
import { initNav } from "./modules/nav.js";
import { initCursor } from "./modules/cursor.js";
import { initWork } from "./modules/work.js";
import { initHeroWebGL } from "./modules/hero-webgl.js";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.defaults({ ease: "power2.out", duration: 0.6 });

/* -------------------------------------------------------------------------- */

async function boot() {
  document.getElementById("year").textContent = new Date().getFullYear();

  // 1 · Content first, THEN reveals. ScrollTrigger.batch() binds to the
  // elements matching its selector at creation time — build the grid after it
  // and all 13 cards sit at opacity 0 forever, with no error to show for it.
  let reveals;
  initWork({ onReveal: () => reveals?.refresh() });
  reveals = initReveals({ reducedMotion });

  // 2 · Scroller.
  const lenis = initSmoothScroll({ reducedMotion });

  // Lock scrolling until the curtain lifts; otherwise the hero entrance plays
  // to someone already halfway down the page. lenis.stop() only stops Lenis —
  // the class is what blocks native keyboard/scrollbar scrolling.
  lenis?.stop();
  document.body.classList.add("is-locked");

  // 3 · Triggers + chrome.
  initNav({ lenis });
  initCursor({ reducedMotion });

  // 4 · Hero WebGL — starts loading in parallel with the preloader.
  const band = document.getElementById("hero-band");
  const heroPromise = initHeroWebGL({
    canvas: document.getElementById("hero-canvas"),
    band,
    src: "public/images/self/wacky-portrait.jpg",
    reducedMotion,
  });

  const [{ exit }, hero] = await Promise.all([runPreloader({ reducedMotion }), heroPromise]);

  if (hero) {
    // Only now hide the CSS fallback — if WebGL failed, it stays.
    document.getElementById("hero").classList.add("has-webgl");

    gsap.to(
      { v: 0 },
      {
        v: 1,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate() {
          hero.setEnter(this.targets()[0].v);
        },
      }
    );

    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => hero.setScroll(self.progress),
    });
  }

  // 5 · Curtain up, hero in.
  const tl = exit();

  if (!reducedMotion) {
    // Per-line, not per-letter. Splitting the words into per-char boxes to
    // stagger them costs the kerning between pairs like "Wa" and "ck", which
    // at display size reads as a gappy word — the exact problem the diagonal
    // layout exists to solve. Whole lines keep the kerning.
    tl.from(
      "[data-hero-line]",
      { yPercent: 110, duration: 1.15, ease: "expo.out", stagger: 0.1 },
      "-=0.65"
    )
      .from(
        ".hero__meta .meta-strip__cell",
        { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.05 },
        "-=0.8"
      )
      .from(".hero__sub > *", { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, "-=0.6");
  }

  tl.eventCallback("onComplete", () => {
    lenis?.start();
    document.body.classList.remove("is-locked");
    // Fonts and the curtain have both settled — remeasure everything.
    ScrollTrigger.refresh();
  });
}

/**
 * A thrown error mid-boot must never strand the page behind a locked scroll
 * and an opaque preloader. Fail open: unlock, drop the curtain, show content.
 */
boot().catch((err) => {
  console.error("[wjy] boot failed — falling back to static page", err);
  document.body.classList.remove("is-locked");
  const pre = document.getElementById("preloader");
  if (pre) pre.style.display = "none";
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
});
