const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const html = fs.readFileSync(path.join(publicDir, 'events.html'), 'utf8');

const DAY = 24 * 60 * 60 * 1000;

function classesOf(tag) {
  const el = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`));
  assert.ok(el, `expected a class on <${tag}>`);
  return el[1].split(/\s+/);
}

const events = [...html.matchAll(/<li class="event">([\s\S]*?)<\/li>/g)].map(([, li]) => {
  const times = [...li.matchAll(/<time datetime="([^"]+)">/g)].map((m) => m[1]);
  const venue = li.match(/<span class="venue">([^<]+)<\/span>/);
  const rsvp = li.match(/<a href="(mailto:[^"]+)"[^>]*>RSVP<\/a>/);
  return { times, venue: venue && venue[1], rsvp: rsvp && rsvp[1] };
});

test('events.html is an HTML5 document', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
});

test('events.html has an Events title and heading', () => {
  assert.match(html, /<title>Events[^<]*<\/title>/);
  assert.match(html, /<h1[^>]*>Events<\/h1>/);
});

test('events.html lists a meetup every second Wednesday for three months', () => {
  assert.strictEqual(events.length, 7);
  const starts = events.map((e) => new Date(e.times[0]));
  for (const start of starts) {
    // Wednesday in Melbourne (all dates fall in AEDT, UTC+11).
    assert.strictEqual(new Date(start.getTime() + 11 * 60 * 60 * 1000).getUTCDay(), 3, `${start.toISOString()} is not a Wednesday`);
  }
  for (let i = 1; i < starts.length; i++) {
    assert.strictEqual(starts[i] - starts[i - 1], 14 * DAY, `expected a fortnight between meetups ${i} and ${i + 1}`);
  }
  assert.ok(starts.at(-1) - starts[0] <= 92 * DAY, 'expected the schedule to span about three months');
  assert.ok(starts.at(-1) - starts[0] >= 77 * DAY, 'expected the schedule to fill about three months');
});

test('each meetup runs from 5pm to 7pm Melbourne time', () => {
  for (const { times } of events) {
    assert.strictEqual(times.length, 2, 'expected a start and end <time>');
    assert.match(times[0], /^\d{4}-\d{2}-\d{2}T17:00\+11:00$/);
    assert.match(times[1], /^\d{4}-\d{2}-\d{2}T19:00\+11:00$/);
    assert.strictEqual(times[0].slice(0, 10), times[1].slice(0, 10));
  }
});

test('meetups rotate through four venues in order', () => {
  const venues = events.map((e) => e.venue);
  assert.ok(venues.every(Boolean), 'expected a venue for every meetup');
  assert.strictEqual(new Set(venues).size, 4);
  venues.forEach((venue, i) => assert.strictEqual(venue, venues[i % 4], `meetup ${i + 1} breaks the rotation`));
});

test('venues are in and around Cremorne', () => {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/i)[1];
  assert.match(main, /Cremorne/);
  for (const li of main.match(/<li class="event">[\s\S]*?<\/li>/g)) {
    assert.match(li, /(Cremorne|Richmond)/);
  }
});

test('every meetup has an RSVP link to events@kolchy.com', () => {
  for (const { rsvp } of events) {
    assert.ok(rsvp, 'expected an RSVP link');
    assert.match(rsvp, /^mailto:events@kolchy\.com\?subject=[^"\s]+$/);
  }
  assert.strictEqual(new Set(events.map((e) => e.rsvp)).size, events.length, 'expected a per-date RSVP subject');
});

test('events.html nav links to the other pages', () => {
  const nav = html.match(/<nav[^>]*>([\s\S]*)<\/nav>/i);
  assert.ok(nav, 'expected a <nav> element');
  assert.match(nav[1], /<a href="\/"[^>]*>Home<\/a>/);
  assert.match(nav[1], /<a href="\/about"[^>]*>About Us<\/a>/);
  assert.match(nav[1], /<a href="\/privacy"[^>]*>Privacy<\/a>/);
});

for (const file of ['index.html', 'about.html', 'privacy.html']) {
  test(`${file} nav links to the Events page`, () => {
    const page = fs.readFileSync(path.join(publicDir, file), 'utf8');
    const nav = page.match(/<nav[^>]*>([\s\S]*)<\/nav>/i);
    assert.ok(nav, 'expected a <nav> element');
    assert.match(nav[1], /<a href="\/events"[^>]*>Events<\/a>/);
  });
}

test('events.html links the compiled Tailwind stylesheet', () => {
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
});

test('events.html matches the home page theme', () => {
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
