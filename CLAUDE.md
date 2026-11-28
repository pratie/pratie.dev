# pratie.dev

Personal site and AI notes. Astro 7, static, deployed to Vercel on push to `main`.

Read these before changing anything:

- `WRITING.md`: the owner's own brief for how notes must sound. It wins over general writing advice.
- `PRODUCT.md`: what the site is for.
- `DESIGN.md`: how it looks.

## Commands

- `npm run dev` (or `npx astro dev --background`), `npm run build`, `npm run preview`
- `npm test` (the same as `npm run build && node scripts/smoke.mjs`) checks every internal link and
  anchor, checks that a link saying "chapter 7" points at the seventh chapter, then runs every
  figure's script in jsdom and operates its controls. Run it before every push.
- The owner checks the site in a browser themselves. Do not drive a browser to test it.
- Model data and measurements need a Python env, kept outside the site build:
  `uv venv --python 3.11 && uv pip install "torch==2.2.2" "transformers==4.44.2" "numpy<2" scikit-learn`
  (those pins are what runs on this Intel Mac). Then:
  - `python scripts/gpt2_figures.py` writes `src/data/gpt2/*.json` (the basics note)
  - `python scripts/gpt_numpy.py` checks the NumPy GPT against GPT-2 (the from-scratch note)
  - `python scripts/inference_bench.py [part ...]` writes `src/data/bench/*.json` (the inference series).
    Timings are noisy when the laptop is busy. Run it with other programs closed. The parts `compute`
    and `templates` skip loading GPT-2 when asked for by themselves; `templates` fetches the
    tokenizers of two open models from Hugging Face to render their chat templates.

## Where things live

- `src/content/notes/*.mdx`: stand-alone notes, published at `/notes/<file>`.
- `src/content/notes/<series>/*.mdx`: chapters of a series, published at `/<series>/<file>`.
  A series also needs an entry in `src/data/series.ts` and a route folder under `src/pages/`
  (copy `src/pages/inference-engineering/`).
- `src/components/NotePage.astro` renders any note. `Rail.astro` is the left rail on wide screens:
  every note on the site, with the current note's `##` sections nested under it.
- `src/components/figures/`: figures. `src/lib/`: their logic, kept pure so it can be tested.

## Adding a note or a chapter

Frontmatter is validated in `src/content.config.ts`:

- `title`, `description` (also the standfirst and list blurb), `date`
- `short`: a few words for the rail. Keep it under about 22 characters.
- `order` for stand-alone notes; `series` and `chapter` for a chapter.
- `prereqs: [{ note, why }]` renders "Read first", and the prerequisite automatically lists this
  note under "Goes deeper". `related` lists sideways links.
- `book: [{ where, what }]` on a chapter renders "In the book", with the credit to the source.

Only `##` headings appear in the rail. Keep them short. Other notes link to them as
`/notes/<slug>#<heading-id>`, so do not rename a heading without searching for links to it.
`scripts/smoke.mjs` will catch a broken one.

Inserting or moving a chapter changes the number of every chapter after it. Update each `chapter:`
value and every "chapter N" in the prose. The smoke test catches a link whose text names the wrong
number. It cannot catch a number written in plain text ("the bars from chapter 6"), so search for those.

The inference series ends with two reference pages, `glossary.mdx` and `further-reading.mdx`. A term
a chapter defines gets a line in the glossary, under that chapter's heading. A source a chapter leans
on gets a line in the reading list, and only after its link has been checked with `curl`.

When a book becomes a series, check the finished chapters against the book's table of contents,
section by section, before calling it done. The first pass of this series missed half a chapter.

## Rules for notes

- Voice: `WRITING.md`. Start from the question or the problem, build the intuition with a small
  example, then name the thing and explain how it works. Define every term on first use.
  First person, plain words, no invented experiences, no em dashes.
- Never copy a source's wording, examples, figures or tables. Write the idea in your own words with
  your own example, credit the source, and point to where it goes deeper. A table rebuilt with the
  same rows, columns and cell values in different words is still a copy: write the comparison as
  prose, or organise it around a different question than the source does. Never commit a copy of a
  copyrighted book or paper to this repo; link to the publisher's page instead.
- A figure says in its caption whether its numbers are measured, from a real model, or made up.
  Measured and model numbers come from the scripts above into `src/data/`. Do not hand-edit the JSON.
- Quote measured numbers in prose through expressions (`{span(kv.totals[0].with_s)}`), not typed
  digits, so a re-run cannot leave the text contradicting the figure.
- Code shown in a note comes from a tested file through `<Snippet name="region" />`.
- Do not write a bare dollar sign in MDX prose. It starts a maths formula. Write "dollars".

## Figure language

Shared pieces live in `src/styles/global.css` and `src/lib/fig.ts`. Reuse them so figures across
notes read as one system.

- A token is a chip (`Tok.astro`, or `tok()` on the client). A leading space shows as a dot.
- A probability or a measurement is a horizontal bar. `BarsFig.astro` draws static ones from data.
- A calculator is `CalcFig.astro` plus a pure function in `src/lib/calcs.ts`: sliders in, a few
  rows and one sentence out. Add a function there and test it in Node before using it.
- A vector or matrix is a row of number cells (`Cells.astro`, `.cell`): blue for positive, red for
  negative, hatched for masked or switched off.
- A stack of layers is `LayersFig.astro`. A left-to-right flow is `Pipeline.astro`.
- Text exactly as a model receives it is `TemplateFig.astro`: mono type, line breaks shown, and
  whatever the software added marked in yellow.
- `src/content/notes/basics-playground.mdx` gathers one toy for each basic idea (tokens, embeddings,
  matrix multiplication, attention, position, sampling, prefill and decode, the KV cache). It reuses
  figures from the other notes and adds `MatmulFig`, `RopeFig` and `PhasesFig`. A new basic idea gets
  a toy there, three or four sentences, and a link to the note that explains it properly.
- When the server and the browser both print a sentence, build it in one function in `src/lib/`
  and call that from both, so the first paint and the first update cannot disagree.
- Yellow highlighter means attention, a cache hit, or "newly added". Pen blue means the thing in
  focus. Red pencil means something going wrong.
- Interactive figures are custom elements (`fig-*`) defined in the component's `<script>`.
  Server-render a sensible first state. Controls are `.btn`, `.slider`, `.field-input`.
- Every figure must work at 390px wide, in both themes, by keyboard, with reduced motion.
- `.side`, `.row` and `.rail` belong to the page layout. Do not reuse those names inside figures.
