/**
 * The arithmetic behind the calculator figures. Each calculator is a pure function from
 * slider values to a few result rows and one plain sentence, so it can be tested without a page.
 */

export interface Row {
  label: string;
  text: string;
  /** 0..1, drawn as a bar; leave out for a row that is only text */
  bar?: number;
  tone?: 'pen' | 'warn';
}

export interface Result {
  rows: Row[];
  answer: string;
}

export type Values = Record<string, number>;

// ---------- formatting ----------

export const count = (x: number, digits = 0) =>
  x.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** A duration in the unit a person would say it in. */
export function span(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'never';
  if (seconds < 1) return `${count(seconds * 1000)} ms`;
  if (seconds < 60) return `${count(seconds, seconds < 10 ? 1 : 0)} s`;
  if (seconds < 3600) return `${count(seconds / 60, seconds < 600 ? 1 : 0)} min`;
  if (seconds < 86400 * 2) return `${count(seconds / 3600, 1)} hours`;
  return `${count(seconds / 86400, 1)} days`;
}

export const dollars = (x: number) => (x >= 100 ? `$${count(x)}` : x >= 1 ? `$${count(x, 2)}` : `$${count(x, 3)}`);

export const gigabytes = (x: number) => (x >= 100 ? `${count(x)} GB` : x >= 1 ? `${count(x, 1)} GB` : `${count(x * 1000)} MB`);

const share = (part: number, whole: number) => (whole > 0 ? Math.min(1, part / whole) : 0);

// ---------- hardware used by more than one calculator ----------

/** Memory and memory bandwidth as printed on the spec sheets, per GPU. */
export const GPUS = [
  { name: 'L4', vram: 24, bandwidth: 300 },
  { name: 'H100', vram: 80, bandwidth: 3350 },
  { name: 'H200', vram: 141, bandwidth: 4800 },
  { name: 'B200', vram: 192, bandwidth: 8000 },
];

/** Keys plus values per token per layer, in numbers, for a few real models. */
export const KV_MODELS = [
  { name: 'GPT-2 small', layers: 12, width: 768 },
  { name: 'Llama 3 8B', layers: 32, width: 1024 },
  { name: 'Llama 3 70B', layers: 80, width: 1024 },
];

// ---------- the calculators ----------

/** One GPU, a crowd, and whether it serves them one at a time or several together. */
function crowd(v: Values): Result {
  const each = v.tokens / v.speed;
  const alone = v.people * each;
  const kept = v.kept / 100;
  const rounds = Math.ceil(v.people / v.together);
  const shared = (rounds * v.tokens) / (v.speed * kept);
  const longest = Math.max(alone, shared);
  return {
    rows: [
      { label: 'One answer, nobody else around', text: span(each), bar: share(each, longest) },
      { label: 'Last person, one at a time', text: span(alone), bar: share(alone, longest), tone: 'warn' },
      { label: `Last person, ${v.together} at a time`, text: span(shared), bar: share(shared, longest), tone: 'pen' },
    ],
    answer:
      v.together === 1
        ? `With one request at a time, person number ${v.people} waits ${span(alone - each)} before their answer even starts.`
        : shared >= alone
          ? `With this few people, sharing only slows everyone down: ${span(each / kept)} an answer instead of ${span(each)}.`
          : `Running ${v.together} together makes each answer slower, ${span(each / kept)} instead of ${span(each)}, but the last person is done ${count(alone / shared, 1)} times sooner.`,
  };
}

/** Paying per token against renting GPUs by the hour. */
function breakeven(v: Values): Result {
  const perDay = v.millions * 1e6;
  const api = v.millions * v.price;
  const capacity = v.speed * 86400 * (v.busy / 100);
  const gpus = Math.max(1, Math.ceil(perDay / capacity));
  const own = gpus * v.rent * 24;
  const most = Math.max(api, own);
  const even = (v.rent * 24) / v.price;
  return {
    rows: [
      { label: 'Per-token API, per day', text: dollars(api), bar: share(api, most), tone: api <= own ? 'pen' : undefined },
      {
        label: `${gpus} rented GPU${gpus > 1 ? 's' : ''}, per day`,
        text: dollars(own),
        bar: share(own, most),
        tone: own < api ? 'pen' : undefined,
      },
      { label: 'One GPU pays for itself at', text: `${count(even, even < 10 ? 1 : 0)}M tokens a day` },
    ],
    answer:
      api <= own
        ? `At this volume the API is cheaper, by ${dollars(own - api)} a day. The GPU costs the same whether it is busy or idle.`
        : `At this volume your own GPUs are cheaper, by ${dollars(api - own)} a day, before counting the engineering time to run them.`,
  };
}

/** What a user waits for: the queue and network, the first token, then the stream. */
function latency(v: Values): Result {
  const before = v.overhead / 1000;
  const first = v.ttft / 1000;
  const stream = v.tokens / v.tps;
  const total = before + first + stream;
  return {
    rows: [
      { label: 'Network and queue', text: span(before), bar: share(before, total) },
      { label: 'Prefill, up to the first token', text: span(first), bar: share(first, total) },
      { label: `Decode, ${count(v.tokens)} tokens`, text: span(stream), bar: share(stream, total), tone: 'pen' },
      { label: 'Start to finish', text: span(total) },
    ],
    answer: `The reader sees the first word after ${span(before + first)} and the last after ${span(total)}. ${count(share(stream, total) * 100)}% of the wait is decode.`,
  };
}

/** Does the model fit on this GPU, and how fast could one stream possibly go? */
function ceiling(v: Values): Result {
  const gpu = GPUS[v.gpu];
  const weights = (v.params * v.bits) / 8;
  const fits = weights <= gpu.vram;
  const roomy = weights * 1.5 <= gpu.vram;
  const tps = gpu.bandwidth / weights;
  return {
    rows: [
      { label: 'Weights', text: gigabytes(weights), bar: share(weights, Math.max(weights, gpu.vram)), tone: fits ? undefined : 'warn' },
      { label: `Memory on one ${gpu.name}`, text: gigabytes(gpu.vram), bar: share(gpu.vram, Math.max(weights, gpu.vram)) },
      { label: 'Left for the KV cache', text: fits ? gigabytes(gpu.vram - weights) : 'none', tone: roomy ? undefined : 'warn' },
      { label: 'Ceiling for one stream', text: fits ? `${count(tps, tps < 10 ? 1 : 0)} tokens/s` : 'does not fit', tone: 'pen' },
    ],
    answer: !fits
      ? `${gigabytes(weights)} of weights will not load into ${gpu.vram} GB. Use fewer bits, a bigger GPU, or more than one.`
      : roomy
        ? `It fits with room to work. Reading ${gigabytes(weights)} once per token at ${count(gpu.bandwidth / 1000, 2)} TB/s allows at most ${count(tps, tps < 10 ? 1 : 0)} tokens a second for a single stream.`
        : `It loads, but less than half the weights' size is left over for the KV cache, so long prompts and batches will run out of memory.`,
  };
}

/** How much memory the KV cache takes. */
function kvsize(v: Values): Result {
  const model = KV_MODELS[v.model];
  const perToken = 2 * model.layers * model.width * (v.bits / 8);
  const perRequest = (perToken * v.context) / 1e9;
  const all = perRequest * v.requests;
  return {
    rows: [
      { label: 'One token', text: `${count(perToken / 1000, perToken < 1e5 ? 1 : 0)} KB` },
      { label: `One request, ${count(v.context)} tokens`, text: gigabytes(perRequest), bar: share(perRequest, all) },
      { label: `${v.requests} requests at once`, text: gigabytes(all), bar: 1, tone: 'pen' },
    ],
    answer: `${model.name} stores ${count(2 * model.layers * model.width)} numbers for every token it has read. At this setting the cache alone needs ${gigabytes(all)}.`,
  };
}

/** Expected gain from drafting k tokens that are each right with probability a. */
function speculate(v: Values): Result {
  const a = v.accept / 100;
  const made = a >= 1 ? v.draft + 1 : (1 - a ** (v.draft + 1)) / (1 - a);
  const cost = 1 + v.draft * (v.cost / 100);
  const speedup = made / cost;
  return {
    rows: [
      { label: 'Tokens per big-model pass', text: count(made, 2), bar: share(made, v.draft + 1), tone: 'pen' },
      { label: 'Cost of one round', text: `${count(cost, 2)} passes`, bar: share(cost, v.draft + 1) },
      { label: 'Speed compared with no drafting', text: `${count(speedup, 2)}×`, tone: speedup < 1 ? 'warn' : 'pen' },
    ],
    answer:
      speedup < 1
        ? `This is slower than not drafting at all. The drafts cost more than the tokens they save.`
        : `Each round yields ${count(made, 2)} tokens for the price of ${count(cost, 2)} passes, so decode runs ${count(speedup, 2)} times as fast.`,
  };
}

/** How many GPUs a model needs once the KV cache has room. */
function gpucount(v: Values): Result {
  const gpu = GPUS[v.gpu];
  const weights = (v.params * v.bits) / 8;
  const needed = weights / (1 - v.cache / 100);
  const exact = needed / gpu.vram;
  const sizes = [1, 2, 4, 8];
  const gpus = sizes.find((n) => n >= exact) ?? Math.ceil(exact / 8) * 8;
  return {
    rows: [
      { label: 'Weights', text: gigabytes(weights), bar: share(weights, gpus * gpu.vram) },
      { label: 'With room for the KV cache', text: gigabytes(needed), bar: share(needed, gpus * gpu.vram) },
      { label: `${gpus} × ${gpu.name}`, text: gigabytes(gpus * gpu.vram), bar: 1, tone: 'pen' },
    ],
    answer:
      gpus > 8
        ? `That is more than one node of eight GPUs: ${gpus} of them, which means inference across machines.`
        : `${count(exact, 1)} GPUs' worth of memory, rounded up to the next size you can rent: ${gpus}.`,
  };
}

/** Passes through the denoiser for one image, with guidance all the way or only at the start. */
function imagesteps(v: Values): Result {
  const guided = Math.round((v.steps * v.until) / 100);
  const full = v.steps * 2;
  const cut = guided * 2 + (v.steps - guided);
  const each = v.pass / 1000;
  return {
    rows: [
      { label: 'Guidance on every step', text: `${full} passes, ${span(full * each)}`, bar: 1 },
      { label: `Guidance on the first ${guided}`, text: `${cut} passes, ${span(cut * each)}`, bar: share(cut, full), tone: 'pen' },
    ],
    answer:
      cut === full
        ? `Every step runs the model twice, once with the prompt and once without, so ${v.steps} steps are ${full} passes.`
        : `Dropping guidance after step ${guided} saves ${full - cut} passes, ${count((1 - cut / full) * 100)}% of the work, without changing the number of steps.`,
  };
}

/** The parts of a cold start, added up. */
function coldstart(v: Values): Result {
  const image = (v.image * 1000) / v.speed;
  const weights = (v.weights * 1000) / v.speed;
  const total = v.machine + image + weights + v.engine;
  return {
    rows: [
      { label: 'Getting a machine', text: span(v.machine), bar: share(v.machine, total) },
      { label: `Pulling a ${v.image} GB image`, text: span(image), bar: share(image, total) },
      { label: `Loading ${v.weights} GB of weights`, text: span(weights), bar: share(weights, total) },
      { label: 'Starting the engine', text: span(v.engine), bar: share(v.engine, total) },
      { label: 'Until the first request is served', text: span(total), tone: 'pen' },
    ],
    answer: `A new replica is useful ${span(total)} after you ask for it. Any traffic that arrives in that time waits in the queue or lands on the replicas you already have.`,
  };
}

/** What a million tokens costs on hardware you rent by the hour. */
function permillion(v: Values): Result {
  const hourly = v.gpus * v.rent;
  const perHour = v.speed * 3600 * (v.busy / 100);
  const each = (hourly / perHour) * 1e6;
  const flatOut = (hourly / (v.speed * 3600)) * 1e6;
  return {
    rows: [
      { label: 'Rent per hour', text: dollars(hourly) },
      { label: 'Tokens produced per hour', text: `${count(perHour / 1e6, 2)}M` },
      { label: 'If it were busy all the time', text: `${dollars(flatOut)} per million`, bar: share(flatOut, each) },
      { label: `Busy ${v.busy}% of the time`, text: `${dollars(each)} per million`, bar: 1, tone: 'pen' },
    ],
    answer: `The rent is fixed, so every idle minute raises the price of the tokens you did produce. At ${v.busy}% busy, a million tokens costs ${dollars(each)}.`,
  };
}

/** How often to expect a GPU to fail, at the rate Meta reported for training Llama 3. */
function failures(v: Values): Result {
  const perHour = v.gpus / 50000;
  const yearly = perHour * 24 * 365;
  const gap = 1 / perHour;
  return {
    rows: [
      { label: 'GPU-hours per year', text: count(v.gpus * 24 * 365) },
      { label: 'Failures to expect per year', text: count(yearly, yearly < 10 ? 1 : 0), tone: 'pen' },
      { label: 'Typical time between them', text: span(gap * 3600) },
    ],
    answer: `At one failure per 50,000 GPU-hours, ${count(v.gpus)} GPUs lose one about every ${span(gap * 3600)}.`,
  };
}

export const calcs: Record<string, (v: Values) => Result> = {
  crowd,
  breakeven,
  latency,
  ceiling,
  kvsize,
  speculate,
  gpucount,
  imagesteps,
  coldstart,
  permillion,
  failures,
};
