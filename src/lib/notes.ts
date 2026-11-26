import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;

/** Every published note: stand-alone notes in reading order, then each series in chapter order. */
export async function allNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft);
  return notes.sort(
    (a, b) =>
      (a.data.series ?? '').localeCompare(b.data.series ?? '') ||
      (a.data.chapter ?? 0) - (b.data.chapter ?? 0) ||
      a.data.order - b.data.order ||
      b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export const standalone = (notes: Note[]) => notes.filter((n) => !n.data.series);

export const inSeries = (notes: Note[], series: string) => notes.filter((n) => n.data.series === series);

/** Series notes are published under their folder; everything else under /notes/. */
export const noteUrl = (id: string) => (id.includes('/') ? `/${id}` : `/notes/${id}`);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Minutes to read the prose of an MDX body, ignoring imports, tags and code fences. */
export function readingTime(body = ''): number {
  const words = body
    .replace(/^import .*$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter((w) => /[a-z]/i.test(w)).length;
  return Math.max(1, Math.round(words / 220));
}
