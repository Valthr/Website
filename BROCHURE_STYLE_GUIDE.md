# Valthr Brochure — Style Guideline

A print-ready translation of the Valthr website's design system. Use this as the single source of truth when laying out the brochure (InDesign, Affinity Publisher, Figma-for-print, etc.). Web tokens come from [assets/css/main.css](assets/css/main.css).

---

## 1. Brand Essence

**Voice**: Confident, technical, calm. Engineering-grade — not marketing-loud.
**Look**: Light, airy, precision-instrument feel. Warm amber accents on a near-white "void" canvas. One full-bleed dark hero spread per piece for contrast.
**Avoid**: Drop shadows that read as "Web 2.0," gradients other than the hero overlay, stock imagery of generic drones, emoji.

---

## 2. Color Palette

All colors below are sRGB hex from the website with suggested CMYK conversions for offset/digital print. Always proof on the actual stock — amber in particular shifts under uncoated paper.

### Surfaces (use as page backgrounds, panels, cards)

| Role | Name | HEX | CMYK (approx) | Use |
|---|---|---|---|---|
| Page canvas | `--bg-void` | `#F8F7F4` | 2 / 2 / 5 / 0 | Default page background. Never pure white. |
| Card / panel | `--bg-surface` | `#FFFFFF` | 0 / 0 / 0 / 0 | Lifted cards, callouts. |
| Subtle fill | `--bg-panel` | `#F3F2EF` | 4 / 3 / 6 / 0 | Quote blocks, metric tiles. |
| Raised fill | `--bg-raised` | `#EAE9E5` | 7 / 5 / 9 / 1 | Code-style chips, hover states. |

### Accents (use sparingly — these carry the brand)

| Role | Name | HEX | CMYK (approx) | Use |
|---|---|---|---|---|
| Primary accent | `--accent-primary` | `#D97706` | 0 / 60 / 100 / 5 | Eyebrows, key numbers, primary CTA fill, the "Valthr" mark in headings. |
| Hero amber | (hero-only) | `#F5A623` | 0 / 38 / 90 / 0 | Only on dark backgrounds — brighter for contrast. |
| Primary hover/dark | (derived) | `#B45309` | 5 / 60 / 100 / 25 | Use as secondary tint on amber. |
| Secondary accent | `--accent-blue` | `#0284C7` | 80 / 35 / 0 / 10 | Data labels, links, "low priority" markers. |

### Text

| Role | Name | HEX | CMYK | Use |
|---|---|---|---|---|
| Primary text | `--text-primary` | `#111111` | 70 / 65 / 60 / 75 | Body, headlines. Never pure black on light stock. |
| Muted text | `--text-muted` | `#6B7280` | 55 / 45 / 40 / 25 | Secondary copy, captions. |
| Subtle text | `--text-subtle` | `#9CA3AF` | 40 / 30 / 30 / 5 | Eyebrows over light fills, meta. |

### Hero (dark spread only)

- Background: `#0A0C12` (rich black: 60 / 50 / 50 / 100)
- Body text: `rgba(255,255,255,0.72)` → spec as `#FFFFFF` at 72% opacity, or flatten to `#B8B8B8`.
- Stat label: `rgba(255,255,255,0.45)` → flatten to `#737373`.
- Grid overlay: 1px white lines @ 9% opacity on a 256px grid, faded at edges with a radial mask.

### Status colors (use only for diagrams / data callouts)

`--status-delivered` `#16A34A` · `--status-moving` `#0284C7` · `--status-pending` `#D97706` · `--status-idle` `#9CA3AF`

**Color usage ratio (rough target):** 70% void/surface · 18% text · 8% amber accent · 4% blue accent.

---

## 3. Typography

Three families. Source from Google Fonts for digital comps; license desktop versions for print files.

| Family | Role | Weights used | Where |
|---|---|---|---|
| **Syne** | Display | 700, 800 | All headlines, section titles, the "Valthr" mark, team names. Tight tracking. |
| **Space Grotesk** | Body | 300, 400, 500, 600 | All running copy, intro paragraphs, button labels. |
| **JetBrains Mono** | Mono | 400, 500, 600 | Eyebrows, metric values, captions, code, numerical data, pull-stats. |

### Type scale (print sizes — based on a 10pt body at 16px web)

| Level | Web | Print (suggested) | Family / Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Hero headline | `clamp(2.5rem, 5vw, 4rem)` | 48–64 pt | Syne 800 | -10 | Tight line-height (1.05–1.15). |
| Section title | `clamp(1.6rem, 2.6vw, 2.25rem)` | 24–32 pt | Syne 800 | -5 | Line-height 1.15. |
| Sub-heading (H3) | 1.15rem | 13–14 pt | Syne 700 | 0 | Card titles. |
| Lead paragraph | 1.0625rem | 11 pt | Space Grotesk 400 | 0 | Line-height 1.7, color = muted. |
| Body | 1rem | 10 pt | Space Grotesk 400 | 0 | Line-height 1.65. |
| Caption / meta | 0.875rem | 8 pt | JetBrains Mono 500 | +120 (0.12em) | UPPERCASE. |
| Eyebrow | 0.8125rem | 8 pt | JetBrains Mono 500 | +200 (0.2em) | UPPERCASE, amber. |
| Pull-stat number | 1.25rem+ | 18–28 pt | JetBrains Mono 600 | 0 | Amber. Use for "9 Stations", "30 km/h" style figures. |

### Rules of thumb
- **Headlines**: Syne 800. The first "V" of *Valthr* may be set in amber (`#D97706`) when standalone.
- **Eyebrows always precede titles** with an 8–12 pt vertical gap. Format: `MONO · UPPERCASE · AMBER · 0.2em tracking`.
- **Numbers** belong in JetBrains Mono — never in Syne or Space Grotesk. This includes addresses, dates, stats.
- **Body line length**: 50–75 characters max. Use a 6- or 12-column grid to enforce this.
- **No italics** in the brand. Use weight (600) or color shift for emphasis instead.

---

## 4. Spacing & Layout

### Grid
- **Margins**: A4 portrait → 18 mm outer, 22 mm inner gutter (binding).
- **Columns**: 12-column grid, 4 mm gutter. Body copy spans 8 cols; sidebars/captions 4 cols.
- **Vertical rhythm**: Base unit = 8 pt. Spacing scale: 8 / 16 / 24 / 32 / 48 / 64 / 96 pt.
- **Section break**: 96 pt of air between major sections. Don't decorate breaks — let whitespace do the work.

### Radii
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6 px / 1.5 mm | Buttons, chips, small badges. |
| `--radius-md` | 10 px / 2.5 mm | Image captions, callouts, input fields. |
| `--radius-lg` | 16 px / 4 mm | Cards, hero image frames, large media. |

### Borders
- Default: 1 pt, color `#E5E3DE` (`--border-dim`).
- Emphasized: 1.5 pt, color `#CCC9C0` (`--border-bright`).
- Never use black hairlines — they read as harsh on this palette.

---

## 5. Components

### Eyebrow + Title pattern (the workhorse)
```
SECTION 02 — METHOD                ← JetBrains Mono 500, 8 pt, amber, 0.2em tracking
                                      [12 pt gap]
Autonomous routing,                ← Syne 800, 28 pt, primary text
designed for live ops.
                                      [8 pt gap]
A short subtitle in Space Grotesk… ← 11 pt, muted text, max 560 px (≈ 90 mm) wide
```

### Cards (payload, team, metric)
- Fill: `--bg-surface`
- Border: 1 pt `--border-dim`
- Radius: `--radius-lg` (16 px)
- Inner padding: 24–28 pt
- For **payload cards**: 16:10 image at top, body padding `1.5rem 1.5rem 1.75rem`, amber tag-eyebrow above the H4.
- For **team cards**: 72 px circular avatar in amber with white initials (Syne 800), centered. Name (Syne 700, 16 pt), role (Mono uppercase amber, 13 pt), bio (Grotesk, 16 pt muted).

### Metric tile
- Fill: `--bg-panel`
- 1 pt `--border-dim` border, 6 px radius
- Label on top: Mono uppercase 13 pt, subtle gray, 0.07em tracking
- Value below: Mono 600, amber, 16+ pt

### Buttons (translate to printed CTAs / sticker layouts)
- **Primary**: Solid amber fill, black text, Space Grotesk 700, UPPERCASE, 0.06em tracking, 6 px radius, 12 / 28 pt padding.
- **Secondary**: Transparent fill, 1 pt `--border-bright` border, primary-text color, otherwise identical to primary.

### Pull-quote / impact callout
- 96 pt of air above and below.
- Number/stat in JetBrains Mono 600, amber, 28–40 pt.
- Caption underneath in muted text, 11 pt.
- Optional 1 pt top rule in `--border-dim`.

### Footer block
- Background: `--bg-void` (page color — no fill change, just a 1 pt `--border-dim` rule on top).
- Logo at 36 px height, 75% opacity.
- Tagline in muted text, 16 pt; meta lines in JetBrains Mono, 14 pt, subtle gray.

---

## 6. Iconography

- **Lucide icons** (the website's set — [lucide.dev](https://lucide.dev)). 1.5 pt stroke. Currentcolor — never multi-color icons.
- Sized in 1.5× the cap height of the text they sit beside. Inline icons get 6 pt of trailing space.
- For diagrams, use the status colors above. Drone color tokens: `--drone-1 #E0521A`, `--drone-2 #2B8FD4`, `--drone-3 #6AB330`.
- No emoji, no skeuomorphic icons.

---

## 7. Imagery

- **Hero / cover**: Full-bleed photographic, dark-toned, with a 135° linear gradient overlay `rgba(0,0,0,0.62) → 0.45 → 0.55` so amber type stays legible.
- **Inline photos**: 4:3 or 16:10 aspect. 16 px radius. 1 pt `--border-dim` frame. Optional caption in a dark translucent pill (`rgba(17,17,17,0.78)`, white mono uppercase, 0.14em tracking).
- **Maps / diagrams**: Darken any satellite or basemap imagery to ~48% brightness, ~70% saturation so amber routes pop. Keep all annotations in JetBrains Mono.
- Treat photo color: lift shadows slightly, hold midtones, no oversaturation. Test on the chosen stock — desaturate further for uncoated.

---

## 8. Print Specs

- **Stock**: Recommend 150–170 gsm matte coated for the body, 250–300 gsm matte cover for outer wrap. Uncoated is on-brand if the budget allows — proof amber first, it can muddy.
- **Color profile**: ISO Coated v2 (Fogra39) for coated; PSO Uncoated v3 for uncoated. Convert all RGB tokens to the chosen profile *once*, not per-page.
- **Bleed**: 3 mm on all outer edges. Safe area: 5 mm inside trim.
- **Resolution**: 300 dpi for raster, vector for all logos/icons.
- **Black**: Use rich black `60 / 50 / 50 / 100` for large solids; flat `0 / 0 / 0 / 100` for small text only.
- **Spot color (optional)**: If running a 5th color, use Pantone **152 C** as the closest match to `#D97706`.

---

## 9. Quick "Do / Don't"

**Do**
- Let whitespace breathe — at least 96 pt between sections.
- Pair every Syne headline with a JetBrains Mono eyebrow.
- Keep numbers in mono and headlines in Syne — never the reverse.
- Use one amber moment per spread, not three.

**Don't**
- Don't outline type. Don't drop-shadow type.
- Don't use gradients except the hero overlay.
- Don't mix the amber and blue as a duotone — they're separate accents.
- Don't tighten body line-height below 1.5 — the brand reads "calm" because of vertical air.
