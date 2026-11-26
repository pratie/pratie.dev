import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allNotes, noteUrl } from '../lib/notes';

export async function GET(context: APIContext) {
  const notes = await allNotes();
  return rss({
    title: 'pratie: notes',
    description: 'Notes on how language models work.',
    site: context.site!,
    trailingSlash: false,
    items: notes
      .slice()
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((note) => ({
        title: note.data.title,
        description: note.data.description,
        pubDate: note.data.date,
        link: noteUrl(note.id),
      })),
  });
}
