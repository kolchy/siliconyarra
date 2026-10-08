// Run by wrangler's build step: writes the deploy time into the footer.
const fs = require('node:fs');
const path = require('node:path');

const TIME_ELEMENT = /<time id="deployed-at" datetime="[^"]*">[^<]*<\/time>/;

const formatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
});

function formatMelbourne(date) {
  const p = Object.fromEntries(formatter.formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} ${p.dayPeriod.toLowerCase()} ${p.timeZoneName}`;
}

function stamp(html, date) {
  if (!TIME_ELEMENT.test(html)) {
    throw new Error('deployed-at <time> element not found');
  }
  const iso = date.toISOString();
  return html.replace(TIME_ELEMENT, `<time id="deployed-at" datetime="${iso}">${formatMelbourne(date)}</time>`);
}

if (require.main === module) {
  const file = process.argv[2] || path.join(__dirname, '..', 'public', 'index.html');
  fs.writeFileSync(file, stamp(fs.readFileSync(file, 'utf8'), new Date()));
  console.log(`Stamped deploy time in ${file}`);
}

module.exports = { stamp, formatMelbourne };
