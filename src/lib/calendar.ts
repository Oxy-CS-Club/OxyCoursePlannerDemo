// Calendar export without any Google API, OAuth or permissions:
//  1. "Add to Google Calendar" = a Google Calendar template URL that opens a
//     prefilled event-creation page; the user just clicks Save.
//  2. A standard .ics file (RFC 5545) for Apple Calendar, Google Calendar, Outlook…
import { CALTECH_QUARTER_DATES, COURSE_BY_ID, INSTRUCTOR_BY_ID, TERM_BY_ID } from "../data/catalog";
import type { DateSpan, Day, Meeting, Section } from "../types";

const TZ = "America/Los_Angeles";
const BYDAY: Record<Day, string> = { M: "MO", T: "TU", W: "WE", R: "TH", F: "FR" };
const JS_DAY: Record<Day, number> = { M: 1, T: 2, W: 3, R: 4, F: 5 };

// ---- date helpers (dates are "YYYY-MM-DD", computed in UTC to avoid timezone drift) ----
const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) => {
  const d = parse(isoDate);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const compact = (isoDate: string) => isoDate.replace(/-/g, "");
const localStamp = (isoDate: string, hhmm: string) => `${compact(isoDate)}T${hhmm.replace(":", "")}00`;

/** Class dates for a section: the Oxy term, or the Caltech quarter for Caltech sections. */
export function sectionDates(section: Section): { start: string; end: string; breaks: DateSpan[] } {
  const term = TERM_BY_ID[section.termId];
  const q = section.caltechQuarter ? CALTECH_QUARTER_DATES[section.termId]?.[section.caltechQuarter] : undefined;
  return q ?? { start: term.startDate, end: term.endDate, breaks: term.breaks };
}

/** First date on or after `start` that falls on one of the meeting's days. */
export function firstOccurrence(days: Day[], start: string): string {
  const wanted = new Set(days.map((d) => JS_DAY[d]));
  for (let i = 0; i < 7; i++) {
    const candidate = addDays(start, i);
    if (wanted.has(parse(candidate).getUTCDay())) return candidate;
  }
  return start;
}

/** Every class date that falls on a no-class day (used as EXDATE in the .ics). */
function breakDates(days: Day[], breaks: DateSpan[]): string[] {
  return breakDatesNamed(days, breaks).map((b) => b.date);
}

function breakDatesNamed(days: Day[], breaks: DateSpan[]): { date: string; name?: string }[] {
  const wanted = new Set(days.map((d) => JS_DAY[d]));
  const out: { date: string; name?: string }[] = [];
  breaks.forEach((b) => {
    for (let d = b.start; d <= b.end; d = addDays(d, 1)) if (wanted.has(parse(d).getUTCDay())) out.push({ date: d, name: b.name });
  });
  return out;
}

const fmtShort = (isoDate: string, weekday = true) =>
  parse(isoDate).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" } : {}) });

/** "Sep 7", "Oct 15–16", "Mar 30–Apr 2" */
function fmtSpan(b: DateSpan): string {
  if (b.start === b.end) return fmtShort(b.start, false);
  const sameMonth = b.start.slice(0, 7) === b.end.slice(0, 7);
  return `${fmtShort(b.start, false)}–${sameMonth ? Number(b.end.slice(8)) : fmtShort(b.end, false)}`;
}

/** One-line summary of a class period and its no-class days, e.g. for Fall 2026. */
export function datesSummary({ start, end, breaks }: { start: string; end: string; breaks: DateSpan[] }): string {
  const off = breaks.map((b) => `${fmtSpan(b)}${b.name ? ` (${b.name})` : ""}`).join(", ");
  return `Classes ${fmtShort(start, false)} – ${fmtShort(end, false)}${off ? ` · no class ${off}` : ""}`;
}

export const termDatesSummary = (termId: string) => {
  const t = TERM_BY_ID[termId];
  return datesSummary({ start: t.startDate, end: t.endDate, breaks: t.breaks });
};

/** RRULE UNTIL must be UTC. Using 06:59Z the next day ≈ 11:59pm Pacific on the last day. */
const until = (end: string) => `${compact(addDays(end, 1))}T065959Z`;

/** Short name for one meeting pattern of a section, e.g. "Lab" or "T". */
export const meetingName = (section: Section, meeting: Meeting) =>
  section.meetings.length > 1 ? (meeting.kind ?? meeting.days.join("")) : "";

function eventInfo(section: Section, meeting: Meeting, hasLocation: boolean) {
  const course = COURSE_BY_ID[section.courseId];
  const code = `${course.dept} ${course.number}-${section.sectionNo}`;
  const extra = meetingName(section, meeting);
  const title = `${code} ${course.title}${section.isLab ? " Lab" : ""}${extra ? ` (${extra})` : ""}`;
  const instructors = section.instructorIds.map((id) => INSTRUCTOR_BY_ID[id]?.name ?? id).join(", ");
  const lines = [course.title + (section.isLab ? " Lab" : ""), `Instructor: ${instructors}`, `CRN: ${section.crn} · ${course.institution}`];
  if (section.caltechQuarter) lines.push("Caltech course: dates follow the Caltech quarter.");
  if (!hasLocation) {
    lines.push(
      section.meetings.length > 1
        ? "Room: add it in this event and choose \"All events\" so every week updates. This class's other meeting time is a separate event and needs its own room."
        : "Room: add it in this event and choose \"All events\" so every week updates.",
    );
  }
  return { code, title, lines };
}

// ---- 1. Google Calendar template link ----
/** `location` is only what the student typed in on our site; counts lists no rooms. */
export function googleCalendarUrl(section: Section, meeting: Meeting, location?: string): string {
  const { start, end, breaks } = sectionDates(section);
  const first = firstOccurrence(meeting.days, start);
  const { title, lines } = eventInfo(section, meeting, Boolean(location));
  // A Google template link can't skip dates, so list this class's no-class days explicitly.
  const skipped = breakDatesNamed(meeting.days, breaks);
  if (skipped.length) {
    lines.push(
      `No class on: ${skipped.map((b) => `${fmtShort(b.date)}${b.name ? ` (${b.name})` : ""}`).join(", ")}. Delete these dates from the series, or use the .ics download, which skips them automatically.`,
    );
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${localStamp(first, meeting.start)}/${localStamp(first, meeting.end)}`,
    ctz: TZ,
    ...(location ? { location } : {}),
    details: lines.join("\n"),
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${meeting.days.map((d) => BYDAY[d]).join(",")};UNTIL=${until(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ---- 2. .ics file ----
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold long lines (RFC 5545: max 75 octets; continuation lines start with a space). */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 70) {
    parts.push(rest.slice(0, 70));
    rest = rest.slice(70);
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZ}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0800",
  "TZOFFSETTO:-0700",
  "TZNAME:PDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0700",
  "TZOFFSETTO:-0800",
  "TZNAME:PST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** `locations` maps "<sectionId>#<meetingIndex>" to a room the student typed in. */
export function buildIcs(sections: Section[], calendarName = "Oxy Course Planner", locations: Record<string, string> = {}): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Oxy CS Club//Oxy Course Planner Demo//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapeText(calendarName)}`, `X-WR-TIMEZONE:${TZ}`, ...VTIMEZONE];
  sections.forEach((section) => {
    const { start, end, breaks } = sectionDates(section);
    section.meetings.forEach((meeting, i) => {
      const first = firstOccurrence(meeting.days, start);
      const location = locations[`${section.id}#${i}`];
      const { title, lines: desc } = eventInfo(section, meeting, Boolean(location));
      const ex = breakDates(meeting.days, breaks).map((d) => localStamp(d, meeting.start));
      lines.push(
        "BEGIN:VEVENT",
        `UID:${section.id}-${i}@oxy-course-planner-demo`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${TZ}:${localStamp(first, meeting.start)}`,
        `DTEND;TZID=${TZ}:${localStamp(first, meeting.end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${meeting.days.map((d) => BYDAY[d]).join(",")};UNTIL=${until(end)}`,
        ...(ex.length ? [`EXDATE;TZID=${TZ}:${ex.join(",")}`] : []),
        `SUMMARY:${escapeText(title)}`,
        ...(location ? [`LOCATION:${escapeText(location)}`] : []),
        `DESCRIPTION:${escapeText(desc.join("\n"))}`,
        "END:VEVENT",
      );
    });
  });
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const safeFilename = (s: string) => s.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
