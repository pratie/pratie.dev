/**
 * A five-token, four-dimension toy for the from-scratch note.
 * Every number here was set by hand so the arithmetic can be followed by eye.
 */
import { dot, softmax, vecMat } from './fig.ts';

export const TOKENS = ['my', 'cat', 'sleeps', 'all', 'day'];

/** What each dimension loosely stands for. Real embeddings have no such labels. */
export const DIMS = ['thing', 'action', 'time', 'glue'];

export const X = [
  [0.1, 0.0, 0.0, 0.9], // my
  [1.0, 0.1, 0.0, 0.0], // cat
  [0.1, 1.0, 0.2, 0.0], // sleeps
  [0.0, 0.0, 0.5, 0.7], // all
  [0.2, 0.0, 1.0, 0.0], // day
];

// Rows are input dimensions, columns are output dimensions.
// Columns 0-1 belong to head one, columns 2-3 to head two.
/** Queries: an action asks "who is doing this?", a time word asks "what happens then?" */
export const WQ = [
  [0, 0, 0, 0],
  [2.2, 0, 0, 0],
  [0, 0, 2.2, 0],
  [0, 0, 0, 0],
];

/** Keys: a thing answers the first question, an action answers the second. */
export const WK = [
  [2.2, 0, 0, 0],
  [0, 0, 2.2, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

/** Values: left as the identity so the blend is easy to read. */
export const WV = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

export type Mode = 'plain' | 'learned' | 'masked';

export interface Attended {
  Q: number[][];
  K: number[][];
  V: number[][];
  scale: number;
  /** raw dot products, before scaling */
  raw: number[][];
  /** after scaling and masking: what goes into softmax */
  scores: number[][];
  weights: number[][];
  out: number[][];
}

const blend = (weights: number[], V: number[][]) =>
  V[0].map((_, d) => weights.reduce((sum, w, j) => sum + w * V[j][d], 0));

function run(Q: number[][], K: number[][], V: number[][], scale: number, masked: boolean): Attended {
  const raw = Q.map((q) => K.map((k) => dot(q, k)));
  const scores = raw.map((row, i) => row.map((s, j) => (masked && j > i ? -Infinity : s / scale)));
  const weights = scores.map((row) => softmax(row));
  return { Q, K, V, scale, raw, scores, weights, out: weights.map((w) => blend(w, V)) };
}

/** One head over all four dimensions, in the three versions the note builds up. */
export function attend(mode: Mode): Attended {
  if (mode === 'plain') return run(X, X, X, 1, false);
  const project = (W: number[][]) => X.map((x) => vecMat(x, W));
  return run(project(WQ), project(WK), project(WV), Math.sqrt(X[0].length), mode === 'masked');
}

/** Two masked heads, each working in its own two-dimensional slice. */
export function heads(): Attended[] {
  const project = (W: number[][]) => X.map((x) => vecMat(x, W));
  const [Q, K, V] = [project(WQ), project(WK), project(WV)];
  return [0, 1].map((h) => {
    const slice = (M: number[][]) => M.map((row) => row.slice(2 * h, 2 * h + 2));
    return run(slice(Q), slice(K), slice(V), Math.sqrt(2), true);
  });
}
