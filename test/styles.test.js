const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const cssPath = path.join(root, 'public', 'styles.css');

test('public/styles.css contains the utilities the page uses', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  for (const selector of [
    '.bg-stone-100',
    '.text-stone-900',
    '.text-red-600',
    '.uppercase',
    '.-rotate-6',
    '.bg-blue-950',
    '.text-sky-100',
    '.border-green-600',
    '.min-h-screen',
    '.bg-cover',
    '.bg-center',
  ]) {
    assert.ok(css.includes(selector), `expected ${selector} in styles.css`);
  }
  assert.match(css, /color-scheme:\s*light/);
  assert.match(css, /text-shadow:[^}]*#7f1d1d/);
  assert.match(css, /font-family:Impact/);
  assert.match(css, /background-image:radial-gradient\([^}]*\),url\(\/siliconyarra\.png\)/);
});

test('public/styles.css is up to date with `npm run build:css`', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'css-'));
  const out = path.join(dir, 'styles.css');
  try {
    const pkg = require.resolve('@tailwindcss/cli/package.json', { paths: [root] });
    const bin = path.join(path.dirname(pkg), require(pkg).bin.tailwindcss);
    execFileSync(process.execPath, [bin, '-i', 'src/styles.css', '-o', out, '--minify'], { cwd: root, stdio: 'ignore' });
    assert.strictEqual(
      fs.readFileSync(cssPath, 'utf8'),
      fs.readFileSync(out, 'utf8'),
      'public/styles.css is stale; run `npm run build:css`',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
