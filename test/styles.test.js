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
  for (const selector of ['.bg-zinc-950', '.text-zinc-100', '.text-zinc-400', '.bg-linear-to-r', '.min-h-screen']) {
    assert.ok(css.includes(selector), `expected ${selector} in styles.css`);
  }
  assert.match(css, /color-scheme:\s*dark/);
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
