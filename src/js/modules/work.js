/**
 * WORK · gallery grid, filter, and lightbox.
 *
 * The client's artwork renders true here — no duotone, no tint. The Sediment
 * duotone is for photography; these pieces are the product being sold, and
 * flattening their colour into green/coral would destroy the thing on show.
 */

import { WORKS, FILTERS } from "../data/works.js";

const html = String.raw;

/* Text from the dataset goes in via textContent / attribute setters, never
   innerHTML — the only interpolated markup is our own static structure. */
function card(work, index) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "work__item reveal";
  el.dataset.category = work.category;
  el.dataset.id = work.id;
  el.style.setProperty("--reveal-delay", `${(index % 4) * 0.06}s`);
  el.setAttribute("aria-haspopup", "dialog");

  el.innerHTML = html`
    <span class="work__thumb">
      <span class="work__idx"></span>
      <img loading="lazy" decoding="async" />
    </span>
    <span class="work__meta">
      <span class="work__title"></span>
      <span class="work__disc"></span>
    </span>
  `;

  const img = el.querySelector("img");
  img.src = work.src;
  img.alt = work.alt;

  el.querySelector(".work__idx").textContent = String(index + 1).padStart(2, "0");
  el.querySelector(".work__title").textContent = work.title;
  el.querySelector(".work__disc").textContent = work.year;
  el.setAttribute("aria-label", `${work.title} — ${work.discipline}, ${work.year}. Open detail.`);

  return el;
}

export function initWork({ onReveal }) {
  const grid = document.getElementById("work-grid");
  const filterBar = document.getElementById("work-filters");
  const countEl = document.getElementById("work-count");
  if (!grid || !filterBar) return;

  /* --- Grid ------------------------------------------------------------- */
  const cards = WORKS.map((w, i) => card(w, i));
  cards.forEach((c) => grid.appendChild(c));

  /* --- Filters ---------------------------------------------------------- */
  let active = "all";

  FILTERS.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "work__filter";
    b.textContent = f.label;
    b.dataset.filter = f.id;
    b.setAttribute("aria-pressed", String(f.id === active));
    filterBar.appendChild(b);
  });

  const visible = () => WORKS.filter((w) => active === "all" || w.category === active);

  const setCount = () => {
    const n = visible().length;
    countEl.textContent = `${String(n).padStart(2, "0")} ${n === 1 ? "Piece" : "Pieces"}`;
  };

  const applyFilter = (id) => {
    active = id;
    filterBar.querySelectorAll(".work__filter").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.filter === id));
    });
    cards.forEach((c) => {
      const show = id === "all" || c.dataset.category === id;
      c.hidden = !show;
    });
    setCount();
    onReveal?.();
  };

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".work__filter");
    if (btn) applyFilter(btn.dataset.filter);
  });

  setCount();

  /* --- Lightbox --------------------------------------------------------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbTitle = document.getElementById("lightbox-title");
  const lbNote = document.getElementById("lightbox-note");
  const lbSpecs = document.getElementById("lightbox-specs");
  const lbIdx = document.getElementById("lightbox-idx");
  const lbClose = document.getElementById("lightbox-close");
  const lbPrev = document.getElementById("lightbox-prev");
  const lbNext = document.getElementById("lightbox-next");

  let current = 0;
  let lastFocus = null;

  const spec = (dt, dd) => {
    const row = document.createElement("div");
    row.className = "lightbox__spec";
    const k = document.createElement("dt");
    k.textContent = dt;
    const v = document.createElement("dd");
    v.textContent = dd;
    row.append(k, v);
    return row;
  };

  const paint = (i) => {
    // Step within the *filtered* set, so arrows never jump to a hidden piece.
    const set = visible();
    current = (i + set.length) % set.length;
    const w = set[current];

    lbImg.src = w.src;
    lbImg.alt = w.alt;
    lbTitle.textContent = w.title;
    lbNote.textContent = w.note;
    lbIdx.textContent = `${String(current + 1).padStart(2, "0")} / ${String(set.length).padStart(2, "0")}`;

    lbSpecs.replaceChildren(
      spec("Discipline", w.discipline),
      spec("Year", w.year),
      ...(w.client ? [spec("Client", w.client)] : []),
      spec("Tags", w.tags.join(" · "))
    );
  };

  const open = (id) => {
    const set = visible();
    const i = set.findIndex((w) => w.id === id);
    if (i < 0) return;

    lastFocus = document.activeElement;
    lb.hidden = false;
    // Next frame, so the transition has a from-state to animate out of.
    requestAnimationFrame(() => lb.classList.add("is-open"));
    document.body.classList.add("is-locked");
    paint(i);
    lbClose.focus();
  };

  const close = () => {
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    lastFocus?.focus();
    // Wait out the fade before pulling it from the a11y tree.
    setTimeout(() => {
      lb.hidden = true;
    }, 320);
  };

  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".work__item");
    if (c) open(c.dataset.id);
  });

  lbClose.addEventListener("click", close);
  lbPrev.addEventListener("click", () => paint(current - 1));
  lbNext.addEventListener("click", () => paint(current + 1));

  lb.addEventListener("click", (e) => {
    // Backdrop click — but not clicks that land on the panel or figure.
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") paint(current - 1);
    if (e.key === "ArrowRight") paint(current + 1);
    if (e.key === "Tab") {
      // Trap focus: the dialog is modal, so Tab must not reach the page.
      const focusables = lb.querySelectorAll("button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  return { cards };
}
