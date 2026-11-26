// Checks the built site without a browser.
//
//   npm run build && node scripts/smoke.mjs
//
// For every page in dist/ it: checks that each internal link and #anchor exists, and that a link
// saying "chapter 7" points at the seventh chapter; loads the page in jsdom; runs the page's
// scripts; presses every button, moves every slider and types in every text box inside a figure;
// and fails if anything throws or a figure prints "undefined".
// It cannot see layout. It only proves the links hold and the figures run.
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';
import { JSDOM, VirtualConsole } from 'jsdom';
import { rolldown } from 'rolldown';

const dist = new URL('../dist/', import.meta.url).pathname;
const scratch = mkdtempSync(join(tmpdir(), 'smoke-'));
const problems = [];
const tick = (ms = 15) => new Promise((done) => setTimeout(done, ms));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const routeOf = (file) => {
  const route = '/' + relative(dist, file).replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  return route.replace(/\/$/, '') || '/';
};

const pages = htmlFiles(dist).map((file) => ({ file, route: routeOf(file), html: readFileSync(file, 'utf8') }));
const ids = new Map(pages.map((page) => [page.route, new Set([...page.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

// ---------- links ----------
for (const page of pages) {
  for (const [, href] of page.html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|\/_astro\/|\/favicon|\/rss|\/sitemap)/.test(href)) continue;
    const [path, anchor] = href.split('#');
    const target = (path || page.route).replace(/\/$/, '') || '/';
    if (!ids.has(target)) problems.push(`${page.route}: link to missing page ${href}`);
    else if (anchor && !ids.get(target).has(decodeURIComponent(anchor))) problems.push(`${page.route}: link to missing anchor ${href}`);
  }
}

// ---------- chapter numbers ----------
// The rail on every page lists each chapter with its number, so it is the source of truth.
// Inserting or moving a chapter must not leave "chapter 5" pointing at what is now chapter 6.
const numbers = new Map();
for (const page of pages) {
  for (const [, href, n] of page.html.matchAll(/<a href="([^"]+)"[^>]*><span class="num"[^>]*>(\d+)<\/span>/g)) numbers.set(href, Number(n));
}
let numbered = 0;
for (const page of pages) {
  for (const [, href, text] of page.html.matchAll(/<a href="([^"#]+)(?:#[^"]*)?"[^>]*>([^<]*)<\/a>/g)) {
    const said = /\bchapter (\d+)\b/i.exec(text);
    if (!said || !numbers.has(href)) continue;
    numbered++;
    if (numbers.get(href) !== Number(said[1])) problems.push(`${page.route}: "${text}" links to ${href}, which is chapter ${numbers.get(href)}`);
  }
}

// ---------- scripts ----------
/** Bundle a page's module scripts into one plain script that jsdom can run. */
async function bundle(page, n) {
  const imports = [];
  const tags = [...page.html.matchAll(/<script type="module"(?: src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g)];
  tags.forEach(([, src, inline], i) => {
    if (src) imports.push(join(dist, src));
    else if (inline.trim()) {
      const file = join(scratch, `inline-${n}-${i}.js`);
      writeFileSync(file, inline.replaceAll('"/_astro/', `"${dist}_astro/`));
      imports.push(file);
    }
  });
  if (imports.length === 0) return '';
  const entry = join(scratch, `entry-${n}.js`);
  writeFileSync(entry, imports.map((file) => `import ${JSON.stringify(file)};`).join('\n'));
  const build = await rolldown({ input: entry, logLevel: 'silent' });
  const { output } = await build.generate({ format: 'iife' });
  return output[0].code;
}

async function exercise(page, n) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.detail?.stack ?? error.message));
  virtualConsole.on('error', (message) => errors.push(String(message)));

  const dom = new JSDOM(page.html, {
    url: `https://pratie.dev${page.route}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;
  const { document } = window;
  // "reduce motion" makes the figures skip their pauses, which keeps this fast
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  window.Element.prototype.scrollIntoView = () => {};

  const figures = [...document.querySelectorAll('figure.fig')];
  const before = figures.map((figure) => figure.innerHTML);

  const code = await bundle(page, n);
  if (code) window.eval(code);
  await tick(60);
  for (const element of document.querySelectorAll('*')) {
    const tag = element.localName;
    if (tag.startsWith('fig-') && !window.customElements.get(tag)) errors.push(`<${tag}> was never defined`);
  }

  const fire = (element, type) => element.dispatchEvent(new window.Event(type, { bubbles: true }));
  for (const figure of figures) {
    for (const range of figure.querySelectorAll('input[type="range"]')) {
      if (range.disabled) continue;
      const [min, max] = [Number(range.min), Number(range.max)];
      for (const value of [min, max, (min + max) / 2]) {
        range.value = String(value);
        fire(range, 'input');
      }
    }
    for (const select of figure.querySelectorAll('select')) {
      for (const option of select.options) {
        select.value = option.value;
        fire(select, 'input');
      }
    }
    for (const text of figure.querySelectorAll('input[type="text"], input[type="number"]')) {
      text.value = text.type === 'number' ? '800' : 'Zebra crossing naïve 😀';
      fire(text, 'input');
    }
    for (let round = 0; round < 3; round++) {
      for (const button of figure.querySelectorAll('button, [role="button"]')) {
        if (button.disabled) continue;
        button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        await tick(4);
      }
    }
  }
  await tick(80);

  figures.forEach((figure, i) => {
    const text = figure.textContent ?? '';
    const custom = [...figure.querySelectorAll('*')].find((element) => element.localName.startsWith('fig-'));
    const name = custom?.localName ?? 'figure';
    // an interactive figure that looks exactly as the server rendered it never ran
    if (custom && figure.innerHTML === before[i]) errors.push(`${name} did not change after its script ran`);
    if (process.argv.includes('--show') && custom) {
      const live = figure.querySelector('[data-answer], [data-verdict], [data-doing], [data-picked], [data-stats], [data-note]');
      console.log(`     ${name}: ${(live?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 150)}`);
    }
    if (/undefined|\[object |null\b/.test(text)) errors.push(`${name} prints "${text.match(/.{0,30}(undefined|\[object |null\b).{0,30}/)[0]}"`);
    // only the softmax figure is supposed to be able to show NaN
    if (/NaN/.test(text) && name !== 'fig-softmax') errors.push(`${name} prints NaN`);
  });

  window.close();
  return { figures: figures.length, errors: [...new Set(errors)] };
}

let n = 0;
for (const page of pages) {
  const { figures, errors } = await exercise(page, n++);
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${page.route}  (${figures} figures)`);
  for (const error of errors) problems.push(`${page.route}: ${error.split('\n').slice(0, 3).join(' | ')}`);
}

rmSync(scratch, { recursive: true, force: true });
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`\n${pages.length} pages, all links resolve, ${numbered} chapter numbers point at the right chapter, every figure ran.`);
