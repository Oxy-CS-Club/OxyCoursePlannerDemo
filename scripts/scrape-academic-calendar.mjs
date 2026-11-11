// Scrapes Oxy's official academic calendar (one HTML table per term on the
// catalog site) into src/data/academic-calendar.json.
//
// Workflow: run this script → review the JSON diff → commit it in a PR.
// The app only reads the committed JSON; it never scrapes at runtime.
//
// Run inside a throwaway container (nothing is installed on the host):
//   docker run --rm -v "$PWD":/app -w /app node:22.12.0-alpine node scripts/scrape-academic-calendar.mjs
import { writeFile } from "node:fs/promises";

const TERMS = [
  { termId: "SP26", catalogYear: "2025-2026", slug: "spring-2026", year: 2026 },
  { termId: "FA26", catalogYear: "2026-2027", slug: "fall-2026", year: 2026 },
  { termId: "SP27", catalogYear: "2026-2027", slug: "spring-2027", year: 2027 },
];
const OUT = new URL("../src/data/academic-calendar.json", import.meta.url);
const urlFor = (t) => `https://oxy.smartcatalogiq.com/en/${t.catalogYear}/catalog/academic-calendar/${t.slug}`;

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const WEEKDAYS = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 };

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;|&mdash;|&#8211;/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const weekday = (isoDate) => new Date(`${isoDate}T00:00:00Z`).getUTCDay();

/** "Aug. 25", "Oct.15 - 16", "Mar. 30 - Apr. 2", "April 28" → { start, end } */
function parseDate(text, year) {
  const t = text.replace(/\./g, ". ").replace(/\s+/g, " ").trim();
  const m = t.match(/^([A-Za-z]+)\.?\s*(\d{1,2})(?:\s*-\s*(?:([A-Za-z]+)\.?\s*)?(\d{1,2}))?/);
  if (!m) throw new Error(`Unrecognized date: "${text}"`);
  const m1 = MONTHS[m[1].slice(0, 3).toLowerCase()];
  const m2 = m[3] ? MONTHS[m[3].slice(0, 3).toLowerCase()] : m1;
  if (!m1 || !m2) throw new Error(`Unrecognized month in: "${text}"`);
  const start = iso(year, m1, Number(m[2]));
  return { start, end: m[4] ? iso(year, m2, Number(m[4])) : start };
}

/** Cross-check against the Day column ("Tuesday", "Thurs - Fri"). */
function checkWeekdays(dayText, { start, end }, context) {
  const parts = dayText.split("-").map((p) => p.trim().slice(0, 2).toLowerCase());
  const expectStart = WEEKDAYS[parts[0]];
  const expectEnd = WEEKDAYS[parts[parts.length - 1]];
  if (expectStart === undefined) return; // no weekday given
  if (weekday(start) !== expectStart || weekday(end) !== expectEnd) {
    throw new Error(`Weekday mismatch for ${context}: "${dayText}" vs ${start}..${end}`);
  }
}

async function scrapeTerm(t) {
  const url = urlFor(t);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; OxyCoursePlannerDemo/0.1)" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const html = await res.text();
  const table = html.match(/<table[\s\S]*?<\/table>/i)?.[0];
  if (!table) throw new Error(`No table found at ${url}`);

  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => decode(c[1])))
    .filter((cells) => cells.length >= 3 && cells[0] !== "Event");

  let firstDay = null;
  let lastDay = null;
  const holidays = [];
  for (const [event, day, date] of rows) {
    const span = parseDate(date, t.year);
    checkWeekdays(day, span, `${t.termId} "${event}"`);
    if (/^first day of classes/i.test(event)) firstDay = span.start;
    else if (/^last day of classes/i.test(event)) lastDay = span.start;
    else if (/no classes|holiday/i.test(event)) {
      const name = event.replace(/\s*-+\s*no classes/i, "").replace(/\s+holiday$/i, "").trim();
      holidays.push({ ...span, name });
    }
  }
  if (!firstDay || !lastDay) throw new Error(`${t.termId}: missing first or last day of classes`);
  if (firstDay >= lastDay) throw new Error(`${t.termId}: first day ${firstDay} is not before last day ${lastDay}`);

  // Only no-class days inside the class period matter for calendar events.
  const noClass = holidays
    .filter((h) => h.end >= firstDay && h.start <= lastDay)
    .map((h) => ({ start: h.start < firstDay ? firstDay : h.start, end: h.end > lastDay ? lastDay : h.end, name: h.name }));
  const skipped = holidays.filter((h) => !noClass.some((n) => n.name === h.name));
  return { source: url, firstDay, lastDay, noClass, ...(skipped.length ? { outsideClassPeriod: skipped.map((h) => `${h.name} (${h.start})`) } : {}) };
}

const out = { generatedAt: new Date().toISOString().slice(0, 10), terms: {} };
for (const t of TERMS) {
  out.terms[t.termId] = await scrapeTerm(t);
  const r = out.terms[t.termId];
  console.log(`${t.termId}: classes ${r.firstDay} → ${r.lastDay}; no class: ${r.noClass.map((n) => `${n.name} ${n.start}${n.end !== n.start ? `..${n.end}` : ""}`).join(", ")}`);
}
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${OUT.pathname}. Review the diff before committing.`);
