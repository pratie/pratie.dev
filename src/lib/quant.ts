/**
 * The simplest possible quantization: snap each number to the nearest point on an evenly
 * spaced grid of integers, and remember one scale to turn the integers back into numbers.
 */

export interface Quantized {
  /** what is stored: small integers */
  stored: number[];
  /** what you get when you read them back */
  back: number[];
  /** the grid spacing used for each value */
  step: number[];
}

/** `block` is how many neighbouring values share one scale; 0 means all of them. */
export function quantize(values: number[], bits: number, block = 0): Quantized {
  const levels = 2 ** (bits - 1) - 1;
  const size = block > 0 ? block : values.length;
  const out: Quantized = { stored: [], back: [], step: [] };
  for (let start = 0; start < values.length; start += size) {
    const group = values.slice(start, start + size);
    const peak = Math.max(...group.map(Math.abs), 1e-12);
    const step = peak / levels;
    for (const value of group) {
      const stored = Math.max(-levels, Math.min(levels, Math.round(value / step)));
      out.stored.push(stored === 0 ? 0 : stored);
      out.back.push(stored * step);
      out.step.push(step);
    }
  }
  return out;
}

export const meanError = (values: number[], back: number[]) =>
  values.reduce((sum, v, i) => sum + Math.abs(v - back[i]), 0) / values.length;
