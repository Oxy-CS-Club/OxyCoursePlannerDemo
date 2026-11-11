// Spec §3.4: drag from collections onto a weekly grid. Overlaps are placed
// side by side and highlighted, so students can compare before dropping one.
import { useMemo, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { courseCode, getCourse, locationKey, sectionTitle, sectionUnits } from "../api/catalog";
import { InstitutionBadge, QuarterBadge } from "../components/Badges";
import { CalendarActions } from "../components/CalendarActions";
import { LocationEditor } from "../components/LocationEditor";
import { buildIcs, downloadIcs, safeFilename } from "../lib/calendar";
import { QUARTER_NAMES, SECTION_BY_ID, TERM_BY_ID } from "../data/catalog";
import { layoutDay, type CalEvent } from "../lib/overlap";
import { DAY_NAMES, DAYS, fmtMeeting, fmtTime, toMinutes } from "../lib/time";
import { useApp } from "../state/AppContext";
import type { Day } from "../types";

const START_HOUR = 8;
const END_HOUR = 21;
const HOUR_PX = 52;
const PALETTE = [
  "bg-sky-100 border-sky-400 text-sky-950",
  "bg-emerald-100 border-emerald-400 text-emerald-950",
  "bg-violet-100 border-violet-400 text-violet-950",
  "bg-amber-100 border-amber-400 text-amber-950",
  "bg-pink-100 border-pink-400 text-pink-950",
  "bg-cyan-100 border-cyan-400 text-cyan-950",
  "bg-lime-100 border-lime-400 text-lime-950",
  "bg-indigo-100 border-indigo-400 text-indigo-950",
];
const DRAG_TYPE = "text/x-section-id";

export function VisualizerPage() {
  const app = useApp();
  const { data, termId, activeSchedule } = app;
  const [dragOver, setDragOver] = useState(false);
  const [openCollections, setOpenCollections] = useState<Record<string, boolean>>({});
  const term = TERM_BY_ID[termId];
  const scheduled = activeSchedule?.sectionIds ?? [];

  const colorOf = (sectionId: string) => PALETTE[scheduled.indexOf(sectionId) % PALETTE.length];

  const placedByDay = useMemo(() => {
    const byDay: Record<Day, CalEvent[]> = { M: [], T: [], W: [], R: [], F: [] };
    scheduled.forEach((sid) => {
      SECTION_BY_ID[sid]?.meetings.forEach((mt, mi) =>
        mt.days.forEach((d) => byDay[d].push({ key: `${sid}-${mi}-${d}`, sectionId: sid, day: d, start: mt.start, end: mt.end })),
      );
    });
    return Object.fromEntries(DAYS.map((d) => [d, layoutDay(byDay[d])])) as Record<Day, ReturnType<typeof layoutDay>>;
  }, [scheduled]);

  const conflicts = useMemo(() => {
    const pairs = new Map<string, Set<Day>>();
    DAYS.forEach((d) => {
      const evs = placedByDay[d];
      for (let i = 0; i < evs.length; i++)
        for (let j = i + 1; j < evs.length; j++) {
          const a = evs[i];
          const b = evs[j];
          if (a.sectionId !== b.sectionId && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)) {
            const key = [a.sectionId, b.sectionId].sort().join("|");
            if (!pairs.has(key)) pairs.set(key, new Set());
            pairs.get(key)!.add(d);
          }
        }
    });
    return [...pairs.entries()].map(([k, days]) => ({ ids: k.split("|"), days: DAYS.filter((d) => days.has(d)) }));
  }, [placedByDay]);

  const label = (sid: string) => {
    const s = SECTION_BY_ID[sid];
    return `${courseCode(getCourse(s.courseId))}-${s.sectionNo}`;
  };
  const totalUnits = scheduled.reduce((sum, sid) => sum + (SECTION_BY_ID[sid] ? sectionUnits(SECTION_BY_ID[sid]) : 0), 0);
  const hasCaltech = scheduled.some((sid) => SECTION_BY_ID[sid]?.caltechQuarter);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const sid = e.dataTransfer.getData(DRAG_TYPE);
    if (sid && SECTION_BY_ID[sid]?.termId === termId) app.addToSchedule(sid);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Schedule visualizer</h1>
          <p className="text-sm text-stone-500">{term.name} · drag courses from your collections onto the calendar</p>
        </div>
        <ScheduleBar />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Collections panel */}
        <aside className="w-full shrink-0 lg:w-64">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Your collections</h2>
          {data.collections.length === 0 && (
            <p className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">
              No collections yet. <Link to="/" className="text-orange-700 underline">Search</Link> and click ☆ Save to add courses.
            </p>
          )}
          <div className="space-y-2">
            {data.collections.map((c) => {
              const isOpen = openCollections[c.id] ?? true;
              const inTerm = c.sectionIds.filter((sid) => SECTION_BY_ID[sid]?.termId === termId);
              const otherTerm = c.sectionIds.length - inTerm.length;
              return (
                <div key={c.id} className="rounded-xl border border-stone-200 bg-white">
                  <button className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold" onClick={() => setOpenCollections((o) => ({ ...o, [c.id]: !isOpen }))}>
                    <span>{c.name}</span>
                    <span className="text-xs font-normal text-stone-400">
                      {inTerm.length} {isOpen ? "▾" : "▸"}
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="space-y-1 px-2 pb-2">
                      {inTerm.map((sid) => {
                        const s = SECTION_BY_ID[sid];
                        const course = getCourse(s.courseId);
                        const placed = scheduled.includes(sid);
                        return (
                          <li
                            key={sid}
                            draggable={!placed}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(DRAG_TYPE, sid);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${placed ? "border-stone-100 bg-stone-50 text-stone-400" : "cursor-grab border-stone-200 bg-white hover:border-orange-300 active:cursor-grabbing"}`}
                          >
                            <span aria-hidden className="text-stone-300">⠿</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                {course.institution === "Caltech" && <InstitutionBadge institution="Caltech" />}
                                <span className="font-semibold">{label(sid)}</span>
                              </div>
                              <div className="truncate">{s.meetings.map(fmtMeeting).join("; ")}</div>
                            </div>
                            <button
                              disabled={placed}
                              onClick={() => app.addToSchedule(sid)}
                              className="rounded px-1.5 text-base leading-none text-orange-700 hover:bg-orange-100 disabled:text-stone-300 disabled:hover:bg-transparent"
                              aria-label={`Add ${label(sid)} to schedule`}
                              title={placed ? "Already on the calendar" : "Add (or drag)"}
                            >
                              {placed ? "✓" : "+"}
                            </button>
                          </li>
                        );
                      })}
                      {inTerm.length === 0 && <li className="px-1 text-xs text-stone-400">Nothing for {term.name}.</li>}
                      {otherTerm > 0 && <li className="px-1 text-xs text-stone-400">+{otherTerm} from other terms (switch term to use)</li>}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Calendar */}
        <section className="min-w-0 flex-1">
          {conflicts.length > 0 && (
            <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="status">
              <b>⚠ {conflicts.length} time conflict{conflicts.length > 1 ? "s" : ""}.</b> Overlapping courses are shown side by side. Keep comparing, then remove the one you'll drop.
              <ul className="mt-1 list-inside list-disc">
                {conflicts.map((c) => (
                  <li key={c.ids.join()}>
                    {label(c.ids[0])} ↔ {label(c.ids[1])} ({c.days.map((d) => DAY_NAMES[d]).join(", ")})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasCaltech && (
            <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-2 text-xs text-orange-900">
              Includes Caltech courses. {term.name} maps to Caltech's {term.caltechQuarters.map((q) => QUARTER_NAMES[q]).join(" + ")}; quarter dates don't fully line up with Oxy's semester.
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`overflow-x-auto rounded-xl border bg-white shadow-sm ${dragOver ? "border-orange-500 ring-4 ring-orange-100" : "border-stone-200"}`}
          >
            <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "56px repeat(5, minmax(0, 1fr))" }}>
              <div className="border-b border-stone-200" />
              {DAYS.map((d) => (
                <div key={d} className="border-b border-l border-stone-200 py-2 text-center text-sm font-semibold">
                  {DAY_NAMES[d]}
                </div>
              ))}
              {/* time gutter */}
              <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
                {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                  <div key={i} className="absolute right-1 -translate-y-1/2 text-[10px] text-stone-400" style={{ top: i * HOUR_PX }}>
                    {i === 0 ? "" : fmtTime(`${START_HOUR + i}:00`)}
                  </div>
                ))}
              </div>
              {DAYS.map((d) => (
                <div key={d} className="relative border-l border-stone-200" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div key={i} className="absolute inset-x-0 border-t border-stone-100" style={{ top: i * HOUR_PX }} />
                  ))}
                  {placedByDay[d].map((ev) => {
                    const s = SECTION_BY_ID[ev.sectionId];
                    const top = ((toMinutes(ev.start) - START_HOUR * 60) / 60) * HOUR_PX;
                    const height = ((toMinutes(ev.end) - toMinutes(ev.start)) / 60) * HOUR_PX;
                    const width = 100 / ev.columns;
                    const mi = s.meetings.findIndex((x) => x.start === ev.start && x.days.includes(d));
                    const mt = s.meetings[mi];
                    const room = data.locations[locationKey(s.id, mi)];
                    return (
                      <div
                        key={ev.key}
                        className={`group absolute overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-[11px] leading-tight shadow-sm ${colorOf(ev.sectionId)} ${
                          ev.conflict ? "z-10 outline-2 outline-red-500 ring-2 ring-red-200" : ""
                        }`}
                        style={{ top, height: Math.max(height, 20), left: `calc(${ev.column * width}% + 2px)`, width: `calc(${width}% - 4px)` }}
                        title={`${label(ev.sectionId)} ${getCourse(s.courseId).title}\n${fmtTime(ev.start)}–${fmtTime(ev.end)}`}
                      >
                        {ev.conflict && <span className="float-right font-bold text-red-600">⚠</span>}
                        <div className="truncate font-semibold">{label(ev.sectionId)}</div>
                        <div className="truncate">
                          {fmtTime(ev.start)}–{fmtTime(ev.end)}
                        </div>
                        {height > 50 && <div className="truncate opacity-75">{[s.isLab ? "Lab" : mt?.kind, room].filter(Boolean).join(" · ")}</div>}
                        <button
                          onClick={() => app.removeFromSchedule(ev.sectionId)}
                          className="absolute right-0.5 bottom-0.5 hidden rounded bg-white/80 px-1 text-[10px] text-stone-700 hover:bg-white group-hover:block"
                          aria-label={`Remove ${label(ev.sectionId)}`}
                        >
                          ✕ remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {scheduled.length === 0 && (
            <p className="mt-3 text-center text-sm text-stone-500">Drag a course here from the left, or press + next to it.</p>
          )}

          {scheduled.length > 0 && (
            <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
              <div className="mb-2 font-semibold">
                On this schedule · {totalUnits} units
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-stone-50 p-2">
                <button
                  onClick={() =>
                    downloadIcs(
                      safeFilename(`${term.name}-${activeSchedule?.name ?? "schedule"}`),
                      buildIcs(scheduled.map((sid) => SECTION_BY_ID[sid]), `${term.name} · ${activeSchedule?.name ?? "Schedule"}`, data.locations),
                    )
                  }
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  ⤓ Download schedule (.ics)
                </button>
                <span className="text-xs text-stone-500">
                  Import into Apple Calendar or Google Calendar, or add classes one by one to Google Calendar below. Counts doesn't list classrooms, so add rooms below if you want them in the export. If you add a room in Google Calendar instead, choose "All events" so every week updates.
                </span>
                {conflicts.length > 0 && (
                  <span className="w-full text-xs font-medium text-red-700">⚠ This schedule still has conflicts. Every course on it will be exported, so remove the ones you'll drop first.</span>
                )}
              </div>
              <ul className="space-y-1.5">
                {scheduled.map((sid) => (
                  <li key={sid} className={`space-y-1.5 rounded-lg border-l-4 px-2 py-1.5 text-xs ${colorOf(sid)}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/course/${SECTION_BY_ID[sid].courseId}`} className="font-semibold hover:underline">
                        {label(sid)}
                      </Link>
                      <span className="opacity-75">{sectionTitle(SECTION_BY_ID[sid])}</span>
                      <QuarterBadge quarter={SECTION_BY_ID[sid].caltechQuarter} />
                      <div className="ml-auto flex items-center gap-2">
                        <CalendarActions section={SECTION_BY_ID[sid]} showIcs={false} />
                        <button onClick={() => app.removeFromSchedule(sid)} className="text-stone-500 hover:text-red-600" aria-label={`Remove ${label(sid)}`}>
                          ✕
                        </button>
                      </div>
                    </div>
                    <LocationEditor section={SECTION_BY_ID[sid]} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FinalScheduleButton() {
  const { user, data, termId, activeSchedule, setFinalSchedule } = useApp();
  const term = TERM_BY_ID[termId];
  if (!user) {
    return (
      <Link to="/login" className="rounded-lg border border-dashed border-stone-400 px-2.5 py-1.5 text-stone-500 hover:border-orange-400" title="Sign in to save a final schedule">
        ★ Sign in to save a final schedule
      </Link>
    );
  }
  if (!activeSchedule || activeSchedule.sectionIds.length === 0) return null;
  const final = data.finalSchedules[termId];
  const same = final && final.sectionIds.length === activeSchedule.sectionIds.length && final.sectionIds.every((id) => activeSchedule.sectionIds.includes(id));
  if (same) {
    return (
      <Link to="/my-courses" className="rounded-lg bg-emerald-100 px-2.5 py-1.5 font-medium text-emerald-800 hover:bg-emerald-200" title="This schedule is your final schedule. View it on My Courses.">
        Final ✓
      </Link>
    );
  }
  return (
    <button
      onClick={() => {
        if (final && !confirm(`Replace your final schedule for ${term.name} ("${final.name}") with "${activeSchedule.name}"?`)) return;
        setFinalSchedule(termId, activeSchedule);
      }}
      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-700"
    >
      ★ {final ? "Update final schedule" : "Use this as the final schedule"}
    </button>
  );
}

function ScheduleBar() {
  const { schedulesForTerm, activeSchedule, createSchedule, renameSchedule, deleteSchedule, setActiveSchedule } = useApp();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {schedulesForTerm.length > 0 && (
        <select
          aria-label="Saved schedules"
          value={activeSchedule?.id ?? ""}
          onChange={(e) => setActiveSchedule(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-2 py-1.5"
        >
          {schedulesForTerm.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={() => {
          const name = prompt("Name for the new schedule:", `Plan ${String.fromCharCode(65 + schedulesForTerm.length)}`);
          if (name !== null) createSchedule(name);
        }}
        className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 hover:border-orange-400"
      >
        + New schedule
      </button>
      {activeSchedule && (
        <>
          <button
            onClick={() => {
              const name = prompt("Rename schedule:", activeSchedule.name);
              if (name) renameSchedule(activeSchedule.id, name);
            }}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 hover:border-orange-400"
          >
            Rename
          </button>
          <button
            onClick={() => confirm(`Delete "${activeSchedule.name}"?`) && deleteSchedule(activeSchedule.id)}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-red-700 hover:border-red-400"
          >
            Delete
          </button>
        </>
      )}
      <FinalScheduleButton />
    </div>
  );
}
