// My Courses: courses that are settled — past courses from your history, plus the
// final schedule you chose in the visualizer for each planning term (overwritable).
import { Link, Navigate } from "react-router-dom";
import { courseCode, getCourse, instructorNames, sectionLabel, sectionTitle, sectionUnits } from "../api/catalog";
import { CoreBadge, InstitutionBadge, QuarterBadge } from "../components/Badges";
import { CalendarActions } from "../components/CalendarActions";
import { LocationEditor } from "../components/LocationEditor";
import { HISTORY_TERMS, SECTION_BY_ID, TERMS } from "../data/catalog";
import { buildIcs, downloadIcs, safeFilename } from "../lib/calendar";
import { useApp } from "../state/AppContext";

export function MyCoursesPage() {
  const { user, data, removeFinalSchedule } = useApp();
  if (!user) return <Navigate to="/login" replace />;

  const finals = TERMS.filter((t) => data.finalSchedules[t.id]);
  const historyByTerm = HISTORY_TERMS.map((t) => ({ term: t, items: data.profile.history.filter((h) => h.termId === t.id) }))
    .filter((g) => g.items.length > 0)
    .reverse();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">My Courses</h1>
      <p className="mb-5 text-sm text-stone-500">Your settled courses: the final schedule for each term you're planning, and the courses you've already taken.</p>

      <h2 className="mb-2 text-lg font-semibold">Final schedules</h2>
      {finals.length === 0 && (
        <p className="mb-6 rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          No final schedule yet. In the <Link to="/visualizer" className="text-orange-700 underline">Visualizer</Link>, click <b>Use this as the final schedule</b>.
        </p>
      )}
      <div className="mb-8 space-y-4">
        {finals.map((t) => {
          const f = data.finalSchedules[t.id];
          const sections = f.sectionIds.map((id) => SECTION_BY_ID[id]).filter(Boolean);
          const units = sections.reduce((n, s) => n + sectionUnits(s), 0);
          return (
            <section key={t.id} className="rounded-xl border border-stone-200 bg-white shadow-sm">
              <header className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-4 py-3">
                <h3 className="font-semibold">
                  {t.name} <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Final ✓</span>
                </h3>
                <span className="text-xs text-stone-500">
                  from "{f.name}" · {units} units · saved {new Date(f.finalizedAt).toLocaleString()}
                </span>
                <div className="ml-auto flex gap-2 text-sm">
                  <button
                    onClick={() => downloadIcs(safeFilename(`${t.name}-final`), buildIcs(sections, `${t.name} · Final`, data.locations))}
                    className="rounded-lg bg-stone-900 px-3 py-1.5 font-semibold text-white hover:bg-stone-700"
                  >
                    ⤓ Download (.ics)
                  </button>
                  <button onClick={() => confirm(`Remove your final schedule for ${t.name}?`) && removeFinalSchedule(t.id)} className="text-red-700 hover:text-red-900">
                    Remove
                  </button>
                </div>
              </header>
              <p className="px-4 pt-3 text-xs text-stone-500">
                Counts doesn't list classrooms. Add a room below to include it in exports, or add it later in Google Calendar and choose "All events" so every week updates.
              </p>
              <ul className="divide-y divide-stone-100">
                {sections.map((s) => {
                  const c = getCourse(s.courseId);
                  return (
                    <li key={s.id} className="space-y-2 px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <InstitutionBadge institution={c.institution} />
                        <Link to={`/course/${c.id}`} className="font-semibold hover:underline">
                          {sectionLabel(s)}
                        </Link>
                        <span>{sectionTitle(s)}</span>
                        <QuarterBadge quarter={s.caltechQuarter} />
                        <span className="text-xs text-stone-500">
                          {instructorNames(s)} · CRN {s.crn}
                        </span>
                      </div>
                      <LocationEditor section={s} />
                      <CalendarActions section={s} showIcs={false} />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <h2 className="mb-2 text-lg font-semibold">Past courses</h2>
      {historyByTerm.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          No past courses yet. Add them on your <Link to="/profile" className="text-orange-700 underline">Profile</Link>.
        </p>
      ) : (
        <div className="space-y-3">
          {historyByTerm.map(({ term, items }) => (
            <section key={term.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">{term.name}</h3>
              <ul className="space-y-1">
                {items.map((h) => {
                  const c = getCourse(h.courseId);
                  return (
                    <li key={h.courseId} className="flex flex-wrap items-center gap-2 text-sm">
                      <InstitutionBadge institution={c.institution} />
                      <span className="font-medium">{courseCode(c)}</span>
                      <span className="text-stone-600">{c.title}</span>
                      {c.cores.map((k) => (
                        <CoreBadge key={k} code={k} />
                      ))}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
