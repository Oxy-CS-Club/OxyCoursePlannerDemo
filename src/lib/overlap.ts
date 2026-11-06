import type { Day } from "../types";
import { toMinutes } from "./time";

export interface CalEvent {
  key: string;
  sectionId: string;
  day: Day;
  start: string;
  end: string;
}

export interface PlacedEvent extends CalEvent {
  column: number;
  columns: number;
  conflict: boolean;
}

/**
 * Lay out one day's events so overlapping ones sit side by side.
 * 1. Sort by start time.
 * 2. Group events into clusters of (transitively) overlapping intervals.
 * 3. Inside a cluster, put each event in the first free column.
 * 4. A cluster that needed more than one column is a conflict.
 */
export function layoutDay(events: CalEvent[]): PlacedEvent[] {
  const sorted = [...events].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(b.end) - toMinutes(a.end));
  const out: PlacedEvent[] = [];
  let cluster: PlacedEvent[] = [];
  let colEnds: number[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const cols = colEnds.length;
    cluster.forEach((e) => {
      e.columns = cols;
      e.conflict = cols > 1;
    });
    out.push(...cluster);
    cluster = [];
    colEnds = [];
  };

  for (const ev of sorted) {
    const s = toMinutes(ev.start);
    const e = toMinutes(ev.end);
    if (s >= clusterEnd && cluster.length) flush();
    let col = colEnds.findIndex((end) => end <= s);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(e);
    } else colEnds[col] = e;
    cluster.push({ ...ev, column: col, columns: 1, conflict: false });
    clusterEnd = Math.max(clusterEnd, e);
  }
  if (cluster.length) flush();
  return out;
}
