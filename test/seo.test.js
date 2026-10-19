const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const pages = fs
  .readdirSync(publicDir)
  .filter((f) => f.endsWith('.html'))
  .map((file) => ({ file, html: fs.readFileSync(path.join(publicDir, file), 'utf8') }));

function head(html) {
  const el = html.match(/<head>([\s\S]*)<\/head>/i);
  assert.ok(el, 'expected a <head> element');
  return el[1];
}

function meta(html, attr, name) {
  const el = head(html).match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)">`));
  return el && el[1];
}

function title(html) {
  const el = head(html).match(/<title>([^<]*)<\/title>/);
  return el && el[1];
}

test('there are HTML pages to check', () => {
  assert.ok(pages.length >= 3, 'expected at least the home, About Us and Privacy pages');
});

for (const { file, html } of pages) {
  test(`${file} declares language, charset and viewport`, () => {
    assert.match(html, /<html lang="en"/);
    assert.match(head(html), /<meta charset="utf-8">/);
    assert.match(head(html), /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  });

  test(`${file} has a concise title`, () => {
    const t = title(html);
    assert.ok(t, 'expected a <title>');
    assert.ok(t.length > 0 && t.length <= 60, `expected a title of 1-60 characters, got ${t.length}`);
  });

  test(`${file} has a meta description of a sensible length`, () => {
    const d = meta(html, 'name', 'description');
    assert.ok(d, 'expected a meta description');
    assert.ok(d.length >= 50 && d.length <= 160, `expected 50-160 characters, got ${d.length}`);
  });

  test(`${file} has exactly one h1`, () => {
    assert.strictEqual((html.match(/<h1[\s>]/g) || []).length, 1);
  });

  test(`${file} has Open Graph and Twitter card tags`, () => {
    assert.strictEqual(meta(html, 'property', 'og:title'), title(html));
    assert.strictEqual(meta(html, 'property', 'og:description'), meta(html, 'name', 'description'));
    assert.strictEqual(meta(html, 'property', 'og:type'), 'website');
    assert.strictEqual(meta(html, 'property', 'og:site_name'), 'Silicon Yarra');
    assert.strictEqual(meta(html, 'property', 'og:locale'), 'en_AU');
    assert.strictEqual(meta(html, 'name', 'twitter:card'), 'summary');
  });

  test(`${file} sets a theme colour`, () => {
    assert.match(meta(html, 'name', 'theme-color') || '', /^#[0-9a-f]{6}$/i);
  });
}

test('titles and meta descriptions are unique across pages', () => {
  const titles = pages.map(({ html }) => title(html));
  const descriptions = pages.map(({ html }) => meta(html, 'name', 'description'));
  assert.strictEqual(new Set(titles).size, pages.length, 'expected unique titles');
  assert.strictEqual(new Set(descriptions).size, pages.length, 'expected unique descriptions');
});

test('robots.txt allows all crawlers', () => {
  const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8');
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m);
});
