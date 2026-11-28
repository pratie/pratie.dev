/** A linear layer small enough to check by hand. Pure, so the server and the browser print the same working. */
import { num } from './fig.ts';

/** Matrix times vector: each row of W, weighted by x and added up, gives one output. */
export const matVec = (W: number[][], x: number[]) => W.map((row) => row.reduce((sum, w, i) => sum + w * x[i], 0));

const shown = (v: number) => (v < 0 ? `(${num(v, 1)})` : num(v, 1));

/** The sum behind one output, written out: "Output 2 = 1.5 × 1.0 + 0.5 × (−0.5) + (−0.5) × 2.0 = 0.25" */
export function working(W: number[][], x: number[], row: number): string {
  const terms = W[row].map((w, i) => `${shown(w)} × ${shown(x[i])}`);
  return `Output ${row + 1} = ${terms.join(' + ')} = ${num(matVec(W, x)[row], 2)}`;
}

/** How much arithmetic a layer with this many outputs and inputs takes for one vector. */
export const operations = (outputs: number, inputs: number) => ({
  multiplications: outputs * inputs,
  additions: outputs * (inputs - 1),
});
