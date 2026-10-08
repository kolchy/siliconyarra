const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'about.html'), 'utf8');

function classesOf(tag) {
  const el = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`));
  assert.ok(el, `expected a class on <${tag}>`);
  return el[1].split(/\s+/);
}

test('about.html is an HTML5 document', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
});

test('about.html has an About Us title and heading', () => {
  assert.match(html, /<title>About Us[^<]*<\/title>/);
  assert.match(html, /<h1[^>]*>About Us<\/h1>/);
});

test('about.html tells a brief history of house music', () => {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/i);
  assert.ok(main, 'expected a <main> element');
  assert.match(main[1], /<p>[^<]*house music[^<]*<\/p>/i);
  assert.match(main[1], /Chicago/);
  assert.doesNotMatch(main[1], /lorem ipsum/i);
});

test('about.html nav links back to the home page', () => {
  const nav = html.match(/<nav[^>]*>([\s\S]*)<\/nav>/i);
  assert.ok(nav, 'expected a <nav> element');
  assert.match(nav[1], /<a href="\/"[^>]*>Home<\/a>/);
});

test('about.html links the compiled Tailwind stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
});

test('about.html matches the home page theme', () => {
  assert.ok(classesOf('html').includes('scheme-light'), 'expected a light color scheme');
  const body = classesOf('body');
  assert.ok(body.some((c) => c.startsWith('bg-[') && c.includes('url(/siliconyarra.png)')), 'expected the map background');
  for (const cls of ['text-red-600', 'uppercase', 'font-black']) {
    assert.ok(classesOf('h1').includes(cls), `expected ${cls} on <h1>`);
  }
  for (const cls of ['bg-blue-950', 'text-sky-100', 'border-t-4', 'border-green-600']) {
    assert.ok(classesOf('footer').includes(cls), `expected ${cls} on <footer>`);
  }
});
