import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
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
  }),
});

export const collections = { notes };
