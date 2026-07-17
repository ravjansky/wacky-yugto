# Sediment

**A print-rooted design system.**
Edition 01 · RavDigitals · 2026

---

## Premise

Sediment is what happens when you set two posters side by side and ask what they share.

- **Focus** (Aya Faitrouni) — warm gradient, heavy grain, an editorial metadata strip, an oversized italic serif that doesn't apologise for taking up space, an eye cropped into a horizontal band so you have to look harder.
- **MIAD Summer Pre-College 2022** — deep forest green, dusty coral, condensed bold sans-serif stacked in massive horizontal rows, wayfinding arrows as functional punctuation, a duotone leaf pulled out of context.

Both are *information design*. Both treat metadata as a design element, not as overhead. Both have a print-shop confidence you don't get from screen-first thinking. Sediment is the system that comes out of welding them together: the soft side and the loud side of the same hand.

---

## Foundation

### 01 · Pigment

Six colour tokens. Two roles each — `surface` or `signal` — except `Drift`, which is atmosphere.

| Token | Hex | Role | Origin |
|---|---|---|---|
| `--ink` | `#0E2A21` | Base surface — deep forest | MIAD green, deepened |
| `--char` | `#081912` | Shadow, depth, hairlines | The shadow side of `--ink` |
| `--coral` | `#E89789` | Primary signal — every accent | MIAD's salmon, lifted |
| `--ember` | `#D8714C` | Heat — gradient anchor, warmth | Focus gradient, top |
| `--moss` | `#7FA08B` | Cool — gradient anchor, balance | Focus gradient, bottom |
| `--bone` | `#F4EDE2` | Type, paper, light | Focus type colour |
| `--paper` | `#E9DFC9` | Secondary type, warm off-white | Mid-tone for body |
| **Drift** | gradient | Atmosphere — backgrounds, posters | `ember → coral → moss` at 155° |

**Distribution rule:**
70% surface (`--ink` / `--char`), 25% paper (`--bone` / `--paper`), 5% signal (`--coral`). Heat and cool earn their use — they don't decorate, they anchor compositions. The `Drift` gradient is reserved for hero surfaces and special posters; never for UI chrome.

### 02 · Voice

Three families. Each has one job. Mixing them is the system — using only one isn't.

| Family | Role | Used for |
|---|---|---|
| **Fraunces Italic** (variable) | Display | Signature words, hero reveals, the soft voice |
| **Anton** | Headline | Structural type, posters, the loud voice |
| **JetBrains Mono** | Mono | Labels, metadata, body caps, the technical voice |

**Why these:** Fraunces brings genuine editorial weight in italic — the wide-axis variable lets headlines breathe without losing print confidence. Anton is the closest free analogue to the condensed grotesks used on industrial-print posters — narrow, sharp, no character to spare. JetBrains Mono carries small uppercase metadata without feeling like code (most monos do); the slight humanist tilt keeps it warm.

**Scale (fluid, via `clamp()`):**

```css
--fs-mono: clamp(0.68rem, 0.6rem + 0.4vw, 0.78rem);   /* labels */
--fs-body: clamp(0.95rem, 0.9rem + 0.3vw, 1.05rem);   /* base */
--fs-lead: clamp(1.15rem, 1rem + 0.6vw, 1.5rem);      /* lead */
--fs-h3:   clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);     /* section */
--fs-h2:   clamp(2.2rem, 1.5rem + 3vw, 4.5rem);       /* headline */
--fs-h1:   clamp(4rem, 2rem + 12vw, 13rem);           /* display */
```

**Tracking:** mono and uppercase need air — `0.08–0.12em`. Display italic wants to be tight — `-0.02em`. Anton sits between — `-0.005em`.

### 03 · Rhythm

```css
--gutter: clamp(1.25rem, 1rem + 2vw, 2.5rem);
--rule:   1px;
```

One gutter token, scaling with viewport. One rule weight, used everywhere a line divides something. Lines are first-class — they're how the system shows structure without spending colour.

---

## Components

Six primitives. Every surface in the system is built from these.

### 01 · Metadata Strip

The editorial header. `label— + value` pairs, separated by gutter, anchored by a hairline below. Lifted directly from the Focus poster, used everywhere in the system as the entry point to any composition.

```html
<header class="meta-strip">
  <div class="meta-strip__cell">
    <span class="label label--strong">Title</span>
    <span class="meta-strip__value">Focus</span>
  </div>
  <!-- … -->
</header>
```

**Rules:** `label--strong` uses `--coral`, gets a trailing em-dash. Value is mono uppercase. Auto-fit grid, 140px minimum cell.

### 02 · Divider

A hairline + a label sitting just above it. Three variants: plain, with-arrow, double-rule. From MIAD's row-based structure.

```html
<div class="divider divider--arrow">
  <span class="label label--strong">Core Studio Concepts</span>
</div>
```

### 03 · Wayfinding

Directional arrows as glyphs — `↗ ↘ ↙ ↖`. Set in Anton at headline size. Coral. Used to point — to the next section, to a label, to break a corner. From the MIAD poster's signature gesture.

### 04 · Duotone

Photography passes through two blend layers: `--ink` on multiply (kills the shadows into green) + `--coral` on screen (lifts the highlights pink). The same recipe across the system, so every image looks like it came from the same press run.

```css
.duotone {
  filter: grayscale(1) contrast(1.15);
}
.duotone::before { background: var(--ink);   mix-blend-mode: multiply; }
.duotone::after  { background: var(--coral); mix-blend-mode: screen; opacity: 0.85; }
```

### 05 · Identifier

A two-digit number + small role label beneath. Big Anton numeral in coral, label in mono. Used as a corner anchor in compositions — section numbers, edition numbers, page numbers.

### 06 · Barcode

Pure CSS `repeating-linear-gradient`. Decorative print-callout, never an actual scannable code. Always paired with a mono identifier underneath.

---

## Motion

Sediment uses the project's existing motion token system unchanged. Two cubic-bezier easings carry 95% of motion; three exceptions cover the rest.

```css
--ease-signature: cubic-bezier(0.22, 1, 0.36, 1); /* reveals, entrances */
--ease-smooth:    cubic-bezier(0.4, 0.0, 0.2, 1);  /* UI state changes */
--ease-none:      none;                            /* instant flips */
--ease-loop:      linear;                          /* infinite loops only */
```

**Applied in Sediment:**

| Where | Token | Why |
|---|---|---|
| Page entrance (staggered reveals on `.reveal`) | `--ease-signature` | Expressive decel — content arriving |
| Swatch hover lift | `--ease-smooth` | Restrained UI feedback |
| Arrow glyph hover (translate diag) | `--ease-signature` | The gesture is the point — give it air |
| Marquee strip at the top | `--ease-loop` | Seamless infinite scroll, constant velocity |

**Performance rule:** animate only `transform` and `opacity`. No `will-change` declared anywhere. Grain texture is a fixed SVG noise overlay — paint-once, no JS, no animation cost.

**Accessibility:** `prefers-reduced-motion: reduce` kills the marquee, kills reveals, neutralises transitions. Content arrives instantly.

---

## Compositions

Two composition modes, both built from the same primitives. The system's range is in how you weight them.

### A · Editorial (Focus-leaning)

Gradient background. Soft. Centred italic display word as the centre of gravity. Metadata strip at the top, body caps + identifier at the bottom. An image cropped into a horizontal band, often overlapping the word.

**Use for:** mood pieces, hero covers, anything atmospheric. When you want the page to *feel* before it reads.

### B · Structural (MIAD-leaning)

Ink background. Loud. Massive Anton words stacked in rows separated by coral rules. Notes set in mono align right with arrows pointing back to the words. Monogram anchors the bottom-right corner.

**Use for:** programmes, schedules, announcements, anything information-dense. When the reader needs to navigate, not feel.

### Hybrid

The point of having both — a structural block can sit inside an editorial cover; an editorial hero can lead a structural detail page. The voices match because the tokens match.

---

## Implementation Notes

**Stack:** HTML5 + CSS Custom Properties. No JS required for the system itself. Lenis-compatible for smooth scroll (your default). GSAP-ready when sequenced reveals need timeline control beyond CSS keyframes.

**Performance budget:**
- One SVG grain overlay (inline data URI, fixed position) — paint-once
- One marquee animation (`transform: translateX`) — GPU
- Reveal stagger via `animation-delay` — CSS only
- All image treatment via `mix-blend-mode` + `filter` — GPU

**Mobile:** every layout is fluid via `clamp()` and `auto-fit` grids. No fixed pixel widths. Type scale collapses gracefully. Touch targets on hoverable elements stay above 44px because the components are generously padded — but hover-only interactions have no critical state.

**Print:** because Sediment *is* print-rooted, the same CSS exports cleanly to print stylesheets with minor adjustments (gradient → solid `--ink`, grain → off, marquee → first 5 items static).

---

## Don'ts

- **Don't use cubic-bezier values inline.** Always reference the token.
- **Don't mix three type families in one block.** Pair display+mono, headline+mono, or display+headline. Never all three at once.
- **Don't tint photography with `--coral` alone.** The duotone needs the `--ink` multiply pass first or it goes pink-pastel.
- **Don't decorate with `--ember` or `--moss` solid.** They're gradient anchors. Use them through `Drift`, not as flat fills.
- **Don't add a fourth easing token.** If a situation calls for bounce/elastic, use `--ease-signature` and tune duration instead.

---

## File Map

```
/index.html        — the living showcase. open it.
/design-system.md  — this file.
```

The HTML file is the canonical reference for every token, primitive, and composition. If a future component contradicts the HTML, the HTML wins — or the HTML gets updated. The markdown explains *why*; the HTML proves *how*.

---

**End · Sediment 01 · RD 2026**
