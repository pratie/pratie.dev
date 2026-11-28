/**
 * One request, pass by pass, when every pass has two costs: fetching the weights once, and doing
 * a little arithmetic for each token in the pass. The first pass reads the whole prompt and
 * produces the first token of the answer. Every later pass handles one token.
 */

export interface Costs {
  /** milliseconds to fetch all the weights once */
  fetchMs: number;
  /** milliseconds of arithmetic for one token */
  calcMs: number;
}

export interface Split {
  readFetch: number;
  readCalc: number;
  writeFetch: number;
  writeCalc: number;
}

/** Time spent so far, by phase and by kind of cost, after this many passes. */
export function split(prompt: number, passes: number, costs: Costs): Split {
  const read = passes >= 1 ? 1 : 0;
  const writes = Math.max(0, passes - 1);
  return {
    readFetch: read * costs.fetchMs,
    readCalc: read * prompt * costs.calcMs,
    writeFetch: writes * costs.fetchMs,
    writeCalc: writes * costs.calcMs,
  };
}

/** The wait for the first token: one pass over the whole prompt. */
export const firstToken = (prompt: number, costs: Costs) => costs.fetchMs + prompt * costs.calcMs;

/** The gap between tokens after that: one pass over one token. */
export const eachToken = (costs: Costs) => costs.fetchMs + costs.calcMs;

const ms = (value: number) => `${value < 10 ? value.toFixed(1) : Math.round(value)} ms`;

/** What the pass that just ran did, in words. */
export function doing(prompt: number, answer: number, passes: number): string {
  if (passes === 0) return `Nothing has run yet. The prompt is ${prompt} tokens long.`;
  if (passes === 1)
    return `Pass 1 is prefill. All ${prompt} prompt tokens go through the model together, and the first token of the answer comes out.`;
  const end = passes >= answer ? ' The answer is complete.' : '';
  return `Pass ${passes} is decode. Only the newest token goes through the model. All the weights are fetched again for that one token.${end}`;
}

/** The timings a user would notice, in words. */
export function timings(prompt: number, answer: number, passes: number, costs: Costs): string {
  if (passes === 0) return 'Run the first pass to start the clock.';
  const first = firstToken(prompt, costs);
  const each = eachToken(costs);
  let text = `First token after ${ms(first)}.`;
  if (passes >= 2) text += ` After that, one token every ${ms(each)}, which is ${Math.round(1000 / each)} tokens a second.`;
  if (passes >= answer) text += ` Per token, reading cost ${ms(first / prompt)} and writing cost ${ms(each)}.`;
  return text;
}
