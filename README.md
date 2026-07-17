# Wacky Jhay Yugto — Portfolio

Single-page portfolio for **Wacky Jhay Yugto**, creative designer and digital content
specialist. Built on the **Sediment** design system (`design-system.md`).

Buildless: plain HTML, CSS and ES modules. No bundler, no install step. Dependencies
load from CDN via an import map.

---

## Run it

The site is static — it only needs an HTTP server. ES modules and the import map will
**not** work over `file://`.

Already in XAMPP's `htdocs`, so with Apache running:

```
http://localhost/WACKY/
```

Any static server works as an alternative:

```bash
npx serve .
```

---

## Structure

```
index.html                  — every section; the single page
design-system.md            — Sediment, the system this is built on
src/
  css/
    tokens.css              — pigment, semantic colour, type, rhythm, motion
    base.css                — reset, surface, type primitives, grain, reveals
    components.css          — the six Sediment primitives + site chrome
    sections.css            — per-section composition
  js/
    main.js                 — orchestrator (boot order matters — see below)
    data/
      works.js              — the 13 pieces + metadata  ← edit content here
    modules/
      preloader.js          — real decode progress, not a fake timer
      smooth-scroll.js      — Lenis, wired into GSAP's ticker
      reveals.js            — ScrollTrigger.batch → .is-in
      nav.js                — hide-on-scroll, counter, light/dark flip
      cursor.js             — coral ring (fine pointers only)
      work.js               — grid, filter, lightbox
      hero-webgl.js         — Three.js duotone portrait shader
public/images/
  self/                     — portrait
  PHOTO EDITS/              — a.jpg – j.jpg
  PUBMATS/                  — 3 pubmats
  favicon/                  — favicons + webmanifest
```

## Sections

| # | Section | Composition |
|---|---------|-------------|
| — | Hero | Editorial — Drift gradient, WebGL portrait, name spread edge-to-edge |
| — | Marquee | Infinite strip, disciplines |
| 01 | Index / About | Hybrid — narrative + identifier + barcode |
| 02 | Faculties / Skills | Structural — Anton rows, coral rules, mono notes |
| 03 | Work | Structural — filterable grid + lightbox |
| 04 | Record / Experience | Structural — timeline |
| 05 | Foundation / Education | Structural — timeline |
| 06 | Contact | Editorial — Drift returns to bookend the page |

---

## Editing content

**Work pieces** live in `src/js/data/works.js` — the only place they're defined. The
grid, filters, count and lightbox all read from it. Add a piece by adding an object;
`category` must be `edits` or `pubmats`.

**Everything else** (bio, skills, experience, education, contact) is written directly
in `index.html`.

### Titles are provisional

The photo edits ship as `a.jpg`–`j.jpg`, so every title was read off the artwork
itself. Each entry carries a `titleSource`:

- `"artwork"` — the title is literally set in the piece (*Phenomenal*, *Immortal*,
  *標的*, *Mema Edit No.1*…).
- `"inferred"` — nothing in the piece names it; titled from its subject. Two of these:
  **Mamba Forever** (`c.jpg`) and **Padayon** (`halfway-through.jpg`).

Change `title` freely — nothing keys off it. Years are best-guess from dates visible in
the artwork and are worth a check.

---

## Decisions worth knowing

**The client's artwork is never duotoned.** Sediment's duotone is for photography. His
posters and vector work *are the product* — flattening that magenta and yellow into
green/coral would destroy the thing being sold. Only his portrait is treated. The forest
`--ink` surface is what makes his colour pop.

**The hero duotone is a luminance ramp, not the literal CSS recipe.** Transcribing
Sediment's multiply/screen stack into the shader maps this portrait — black clothing on a
red backdrop — almost entirely into `--ink`, and it renders as a black rectangle. The
shader ramps shadows→ink, highlights→coral instead, which is what the system actually
*specifies*. The CSS `.duotone` fallback keeps the literal recipe. Levels (`uBlack` /
`uWhite` in `hero-webgl.js`) are tuned to this photograph — **retune if it's swapped**.

**The hero name is spread letter-by-letter.** A centred 5-letter word is narrower than
the portrait plate, so the figure would cover the middle of the name and it would never
read. Spread, the plate occludes one glyph. Below 760px the composition unstacks
entirely — name above, portrait below — because at 390px there's no width to spend.

**Boot order is load-bearing.** `initWork()` must run *before* `initReveals()`.
`ScrollTrigger.batch()` binds to elements matching its selector at creation time; build
the grid after it and all 13 cards sit at `opacity: 0` forever, with no error to show
for it.

**Semantic colour layer.** Primitives reference `--c-type` / `--c-signal` / `--c-rule`,
never raw pigment. That's what lets one component sit on both ink and the Drift gradient.
`.invert` flips those four on light surfaces. Note the signal flip: coral can't be the
signal on a gradient that's part coral — on Drift, deep forest is.

---

## Accessibility

- `prefers-reduced-motion: reduce` kills the marquee, reveals, cursor, smooth scroll and
  the WebGL portrait (the CSS duotone fallback stands in). Content arrives instantly.
- Lightbox is a modal dialog: focus trap, Escape to close, arrow-key paging, focus
  returns to the trigger.
- Every image has alt text describing the artwork, not the filename.
- Skip link, visible coral focus rings, `sr-only` H1 carrying the full name.
- No WebGL / texture failure → CSS duotone. JS failure → boot catch unlocks scroll,
  drops the curtain and shows all content.

## Browser support

Modern evergreen browsers. Needs import maps (Chrome/Edge 89+, Safari 16.4+,
Firefox 108+), `svh` units and `mix-blend-mode`.

---

## Contact & CTA

The contact section (06) carries, in order of prominence:

1. **Email** — `jpalalon16@gmail.com`, the primary CTA, its own full-width row under the
   headline. Set in Anton at headline scale.
2. **Phone** — `0970 202 8773` (`tel:` link).
3. **Elsewhere** — Instagram and Facebook, set in Anton to match the neighbouring columns.
4. **Based in** / **Availability**.

Email and socials also feed the JSON-LD `Person` block (`email`, `sameAs`) so search
engines tie the profiles to him.

**Share-link tracking was stripped.** The supplied URLs carried QR/share telemetry
(`igsh`, `utm_source=qr`, `mibextid`); the site links to the clean canonical paths. The
Facebook one is a `/share/` link rather than a vanity URL — it resolves correctly, but if
he has a `facebook.com/<name>` URL it's worth swapping in.

## Open items for the client

- **Verify the email.** `jpalalon16@gmail.com` doesn't obviously correspond to "Wacky Jhay
  Yugto" — almost certainly just an old handle, but it's the primary CTA on the page, so
  worth one confirmation that it's the address he wants clients writing to.
- **Contact detail was deliberately trimmed.** The dataset included a full street address
  and date of birth. Neither is published: a home address plus a birth date plus a phone
  number on a public page is an identity-theft kit for a private individual. The site
  shows city/region only, and "Est. 2000" instead of the DOB. Both are in
  `wacky-yugto-portfolio.md` if he wants them restored — but it should be his call, made
  knowingly.
- **Verify the years** on the work pieces, and rename the two inferred titles above.

---

**Sediment 01 · 2026**
