/** Series of notes. The key is the folder under src/content/notes and the URL prefix. */
export interface Series {
  title: string;
  blurb: string;
  book?: { title: string; author: string; publisher: string; url: string };
}

export const SERIES: Record<string, Series> = {
  'inference-engineering': {
    title: 'Inference Engineering',
    blurb:
      'What it takes to serve a model to real users: fast, cheap and without falling over. My notes, chapter by chapter, from working through Philip Kiely’s book.',
    book: {
      title: 'Inference Engineering',
      author: 'Philip Kiely',
      publisher: 'Baseten Books, 2026',
      url: 'https://www.baseten.co/inference-engineering/',
    },
  },
};
