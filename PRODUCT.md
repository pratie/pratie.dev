# Product

pratie.dev is the personal site of pratie, an AI engineer. It has two jobs: a
short front page about who they are and what they have built, and a growing set
of long-form notes on how language models work.

Written from the owner's own brief, without an interview: they asked for no
questions. Correct anything here that is wrong.

## Platform

web

## Stack

Astro 7 (static output), MDX for notes, plain CSS, vanilla TypeScript custom
elements for interactive figures. Hosted on Vercel, deployed on push to `main`.
Python scripts (not part of the site build) produce the real model data that
figures read.

## Users

- **The owner, first.** They studied this material a few years ago, work with
  models daily, and want notes they can come back to that settle the
  understanding instead of re-deriving it each time.
- **Other engineers** who know the high-level story and want the mechanism.

Both read at a desk, in long sittings, often with the page open next to code.

## Product Purpose

Make each idea in the LLM stack understandable end to end, one note per idea,
with figures you can operate instead of static diagrams. Success is a reader
who can explain the stage back and predict what a figure will do before
touching it.

## Positioning

A notebook, not a publication. The notes are the owner's own working-through of
the material, grounded in numbers from a real model wherever a real number is
possible.

## Operating Context

- New notes are added over time; the series runs from basics to deeper topics.
- A book the owner is studying can become a series of chapters: their own explanation of each
  part, with pointers to the pages of the book that go deeper. The first is Inference Engineering.
- Notes link to each other only where concepts genuinely depend on each other:
  each note lists what to read first, and the basics note is the hub.
- Some notes are written from a source such as a video or paper. Those are
  rewritten in the owner's words with original examples, and credit the source.

## Capabilities and Constraints

- Figures must say whether their numbers are real model output or made up for
  illustration. Real numbers come from a committed script, never hand-edited.
- Code shown in a note is read from the tested source file, not retyped.
- No tracking, no accounts, no comments. Static pages only.
- Must read well on a phone; figures cannot require a wide screen.

## Brand Commitments

- The owner's writing brief is `WRITING.md`: a curious engineer explaining to a friend, questions
  first, intuition before implementation, every term defined.
- The owner asked for: minimal, "notepad style", light, with readable fonts.
  The earlier dark, heavy-type portfolio was rejected as too heavy.
- The handle "pratie" is the only name used. No real name is published.

## Evidence on Hand

- GPT-2 small run locally: predictions, attention weights, embeddings,
  per-layer decodes, per-token loss (`scripts/gpt2_figures.py`).
- A NumPy forward pass verified against the reference GPT-2 implementation
  (`scripts/gpt_numpy.py`).
- The owner's projects, listed on the front page.

## Product Principles

1. Real numbers over illustrative ones; when illustrative, say so.
2. One running example carried through a note beats several disconnected ones.
3. Every figure earns its place by answering a question the prose just raised.
4. Plain words. Define a term the first time it appears.
5. Admit what is skipped and what is not understood.

## Accessibility & Inclusion

WCAG 2.2 AA: body text contrast at least 4.5:1 in both themes, every control
reachable and operable by keyboard, visible focus, reduced-motion honoured,
figures usable at 390px wide without horizontal page scroll.
