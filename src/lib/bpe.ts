/**
 * Byte-pair encoding, the way GPT-2 does it, small enough to train in the browser.
 * Start from the 256 byte values; repeatedly glue the most frequent adjacent pair
 * into a new token. Ids 0..255 are bytes, 256 + k is the k-th merge.
 */

export interface Bpe {
  merges: [number, number][];
  /** vocab[id] is the bytes that token stands for */
  vocab: Uint8Array[];
}

const encoder = new TextEncoder();
const strict = new TextDecoder('utf-8', { fatal: true });

// GPT-2's pre-tokeniser: words keep their leading space, digits and punctuation split off.
const PIECES = /'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
const pieces = (text: string) => text.match(PIECES) ?? [];
const key = (a: number, b: number) => a * 65536 + b;

function glue(ids: number[], a: number, b: number, id: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === a && ids[i + 1] === b) {
      out.push(id);
      i++;
    } else out.push(ids[i]);
  }
  return out;
}

export function train(text: string, maxMerges: number): Bpe {
  const counts = new Map<string, number>();
  for (const piece of pieces(text)) counts.set(piece, (counts.get(piece) ?? 0) + 1);
  const words = [...counts].map(([piece, n]) => ({ ids: Array.from(encoder.encode(piece)), n }));

  const vocab = Array.from({ length: 256 }, (_, i) => Uint8Array.of(i));
  const merges: [number, number][] = [];

  while (merges.length < maxMerges) {
    const pairs = new Map<number, number>();
    for (const { ids, n } of words) {
      for (let i = 0; i + 1 < ids.length; i++) {
        const k = key(ids[i], ids[i + 1]);
        pairs.set(k, (pairs.get(k) ?? 0) + n);
      }
    }
    // most frequent pair; it has to occur at least twice to be worth a token
    let best = -1;
    let bestN = 1;
    for (const [k, n] of pairs) {
      if (n > bestN || (n === bestN && best !== -1 && k < best)) {
        best = k;
        bestN = n;
      }
    }
    if (best === -1) break;

    const a = Math.floor(best / 65536);
    const b = best % 65536;
    const id = vocab.length;
    merges.push([a, b]);
    vocab.push(Uint8Array.of(...vocab[a], ...vocab[b]));
    for (const word of words) word.ids = glue(word.ids, a, b, id);
  }
  return { merges, vocab };
}

/** Encode with only the first `upTo` merges, to replay training. */
export function encode(text: string, bpe: Bpe, upTo = bpe.merges.length): number[] {
  const rank = new Map<number, number>();
  for (let i = 0; i < upTo; i++) rank.set(key(...bpe.merges[i]), i);

  const out: number[] = [];
  for (const piece of pieces(text)) {
    let ids = Array.from(encoder.encode(piece));
    for (;;) {
      let first = Infinity;
      for (let i = 0; i + 1 < ids.length; i++) {
        const r = rank.get(key(ids[i], ids[i + 1]));
        if (r !== undefined && r < first) first = r;
      }
      if (first === Infinity) break;
      ids = glue(ids, ...bpe.merges[first], 256 + first);
    }
    out.push(...ids);
  }
  return out;
}

/** Text for a token; a token that is only part of a multi-byte character shows its raw bytes. */
export function show(id: number, bpe: Bpe): string {
  const bytes = bpe.vocab[id];
  try {
    return strict.decode(bytes);
  } catch {
    return Array.from(bytes, (b) => `\\x${b.toString(16).padStart(2, '0')}`).join('');
  }
}
