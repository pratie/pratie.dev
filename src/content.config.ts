import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  // A note in a folder belongs to the series named after the folder, and is
  // published at /<folder>/<file>. Notes at the top level live under /notes/.
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    // A few words for the left rail. Falls back to the title.
    short: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // Reading order on the index pages; lower comes first.
    order: z.number().default(99),
    // Notes to read first, each with one line on what it gives you.
    prereqs: z.array(z.object({ note: reference('notes'), why: z.string() })).default([]),
    // Sideways links: same level, related idea.
    related: z.array(reference('notes')).default([]),
    // For a note in a series: which series, and its place in it.
    series: z.string().optional(),
    chapter: z.number().optional(),
    // Where the series' source book covers this, shown at the end of the note.
    book: z.array(z.object({ where: z.string(), what: z.string() })).default([]),
  }),
});

export const collections = { notes };
