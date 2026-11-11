// "Add to Google Calendar" (prefilled template link, new tab) + "Download .ics" for one section.
// Rooms come only from what the student typed in on our site (counts lists no rooms).
import { locationKey, sectionLabel } from "../api/catalog";
import { buildIcs, downloadIcs, googleCalendarUrl, meetingName, safeFilename } from "../lib/calendar";
import { useApp } from "../state/AppContext";
import type { Section } from "../types";

export function CalendarActions({ section, showIcs = true }: { section: Section; showIcs?: boolean }) {
  const { data } = useApp();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {section.meetings.map((m, i) => {
        const name = meetingName(section, m);
        return (
          <a
            key={i}
            href={googleCalendarUrl(section, m, data.locations[locationKey(section.id, i)])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:border-blue-400 hover:text-blue-700"
            title="Opens Google Calendar in a new tab with this class prefilled. Click Save there."
          >
            <span aria-hidden>📅</span>
            {`Add ${name ? `${name} ` : ""}to Google Calendar`}
          </a>
        );
      })}
      {showIcs && (
        <button
          onClick={() => downloadIcs(safeFilename(`${sectionLabel(section)}-${section.termId}`), buildIcs([section], sectionLabel(section), data.locations))}
          className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:border-orange-400 hover:text-orange-700"
          title="Download a calendar file for Apple Calendar, Google Calendar or Outlook"
        >
          ⤓ .ics
        </button>
      )}
    </div>
  );
}
