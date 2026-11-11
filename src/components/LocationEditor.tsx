// counts.oxy.edu lists no rooms, so students can type one in for each meeting time.
// Each meeting time is its own calendar event, so a lab or extra session under the
// same CRN keeps its own room and is never overwritten by the lecture's room.
import { useEffect, useState } from "react";
import { locationKey } from "../api/catalog";
import { meetingName } from "../lib/calendar";
import { fmtMeeting } from "../lib/time";
import { useApp } from "../state/AppContext";
import type { Section } from "../types";

export function LocationEditor({ section }: { section: Section }) {
  return (
    <div className="space-y-1">
      {section.meetings.map((m, i) => (
        <LocationField key={i} section={section} index={i} label={section.meetings.length > 1 ? `${meetingName(section, m)} · ${fmtMeeting(m)}` : fmtMeeting(m)} />
      ))}
    </div>
  );
}

function LocationField({ section, index, label }: { section: Section; index: number; label: string }) {
  const { data, setLocation } = useApp();
  const key = locationKey(section.id, index);
  const saved = data.locations[key] ?? "";
  const [value, setValue] = useState(saved);
  useEffect(() => setValue(saved), [saved]);
  return (
    <label className="flex flex-wrap items-center gap-2 text-xs">
      <span className="min-w-28 text-stone-500">{label}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value !== saved && setLocation(key, value)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        placeholder="Add room, e.g. Fowler 112"
        className="w-44 rounded-md border border-stone-300 bg-white px-2 py-1 outline-none focus:border-orange-500"
        aria-label={`Room for ${label}`}
      />
      {saved && <span className="text-emerald-600">✓ used in calendar export</span>}
    </label>
  );
}
