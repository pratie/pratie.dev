/** Small DOM and maths helpers shared by the figures. */

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...kids: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = String(value);
    else if (key === 'vars') {
      for (const [name, v] of Object.entries(value as Record<string, unknown>)) el.style.setProperty(name, String(v));
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value as EventListener);
    } else el.setAttribute(key, value === true ? '' : String(value));
  }
  el.append(...kids.filter((kid): kid is Node | string => kid != null && kid !== false));
  return el;
}

/** How a token string is shown: leading space as a faint dot, newline as a return sign. */
export function tokenParts(text: string): { lead: boolean; body: string } {
  const lead = text.startsWith(' ');
  return { lead, body: (lead ? text.slice(1) : text).replace(/\n/g, '⏎') };
}

/** A token chip. `cls` picks the colour: c0..c4, or `bare` for an outline. */
export function tok(text: string, cls = ''): HTMLSpanElement {
  const { lead, body } = tokenParts(text);
  return h('span', { class: `tok ${cls}`.trim() }, lead && h('span', { class: 'sp' }, '·'), body);
}

export function pct(p: number): string {
  if (p >= 0.0995) return `${(p * 100).toFixed(0)}%`;
  if (p >= 0.00095) return `${(p * 100).toFixed(1)}%`;
  return p > 0 ? '<0.1%' : '0%';
}

/** Fixed decimals with a real minus sign, and no negative zero. */
export function num(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'NaN' : x > 0 ? '∞' : '−∞';
  const s = x.toFixed(digits);
  return (Number(s) === 0 ? s.replace('-', '') : s).replace('-', '−');
}

export function softmax(xs: number[], temperature = 1): number[] {
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp((x - max) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export const dot = (a: number[], b: number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0);

/** Row vector times matrix: x (n) · W (n × m) → (m). */
export const vecMat = (x: number[], W: number[][]) => W[0].map((_, j) => x.reduce((sum, v, i) => sum + v * W[i][j], 0));

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, reducedMotion() ? 0 : ms));
