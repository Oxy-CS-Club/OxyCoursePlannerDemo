import type { Day, Meeting } from "../types";

export const DAYS: Day[] = ["M", "T", "W", "R", "F"];
export const DAY_NAMES: Record<Day, string> = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${suffix}`;
};

export const fmtMeeting = (mt: Meeting) =>
  `${mt.days.join("")} ${fmtTime(mt.start)}–${fmtTime(mt.end)}${mt.kind ? ` (${mt.kind})` : ""}`;
