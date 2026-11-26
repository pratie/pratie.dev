# pratie.dev

Personal site and AI notes. Astro 7, static, deployed to Vercel on push to `main`.
Read `PRODUCT.md` for what the site is for and `DESIGN.md` for how it looks.

## Commands

- `npm run dev` (or `npx astro dev --background`), `npm run build`, `npm run preview`
- Model data and the NumPy check need a Python env, kept outside the site build:
  `uv venv --python 3.11 && uv pip install "torch==2.2.2" "transformers==4.44.2" "numpy<2" scikit-learn`
  (those pins are what runs on this Intel Mac), then
  `python scripts/gpt2_figures.py` and `python scripts/gpt_numpy.py`.

## Adding a note

1. Create `src/content/notes/<slug>.mdx`. Frontmatter is validated in `src/content.config.ts`:
   `title`, `description` (also the standfirst and the list blurb), `date`, `order`
   (reading order on the index), optional `prereqs: [{ note, why }]`, `related`, `draft`.
2. `prereqs` renders a "Read first" box, and the prerequisite note automatically
   lists this one under "Goes deeper". Link sideways in prose with
   `/notes/<slug>#<heading-id>`; heading ids are the slugified heading text.
3. Only `##` headings appear in the contents rail. Keep them short.
4. Figures are Astro components in `src/components/figures/`, imported at the top
   of the MDX file. Text between a figure's tags is its caption.

## Rules for notes

- Written in the owner's first person: plain, direct, no hype. No em dashes.
- Never copy a source's wording or examples. Credit sources in a closing section.
- A figure says in its caption whether its numbers are real model output or made up.
  Real numbers come from `scripts/gpt2_figures.py` into `src/data/gpt2/*.json`.
  Add to that script and rerun it; do not hand-edit the JSON.
- Code shown in a note comes from a tested file through `<Snippet name="region" />`
  (regions are `# --- name` markers in `scripts/gpt_numpy.py`). Do not retype code.
- Check every number quoted in prose against the figure or script that produces it.

## Figure language

Shared pieces live in `src/styles/global.css` and `src/lib/fig.ts`. Reuse them so
figures across notes read as one system.

- A token is a chip (`Tok.astro`, or `tok()` on the client). A leading space shows as a dot.
- A probability is a horizontal bar (`.bars`, `.bar-row`), always on an absolute 0 to 100% scale.
- A vector or matrix is a row of number cells (`Cells.astro`, `.cell`): blue for
  positive, red for negative, hatched for masked or switched off.
- Yellow highlighter means attention or "newly added". Pen blue means the thing in focus.
- Interactive figures are custom elements (`fig-*`) defined in the component's
  `<script>`. Server-render a sensible first state. Controls are `.btn`, `.slider`.
- Every figure must work at 390px wide, in both themes, by keyboard, with reduced motion.
- Class names `.side` and `.row` are taken by the page layout. Do not reuse them inside figures.
