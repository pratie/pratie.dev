---
name: pratie.dev
description: An engineer's notepad. Warm paper, ink, one blue pen, one yellow highlighter, a red pencil, and figures on dot-grid paper.
colors:
  paper: "#fbfaf5"
  field: "#f3f1e8"
  ink: "#1f1e1b"
  ink-2: "#5c5950"
  rule: "#dfdbce"
  dot: "#d3cebf"
  margin-line: "#ecb7ad"
  pen: "#2440c8"
  pen-wash: "#e3e8fb"
  mark: "#ffe566"
  mark-wash: "#fff3b0"
  mark-ground: "#ffe566"
  on-mark: "#1f1e1b"
  warn: "#b0370f"
  warn-wash: "#fbe3d9"
  hl-0: "#fff0a6"
  hl-1: "#d6efc6"
  hl-2: "#ffd8e2"
  hl-3: "#d5e3fb"
  hl-4: "#ffe0bd"
  paper-dark: "#1a1917"
  field-dark: "#22211e"
  ink-dark: "#ece8dd"
  ink-2-dark: "#aaa598"
  rule-dark: "#36342e"
  dot-dark: "#3d3a33"
  margin-line-dark: "#5c3832"
  pen-dark: "#a3b4ff"
  pen-wash-dark: "#262b47"
  mark-dark: "#d6b21e"
  mark-wash-dark: "#4a3f12"
  mark-ground-dark: "#75600f"
  warn-dark: "#ff9f7a"
  warn-wash-dark: "#47241a"
  hl-0-dark: "#4b4216"
  hl-1-dark: "#25402a"
  hl-2-dark: "#4a2733"
  hl-3-dark: "#263553"
  hl-4-dark: "#4a3319"
typography:
  display:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.2
  lede:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'iA Writer Quattro', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
  data:
    fontFamily: "'iA Writer Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  data-sm:
    fontFamily: "'iA Writer Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  data-xs:
    fontFamily: "'iA Writer Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  bar: "2px"
  mark: "3px"
  chip: "4px"
  control: "6px"
  sheet: "8px"
  panel: "10px"
spacing:
  gutter: "1.25rem"
  gutter-wide: "2rem"
  margin-w: "10.5rem"
  text-w: "41rem"
  bleed: "9rem"
  stack: "1rem"
  panel-pad: "1.1rem"
  panel-pad-wide: "1.5rem"
  figure-gap: "2.25rem"
  heading-gap: "3.5rem"
  section-gap: "4rem"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.8rem"
    height: "2.25rem"
  button-hover:
    backgroundColor: "{colors.pen-wash}"
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.8rem"
    height: "2.25rem"
  button-primary-hover:
    backgroundColor: "{colors.pen}"
    textColor: "{colors.paper}"
  button-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  field-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.7rem"
    height: "2.5rem"
  token-chip:
    backgroundColor: "{colors.hl-0}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "0.08em 0.3em"
  token-chip-bare:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "0.08em 0.3em"
  figure-panel:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-pad}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "0.75rem 0.85rem"
  number-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "0.3rem 0.1rem"
  bar-fill:
    backgroundColor: "{colors.ink-2}"
    rounded: "{rounded.bar}"
    height: "0.85rem"
  bar-fill-picked:
    backgroundColor: "{colors.pen}"
    rounded: "{rounded.bar}"
    height: "0.85rem"
  pipeline-stage:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.control}"
    padding: "0.45rem 0.6rem"
  code-block:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.panel}"
    padding: "1rem 1.1rem"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
  nav-link-current:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    size: "2.25rem"
  theme-toggle-hover:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
---

# Design System: pratie.dev

## Overview

**Creative North Star: "The Engineer's Notepad"**

The site is one sheet of warm paper ruled off by a single legal-pad margin line. Reading happens in a 41rem text column to the right of that line; the margin to its left holds only what a margin holds on a real pad: a short label for the block beside it, or the contents of the note being read. Everything on the sheet is made with five writing tools: ink, one blue pen, one yellow highlighter, a red pencil, and a five-colour highlighter set that exists only to tell token chips apart.

Figures are the second material. Anything the reader operates sits on a dot-grid panel in the field colour, set in the mono cut with tabular numerals; inside a panel, a plain paper "sheet" gives a clean ground to anything that needs one. A figure is always the same small vocabulary: a token is a chip, a probability is a horizontal bar on an absolute scale, a vector is a row of number cells. The page is calm so that the figure is the only thing asking to be touched.

The world is light by default regardless of the system setting, because the owner asked for a light notepad; a toggle in the header stores a dark variant with every token remapped. The earlier dark, heavy-type portfolio was rejected by the owner as too heavy, and that rejection is the one confirmed anti-reference: nothing here is loud, large, or dark by default.

**Key Characteristics:**
- One warm paper ground with a single 1px margin line at 60rem and wider; no cards, bands, or section backgrounds on the page itself.
- One type family in two sibling cuts, two weights (400 and 700), sentence case throughout.
- Colour is a set of tools with fixed jobs; a colour that is not doing its job is not on the page.
- Flat: hairlines and tonal layering, no drop shadows.
- Motion only reports a change of state.
- Every figure works at 390px wide, in both themes, by keyboard, with reduced motion.

## Colors

A warm off-white sheet and near-black ink carry almost everything; saturated colour appears only where a pen, highlighter, or pencil would have touched the page. Each light token has a dark counterpart under the same name with a `-dark` suffix in the frontmatter (in code, the same custom property re-declared on `:root[data-theme='dark']`).

### Primary
- **Pen Blue** (`pen` #2440c8, dark #a3b4ff): links, the focus ring, the caret, the range-slider accent, the picked bar and its label, the hovered primary button, positive values in number cells, the selection ring on a chosen chip or cell. In a figure it always means "the thing being measured".
- **Pen Wash** (`pen-wash` #e3e8fb, dark #262b47): the hover ground of a button and of a linked box in a diagram.

### Secondary
- **Highlighter Yellow** (`mark` #ffe566, dark #d6b21e): text selection and the "add" node in the architecture diagram.
- **Highlighter Ground** (`mark-ground` #ffe566, dark #75600f): any highlight that carries body-colour text at a strength that varies: attention weight on a chip (mixed into paper in proportion to the weight) and the flash a newly generated token lands with. In the dark theme it is a deep gold so the theme's ink stays readable at full strength.
- **Highlighter Wash** (`mark-wash` #fff3b0, dark #4a3f12): `<mark>` in prose, generated text at rest, the neighbours of a selected word.

### Tertiary
- **Red Pencil** (`warn` #b0370f, dark #ff9f7a): negative values in number cells, per-token loss, a result that has gone wrong.
- **Pencil Wash** (`warn-wash` #fbe3d9, dark #47241a): the ground of a cell flagged as wrong.
- **Highlighter set** (`hl-0` to `hl-4`: yellow, green, pink, blue, orange washes): token chip grounds, cycled by index. `hl-3` also fills the selected word in the embedding map.

### Neutral
- **Paper** (`paper` #fbfaf5, dark #1a1917): the page, sheets inside figure panels, button and input grounds.
- **Field** (`field` #f3f1e8, dark #22211e): figure panels, code blocks, inline code, pipeline stages, the theme toggle on hover.
- **Ink** (`ink` #1f1e1b, dark #ece8dd): body text, headings, button borders, diagram strokes.
- **Second Ink** (`ink-2` #5c5950, dark #aaa598): standfirsts, captions, metadata, figure labels, list markers, resting nav and contents links, the default bar fill, input borders.
- **Rule** (`rule` #dfdbce, dark #36342e): every hairline: panel, sheet and code borders, table rows, dashed separators, the 1px ring around cells and outline chips.
- **Dot** (`dot` #d3cebf, dark #3d3a33): the dot grid on figure panels, nothing else.
- **Margin Line** (`margin-line` #ecb7ad, dark #5c3832): the legal-pad line, nothing else.

Syntax highlighting in code blocks uses four further hues (constant, string, function, keyword) set as Shiki CSS variables; keyword and link reuse Pen Blue, comments and punctuation reuse Second Ink. They are not available to anything outside a code block.

### Named Rules
**The One Pen Rule.** Blue is the only link colour and the only focus colour, and inside a figure it marks exactly one thing: what is being measured or what the reader has selected. It is never decoration.

**The Highlighter Rule.** Yellow means attention or "newly added". If nothing is being attended to and nothing just arrived, there is no yellow.

**The Red Pencil Rule.** Red means a negative number or something going wrong. It is never an accent.

**The Five Highlighters Rule.** Chip colours cycle by position (index mod 5) and carry no meaning. Never use a chip colour to say something about a token; use pen, mark, or strike-through for that.

**The Ink on Yellow Rule.** Text on full-strength Highlighter Yellow is always `on-mark` (#1f1e1b), in both themes, because the highlighter stays bright in the dark. Where the text has to stay the theme's own ink, use Highlighter Ground instead of Highlighter Yellow.

## Typography

**Display Font:** iA Writer Quattro (fallback: ui-monospace, SF Mono, Menlo, Consolas, monospace)
**Body Font:** iA Writer Quattro (same stack)
**Label/Mono Font:** iA Writer Mono (fallback: ui-monospace, SF Mono, Menlo, Consolas, monospace)

**Character:** A writing typeface and its fixed-width sibling, so prose and data look like they came out of the same pen. Hierarchy comes from weight and a modest size step, never from a second family, capitals, or tracking.

### Hierarchy
- **Display** (700, 2.25rem, 1.2, -0.01em): the name on the front page and the notes index title. A note title uses the same role fluidly: `clamp(1.875rem, 1.4rem + 2vw, 2.375rem)` at -0.012em.
- **Headline** (700, 1.5rem, 1.2): `##` headings inside a note. These are the entries in the contents rail.
- **Title** (700, 1.1875rem, 1.2): `###` headings inside a note.
- **Lede** (400, 1.1875rem, 1.55): the front page introduction (ink, max 36rem) and a note's standfirst (second ink). Balanced wrapping.
- **Body** (400, 1.0625rem, 1.65): prose, capped by the 41rem text column. Pretty wrapping.
- **Body small** (400, 0.9375rem, 1.55): note blurbs, the project list, link boxes, header nav, prose sentences that appear inside a figure panel.
- **Caption** (400, 0.875rem, 1.55): figure captions and the footer, in second ink; `strong` inside a caption returns to ink.
- **Label** (700, 0.875rem, 1.4): margin labels at 60rem and wider. Below that the same heading sits above its block at 1.0625rem.
- **Data** (Mono 400, 0.875rem, 1.5, tabular numerals): everything inside a figure panel by default.
- **Data small** (Mono 400, 0.8125rem): figure labels, buttons, dates and reading times, code blocks (line-height 1.6), pipeline stages, the contents rail size.
- **Data extra small** (Mono 400, 0.75rem): axis and column heads, token ids, per-chip weights. This is the floor.

### Named Rules
**The Two Cuts Rule.** Quattro is for sentences. Mono is for anything counted, measured, or typed: figure panels, code, dates, token chips. A sentence that appears inside a figure switches back to Quattro.

**The Two Weights Rule.** Only 400 and 700 exist. Emphasis is 700 or a highlighter mark. No capitals, no letter-spacing except the slight negative tracking on a page's `h1`.

## Layout

The page is a single sheet, centred in the viewport once it reaches its maximum width of margin + text column + bleed + two gutters. The text column is 41rem (`text-w`) and everything outside a figure respects it: header, prose, link boxes, footer.

- **Below 60rem** there is no margin and no margin line. Gutters are 1.25rem. Section labels sit above their block as ordinary headings, and a note's contents fold into a bordered disclosure above the text.
- **At 60rem and wider** a 10.5rem margin opens on the left, gutters grow to 2rem, and the 1px margin line runs the full height of the page, 1.5rem left of the text column. Margin content is 7.5rem wide, right-aligned, 2.5rem clear of the text. On the front page the margin holds section labels (Notes, Projects, Elsewhere). On a note it holds the labels of the link boxes (Read first, Goes deeper, Related) and the sticky contents list, which marks the section being read in bold ink.
- **At 76rem and wider** a 9rem bleed opens on the right. Only a figure or code block marked wide may extend into it.

Vertical rhythm, as built: header to content 3.5rem; front-page sections 4rem apart; prose blocks 1.15em apart; 3.5rem above a headline and 2.5rem above a title, 0.75em below either; 2.25rem above and below a figure in prose; 5rem above the footer. Inside a figure panel, children stack 1rem apart; panel padding is 1.1rem, 1.5rem from 40rem.

The front page and notes index open with the name or title at the top of the text column, then the lede, then content. There is no hero, no image, and no full-width band. Lists are plain: notes are a title link with a mono date and reading time on the same baseline and a blurb beneath; projects are a two-column name and description grid from 40rem (12rem + 1fr), stacked below.

Figure-internal layouts add two local breakpoints (34rem and 46rem) to reflow grids of cells and side-by-side panes. A figure never causes horizontal page scroll at 390px; a long code block scrolls inside itself.

### Named Rules
**The Margin Rule.** The margin holds a label for the block beside it or the contents of the page. Nothing else goes there: no dates, no notes-to-self, no ornaments. When there is no room for a margin, there is no margin line.

**The Bleed Rule.** Prose never leaves the text column. Only a figure or code block that needs the width takes the bleed.

## Elevation & Depth

Flat. There are no drop shadows anywhere. Depth is tonal and exactly two steps deep: paper, then a field-coloured panel with a dot grid, then a paper sheet inside the panel. Edges are 1px hairlines in the rule colour.

`box-shadow` is used, but only to draw lines: a 1px inset ring where a border would change an element's size (number cells, outline chips), and a doubled pen ring to show selection.

### Shadow Vocabulary
- **Hairline ring** (`box-shadow: inset 0 0 0 1px var(--rule)`): the edge of a number cell or an outline chip.
- **Selection ring** (`box-shadow: inset 0 0 0 1px var(--pen), 0 0 0 1px var(--pen)`): the chip or cell the reader has selected inside a figure.

### Named Rules
**The Flat Paper Rule.** Nothing floats. If something needs to stand apart, give it a hairline or move it one tonal step (paper to field, field to sheet).

**The State-Only Motion Rule.** Movement reports a change the reader caused or the model produced: a bar rescales (0.4s), a cell or chip changes tint (0.2 to 0.25s), a new token lands with a highlighter flash that fades (0.9s), sampled chips drop in on a 28ms stagger (0.35s), a button nudges 1px when pressed, the theme icon turns half a rotation. One easing, `cubic-bezier(0.16, 1, 0.3, 1)`. Nothing animates on load or on scroll. Reduced motion collapses every transition and animation globally.

## Shapes

Soft, small corners that grow with the size of the thing: bars and the focus ring 2px, prose marks 3px, chips, cells and inline code 4px, buttons, inputs, pipeline stages and the theme toggle 6px, sheets and the contents disclosure 8px, figure panels and code blocks 10px. Nothing is fully round except native slider thumbs and dots in diagrams, and nothing is perfectly square.

Lines are always 1px. A solid rule-coloured line is an edge or a table row; a dashed rule-coloured line is a separation inside something (the link boxes, a horizontal rule in prose, a divider between parts of a figure); a solid ink line is a button; a second-ink line is a text input, a table head, or the single hairline to the left of a quotation. The focus ring is the only 2px line: pen blue, 3px offset.

Two patterns are part of the form language: the 1rem dot grid on a figure panel, and a 45-degree hairline hatch for a number cell that is masked or switched off. These are the only uses of gradients.

Icons are drawn, not typed: the theme toggle is a half-filled circle and the pipeline arrow is a stroked line, both inline SVG in the current text colour.

## Components

### Buttons
Small, flat, mono; they read as labelled keys on an instrument, not calls to action. They appear only inside figure panels.
- **Shape:** 6px corners, 1px ink border, minimum height 2.25rem (2.75rem on coarse pointers), padding 0.5rem 0.8rem, Mono 0.8125rem.
- **Default:** paper ground, ink text.
- **Primary and pressed:** ink ground, paper text. Primary is the one action that advances the figure; pressed (`aria-pressed="true"`) is the chosen option in a group of toggles.
- **Hover / Focus:** default hovers to pen wash; primary hovers to pen blue with a pen border. Colour transitions 0.15s. Active moves 1px down. Focus is the global pen ring.
- **Disabled:** 45% opacity, not-allowed cursor, no hover change.

### Chips
A token is always a chip.
- **Style:** inline-block, Mono, 4px corners, padding 0.08em 0.3em, whitespace preserved; ground is one of the five highlighters by index. A leading space is shown as a middle dot at 45% opacity.
- **Outline variant:** transparent ground with the hairline ring, used when no index is given.
- **State:** attention weight tints the chip toward highlighter yellow; selected takes the selection ring; unavailable or cut is second ink with a strike-through. In prose a chip is 0.9em.

### Cards / Containers
- **Figure panel:** field ground with a 1rem dot grid, 1px rule border, 10px corners, padding 1.1rem (1.5rem from 40rem), Mono 0.875rem with tabular numerals, children stacked 1rem apart. Its caption sits below, outside the panel, in the text face at 0.875rem, and says whether the numbers are real model output or made up.
- **Sheet:** paper ground, 1px rule border, 8px corners, padding 0.75rem 0.85rem. Used inside a panel for running text, tables, or anything that would fight the dots.
- **Link box:** not a box. A list between two dashed rule lines (1rem padding above and below), with its label in the margin.
- **Code block:** field ground, 1px rule border, 10px corners, padding 1rem 1.1rem, Mono 0.8125rem at 1.6, horizontal scroll inside. Code is read from the tested source file, never retyped.
- **Contents disclosure (narrow screens):** 1px rule border, 8px corners, bold summary, numbered list.

### Inputs / Fields
- **Text input:** paper ground, 1px second-ink border, 6px corners, minimum height 2.5rem, padding 0.5rem 0.7rem, inherits the surrounding face; placeholder in second ink.
- **Slider:** a three-column row (label, native range with pen accent, right-aligned mono readout). The range is 1.75rem tall for an easy grab.
- **Focus:** the global pen ring; no glow, no border colour change.

### Navigation
- **Header:** the handle in bold ink at the left, no underline; at the right two links (0.9375rem, second ink, no underline) and the theme toggle. Hover and the current page turn the link ink with a 2px pen underline.
- **Theme toggle:** a 2.25rem square ghost button with a 16px half-filled circle; hover gives it the field ground; the icon turns 180 degrees when dark is on. The choice is stored; with nothing stored the site is light.
- **Contents rail:** 0.8125rem, second ink, no underline, right-aligned in the margin, sticky 2rem from the top. Hover is ink with an underline; the section being read is bold ink.
- **Body links:** pen blue, 1px underline offset 0.2em, thickening to 2px on hover.
- **Footer:** a 1px rule line, then the domain at left and two links at right in 0.875rem second ink.

### Probability bars
A probability is always a horizontal bar on an absolute 0 to 100% scale: a row of name (usually a chip), track, right-aligned percentage. The track is 0.85rem tall with 2px corners in 9% ink; the fill is second ink and scales from the left. The picked row turns fill, name and percentage pen blue, with the text in bold. A row that has been cut is second ink with its chip struck through; a remainder row is set off by a dashed line.

### Number cells
A vector or matrix is a row or grid of cells: Mono, centred, 4px corners, hairline ring, 2px gaps. The ground tints from paper toward pen blue for positive values and red pencil for negative, in proportion to magnitude, capped at 55% (38% in dark) so the number stays readable. A masked or switched-off cell is second ink on the diagonal hatch. A cell flagged as wrong is bold red pencil on pencil wash with a red ring. Row and column heads are Mono 0.75rem in second ink.

### Pipeline
A strip of stages joined by small drawn arrows, set directly in the prose rather than in a panel. Each stage is a field-coloured box with a rule border and 6px corners, Mono 0.8125rem, with an optional 0.75rem second-ink sub-line; a stage may link to the section that explains it. It wraps on narrow screens.

### Prose furniture
- **Mark:** highlighter wash behind the words, 3px corners, wraps cleanly across lines.
- **Inline code:** Mono 0.92em on the field colour, 4px corners.
- **Lists:** en-dash markers for unordered lists, second-ink markers throughout.
- **Quotation:** second ink, 1.1rem indent, one 1px second-ink line at the left.
- **Table:** no outer border; 1px rule under each row, second-ink line under the head, tabular numerals, left-aligned.
- **Horizontal rule:** 1px dashed, 3rem of space either side.

## Do's and Don'ts

### Do:
- **Do** keep the default light. With no stored choice the site renders the light tokens whatever the system prefers; dark is something the reader turns on.
- **Do** give every new colour use to an existing tool: pen for links, focus and the measured thing; yellow for attention and newly added; red for negatives and failures; second ink for everything quiet.
- **Do** build figures from the shared parts: panel, sheet, chip, bar row, number cell, button, slider. A new figure should look like it came from the same pad as the others.
- **Do** put a label in the margin only when it names the block beside it, and let it fall back above the block below 60rem.
- **Do** set anything counted or typed in Mono with tabular numerals, and switch back to Quattro for a sentence inside a figure.
- **Do** draw edges with 1px lines in the rule colour, and use a dashed line for a separation inside a block.
- **Do** keep text in figures at 0.75rem or larger and body-coloured text at 4.5:1 or better in both themes.
- **Do** server-render a sensible first state for an interactive figure, and make it work at 390px, by keyboard, with reduced motion.
- **Do** say in the caption whether a figure's numbers are real model output or made up.

### Don't:
- **Don't** bring back the rejected look: dark by default, heavy display type, a hero.
- **Don't** add a drop shadow, a glow, or a blurred surface. `box-shadow` draws 1px rings and nothing else.
- **Don't** use a gradient as colour. Gradients exist only as the dot grid and the off-cell hatch.
- **Don't** add a third weight, a second family, capitals, or letter-spacing for emphasis.
- **Don't** use pen blue, yellow, or red as decoration, and don't give a chip colour a meaning.
- **Don't** rescale probability bars to the largest value; the scale is always 0 to 100%.
- **Don't** wrap page content in cards or give sections their own background. The only filled surfaces are figure panels, code, and pipeline stages.
- **Don't** animate anything on load or scroll, and don't add motion that is not reporting a change of state.
- **Don't** let prose run into the bleed or the margin.
- **Don't** reuse the layout's class names `side` and `row` inside a figure.
