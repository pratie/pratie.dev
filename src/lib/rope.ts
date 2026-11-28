/**
 * Rotary position on pairs of numbers. A pair is an arrow on a dial, and a token's position turns it.
 * Kept pure so the one property that matters can be tested: the score depends only on the gap.
 */

/** Two of the many pairs in a real key, turning at different speeds. */
export const SPEEDS = [
  { name: 'A fast pair', degrees: 40 },
  { name: 'A slow pair', degrees: 4 },
];

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/** How far the arrow of a token at this position has turned, in degrees within one full turn. */
export const turn = (position: number, degrees: number) => (position * degrees) % 360;

/** Where an arrow of length 1 points after turning: x to the right, y upward. */
export const tip = (angle: number): [number, number] => [Math.cos(radians(angle)), Math.sin(radians(angle))];

/** What one pair adds to the attention score, for a key and a query that began pointing the same way. */
export function pairScore(keyAt: number, readerAt: number, degrees: number): number {
  const [kx, ky] = tip(turn(keyAt, degrees));
  const [qx, qy] = tip(turn(readerAt, degrees));
  return kx * qx + ky * qy;
}

/** The turn that a gap of this many tokens puts between the two arrows, as a person would say it. */
export function apart(gap: number, degrees: number): string {
  const total = gap * degrees;
  return total >= 360 ? `${total}° apart, the same as ${total % 360}°` : `${total}° apart`;
}

const two = (x: number) => (Math.abs(x) < 0.005 ? '0.00' : x.toFixed(2).replace('-', '−'));

/** What the two dials show, in one sentence. The same words are printed by the server and the browser. */
export function summary(gap: number, start: number): string {
  const total = SPEEDS.reduce((sum, speed) => sum + pairScore(start, start + gap, speed.degrees), 0);
  const where =
    gap === 0
      ? 'The reader is looking at its own position.'
      : `The reader is ${gap} token${gap === 1 ? '' : 's'} after the token it reads.`;
  return `${where} Together the two pairs score ${two(total)} out of 2. The token being read is number ${start} in the text, and moving it changes nothing here.`;
}
