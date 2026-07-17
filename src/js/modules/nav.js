/**
 * NAV · hide-on-scroll-down, section counter, active link.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initNav({ lenis }) {
  const nav = document.getElementById("nav");
  const index = document.getElementById("nav-index");
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = [...document.querySelectorAll("[data-section-index]")];
  const total = String(sections.length).padStart(2, "0");

  /* --- Hide going down, show coming up ---------------------------------- */
  ScrollTrigger.create({
    start: "top -80",
    end: "max",
    onUpdate: (self) => {
      // Never hide it while it's at the very top of the page.
      const hide = self.direction === 1 && self.scroll() > 200;
      nav.classList.toggle("is-hidden", hide);
    },
  });

  /* --- Flip to ink type while over a Drift (light) section --------------- */
  const lightSections = document.querySelectorAll(".invert");
  let lightCount = 0;
  lightSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      // The nav is a bar at the top, so what matters is whether a light
      // section is under *it* — not whether the section is centred.
      start: "top 56px",
      end: "bottom 56px",
      onToggle: (self) => {
        lightCount += self.isActive ? 1 : -1;
        nav.classList.toggle("nav--on-light", lightCount > 0);
      },
    });
  });

  /* --- Counter + active link -------------------------------------------- */
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        index.textContent = `${section.dataset.sectionIndex} / ${total}`;
        const id = section.id;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
      },
    });
  });

  /* --- Anchor scrolling, routed through Lenis --------------------------- */
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -10, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });

  /* --- Hero type parallax ----------------------------------------------- */
  const heroLines = document.querySelectorAll("[data-hero-line]");
  if (heroLines.length) {
    gsap.to(heroLines[0], {
      yPercent: -38,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(heroLines[1], {
      yPercent: 26,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });
  }
}
