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
  const footer = html.match(/<footer>([\s\S]*)<\/footer>/i);
  assert.ok(footer, 'expected a <footer> element');
  assert.strictEqual(
    footer[1],
    'Last deployed: <time id="deployed-at" datetime="__DEPLOYED_AT__">__DEPLOYED_AT__</time>',
  );
});
