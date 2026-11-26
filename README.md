# pratie.dev

Personal site and notes on how language models work.

- `src/content/notes/` holds the notes (MDX). A folder inside it is a series of chapters.
- `src/components/figures/` holds the interactive figures, `src/lib/` their logic.
- `scripts/gpt2_figures.py` writes the real GPT-2 numbers the basics note uses.
- `scripts/gpt_numpy.py` is a GPT forward pass in NumPy, checked against GPT-2.
- `scripts/inference_bench.py` takes the laptop measurements used in the inference series.
- `scripts/smoke.mjs` checks every link and runs every figure without a browser.

```sh
npm install
npm run dev
npm test        # build, then check links and figures
```

`WRITING.md` is how the notes should sound. `CLAUDE.md` is how to add one.
