const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { stamp, formatMelbourne } = require('../scripts/stamp-deploy-time');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'stamp-deploy-time.js');
const template = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');

test('formats Melbourne daylight saving time (AEDT)', () => {
  assert.strictEqual(formatMelbourne(new Date('2026-10-08T05:34:00Z')), '8 October 2026, 4:34 pm AEDT');
});

test('formats Melbourne standard time (AEST)', () => {
  assert.strictEqual(formatMelbourne(new Date('2026-07-01T00:05:00Z')), '1 July 2026, 10:05 am AEST');
});

test('stamp writes ISO datetime and Melbourne text', () => {
  const out = stamp(template, new Date('2026-10-08T05:34:00Z'));
  assert.match(
    out,
    /<time id="deployed-at" datetime="2026-10-08T05:34:00.000Z">8 October 2026, 4:34 pm AEDT<\/time>/,
  );
  assert.doesNotMatch(out, /__DEPLOYED_AT__/);
});

test('stamp can be re-run on an already stamped file', () => {
  const once = stamp(template, new Date('2026-10-08T05:34:00Z'));
  const twice = stamp(once, new Date('2026-07-01T00:05:00Z'));
  assert.match(twice, /datetime="2026-07-01T00:05:00.000Z">1 July 2026, 10:05 am AEST</);
  assert.doesNotMatch(twice, /2026-10-08/);
});

test('stamp throws when the time element is missing', () => {
  assert.throws(() => stamp('<html></html>', new Date()), /not found/);
});

test('script stamps a file in place', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stamp-'));
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, template);
  try {
    execFileSync(process.execPath, [script, file]);
    const out = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(out, /__DEPLOYED_AT__/);
    const iso = out.match(/datetime="([^"]+)"/)[1];
    assert.ok(Math.abs(Date.now() - Date.parse(iso)) < 60_000, 'expected a current timestamp');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('wrangler.jsonc runs the stamp script as its build command', () => {
  const config = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
  assert.match(config, /"build":\s*\{\s*"command":\s*"node scripts\/stamp-deploy-time\.js"\s*\}/);
});
