// Shows the class period and no-class days that calendar exports use,
// taken from Oxy's official academic calendar.
import { TERM_BY_ID } from "../data/catalog";
import { termDatesSummary } from "../lib/calendar";

export function TermDatesNote({ termId, hasCaltech }: { termId: string; hasCaltech?: boolean }) {
  const term = TERM_BY_ID[termId];
  return (
    <p className="text-xs text-stone-500">
      <span className="font-medium text-stone-700">{term.name}:</span> {termDatesSummary(termId)}.{" "}
      <a href={term.calendarSource} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline">
        Official academic calendar ↗
      </a>
      {hasCaltech && " Caltech courses follow Caltech's quarter dates."}
    </p>
  );
}
