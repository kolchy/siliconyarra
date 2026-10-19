const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'privacy.html'), 'utf8');

function classesOf(tag) {
  const el = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`));
  assert.ok(el, `expected a class on <${tag}>`);
  return el[1].split(/\s+/);
}

test('privacy.html is an HTML5 document', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
});

test('privacy.html has a Privacy Statement title and heading', () => {
  assert.match(html, /<title>Privacy Statement[^<]*<\/title>/);
  assert.match(html, /<h1[^>]*>Privacy Statement<\/h1>/);
});

test('privacy.html covers Australian privacy law', () => {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/i);
  assert.ok(main, 'expected a <main> element');
  assert.match(main[1], /Privacy Act 1988 \(Cth\)/);
  assert.match(main[1], /Australian Privacy Principles/);
  assert.match(main[1], /<h2[^>]*>Access and correction<\/h2>/);
  assert.match(main[1], /<h2[^>]*>Complaints<\/h2>/);
  assert.match(main[1], /Office of the Australian Information Commissioner/);
  assert.match(main[1], /<a href="https:\/\/www\.oaic\.gov\.au"/);
  assert.doesNotMatch(main[1], /lorem ipsum/i);
});

test('privacy.html nav links to the home and About Us pages', () => {
  const nav = html.match(/<nav[^>]*>([\s\S]*)<\/nav>/i);
  assert.ok(nav, 'expected a <nav> element');
  assert.match(nav[1], /<a href="\/"[^>]*>Home<\/a>/);
  assert.match(nav[1], /<a href="\/about"[^>]*>About Us<\/a>/);
});

test('privacy.html links the compiled Tailwind stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
});

test('privacy.html matches the home page theme', () => {
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
