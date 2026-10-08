const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('index.html is an HTML5 document', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
});

test('index.html main content shows only "Silicon Yarra"', () => {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  assert.ok(body, 'expected a <body> element');
  const text = body[1]
    .replace(/<nav[\s\S]*<\/nav>/i, '')
    .replace(/<footer[\s\S]*<\/footer>/i, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  assert.strictEqual(text, 'Silicon Yarra');
});

test('index.html nav links to the About Us page', () => {
  const nav = html.match(/<nav[^>]*>([\s\S]*)<\/nav>/i);
  assert.ok(nav, 'expected a <nav> element');
  assert.match(nav[1], /<a href="\/about"[^>]*>About Us<\/a>/);
});

test('index.html has a footer with the unstamped deploy time placeholder', () => {
  const footer = html.match(/<footer[^>]*>([\s\S]*)<\/footer>/i);
  assert.ok(footer, 'expected a <footer> element');
  assert.strictEqual(
    footer[1],
    'Last deployed: <time id="deployed-at" datetime="__DEPLOYED_AT__">__DEPLOYED_AT__</time>',
  );
});

test('index.html links the compiled Tailwind stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
});

function classesOf(tag) {
  const el = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`));
  assert.ok(el, `expected a class on <${tag}>`);
  return el[1].split(/\s+/);
}

test('index.html uses the light map theme', () => {
  assert.ok(classesOf('html').includes('scheme-light'), 'expected a light color scheme');
  assert.ok(!classesOf('html').includes('scheme-dark'), 'expected the dark theme to be gone');
  const classes = classesOf('body');
  assert.ok(classes.includes('bg-stone-100'), 'expected a cream background');
  assert.ok(classes.includes('text-stone-900'), 'expected dark text');
});

test('index.html body has the map artwork behind a cream gradient', () => {
  const classes = classesOf('body');
  const bg = classes.find((c) => c.startsWith('bg-[') && c.includes('url(/siliconyarra.png)'));
  assert.ok(bg, 'expected the map image as a body background');
  assert.match(bg, /^bg-\[(radial|linear)-gradient\(.*\),url\(\/siliconyarra\.png\)\]$/, 'expected a gradient layered over the image');
  for (const cls of ['bg-cover', 'bg-center']) {
    assert.ok(classes.includes(cls), `expected ${cls} on <body>`);
  }
});

test('public/siliconyarra.png is a PNG image', () => {
  const png = fs.readFileSync(path.join(__dirname, '..', 'public', 'siliconyarra.png'));
  assert.deepStrictEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test('index.html heading is red 3D block letters', () => {
  const classes = classesOf('h1');
  for (const cls of ['text-red-600', 'uppercase', 'font-black', '-rotate-6']) {
    assert.ok(classes.includes(cls), `expected ${cls} on <h1>`);
  }
  assert.ok(classes.some((c) => c.startsWith('[text-shadow:')), 'expected an extruded text-shadow on <h1>');
});

test('index.html footer is a navy band with a green border', () => {
  const classes = classesOf('footer');
  for (const cls of ['bg-blue-950', 'text-sky-100', 'border-t-4', 'border-green-600']) {
    assert.ok(classes.includes(cls), `expected ${cls} on <footer>`);
  }
});
