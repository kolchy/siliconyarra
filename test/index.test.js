const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('index.html is an HTML5 document', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
});

test('index.html body shows only "Silicon Yarra"', () => {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  assert.ok(body, 'expected a <body> element');
  const text = body[1].replace(/<[^>]*>/g, '').trim();
  assert.strictEqual(text, 'Silicon Yarra');
});
