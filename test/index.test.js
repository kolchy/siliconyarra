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
  const text = body[1].replace(/<footer[\s\S]*<\/footer>/i, '').replace(/<[^>]*>/g, '').trim();
  assert.strictEqual(text, 'Silicon Yarra');
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

test('index.html uses the dark theme', () => {
  assert.match(html, /<html[^>]*class="[^"]*\bscheme-dark\b[^"]*"/);
  const body = html.match(/<body[^>]*class="([^"]*)"/);
  assert.ok(body, 'expected a class on <body>');
  const classes = body[1].split(/\s+/);
  assert.ok(classes.includes('bg-zinc-950'), 'expected a dark background');
  assert.ok(classes.includes('text-zinc-100'), 'expected light text');
});
