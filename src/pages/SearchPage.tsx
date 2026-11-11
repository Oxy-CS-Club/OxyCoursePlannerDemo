// Spec §3.1: term + department (incl. FYS subject) + up to 2 Cores (AND) + professor + keyword + institution.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { courseCode, hasTimeFilter, instructorNames, listDepartments, listInstructors, searchSections, sectionTitle, sectionUnits } from "../api/catalog";
import { CoreBadge, InstitutionBadge, QuarterBadge, TagBadge } from "../components/Badges";
import { Combobox, type Option } from "../components/Combobox";
import { FavoriteButton } from "../components/FavoriteButton";
import { TERM_BY_ID } from "../data/catalog";
import { CORES } from "../data/cores";
import { DAY_NAMES, DAYS, fmtMeeting, fmtTime } from "../lib/time";
import { useApp } from "../state/AppContext";
import type { CoreCode, Day, Institution } from "../types";

// Time picker options: every 30 minutes, 7:00am–10:00pm. Hint shows 24h time so "14" also matches.
const TIME_OPTIONS: Option[] = Array.from({ length: 31 }, (_, i) => {
  const mins = 7 * 60 + i * 30;
  const v = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  return { value: v, label: fmtTime(v), hint: v };
});

const TAG_LABEL = { fys: "First-Year Seminar", "junior-seminar": "Junior seminar", "senior-seminar": "Senior seminar" } as const;

export function SearchPage() {
  const { termId } = useApp();
  const [dept, setDept] = useState<string | null>(null);
  const [core1, setCore1] = useState<string | null>(null);
  const [core2, setCore2] = useState<string | null>(null);
  const [prof, setProf] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [institution, setInstitution] = useState<Institution | "All">("All");
  const [days, setDays] = useState<Day[]>([]);
  const [timeFrom, setTimeFrom] = useState<string | null>(null);
  const [timeTo, setTimeTo] = useState<string | null>(null);
  const [timeMode, setTimeMode] = useState<"inside" | "overlap">("inside");

  const deptOptions: Option[] = useMemo(
    () =>
      listDepartments()
        .filter((d) => institution === "All" || d.institution === institution)
        .map((d) => ({ value: d.code, label: d.isSubject ? `${d.name} (FYS)` : `${d.name} (${d.code})`, hint: d.institution, group: d.institution === "Oxy" ? "Occidental" : "Caltech" })),
    [institution],
  );
  const coreOptions: Option[] = CORES.map((c) => ({ value: c.code, label: c.name, hint: c.group ?? "" }));
  const profOptions: Option[] = listInstructors().map((i) => ({ value: i.id, label: i.name, hint: i.institution }));

  const cores = [core1, core2].filter(Boolean) as CoreCode[];
  const results = searchSections({ termId, dept, cores, instructorId: prof, keyword, institution, days, timeFrom, timeTo, timeMode });
  const timeActive = hasTimeFilter({ days, timeFrom, timeTo });
  // The school toggle only narrows a search; on its own it doesn't count as one.
  const anyFilter = Boolean(dept || cores.length || prof || keyword.trim() || timeActive);
  const toOptions = timeFrom ? TIME_OPTIONS.filter((o) => o.value > timeFrom) : TIME_OPTIONS;
  const fromOptions = timeTo ? TIME_OPTIONS.filter((o) => o.value < timeTo) : TIME_OPTIONS;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Search courses</h1>
          <p className="text-sm text-stone-500">
            {TERM_BY_ID[termId].name} · change the term in the top bar
          </p>
        </div>
        <div className="flex rounded-lg border border-stone-300 bg-white p-0.5 text-sm" role="group" aria-label="Institution">
          {(["All", "Oxy", "Caltech"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setInstitution(v);
                setDept(null);
              }}
              className={`rounded-md px-3 py-1 ${institution === v ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
            >
              {v === "All" ? "Oxy + Caltech" : v}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="kw">
            Keyword
          </label>
          <input
            id="kw"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="e.g. COMP 131, calculus"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Combobox label="Department / subject" options={deptOptions} value={dept} onChange={setDept} placeholder="e.g. First-Year Seminar" />
        <Combobox label="Core 1" options={coreOptions} value={core1} onChange={setCore1} placeholder="Any Core" disabledValues={core2 ? [core2] : []} />
        <Combobox label="Core 2 (must match both)" options={coreOptions} value={core2} onChange={setCore2} placeholder="Optional 2nd Core" disabledValues={core1 ? [core1] : []} />
        <Combobox label="Professor" options={profOptions} value={prof} onChange={setProf} placeholder='Try "hern" or "chen"' />

        {/* Search by time */}
        <div className="flex flex-wrap items-end gap-3 border-t border-stone-100 pt-3 sm:col-span-2 lg:col-span-5">
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Time · days</span>
            <div className="flex gap-1" role="group" aria-label="Days">
              {DAYS.map((d) => {
                const on = days.includes(d);
                return (
                  <button
                    key={d}
                    aria-pressed={on}
                    onClick={() => setDays(on ? days.filter((x) => x !== d) : DAYS.filter((x) => x === d || days.includes(x)))}
                    className={`w-11 rounded-lg border py-2 text-sm ${on ? "border-orange-500 bg-orange-600 text-white" : "border-stone-300 bg-white hover:border-orange-400"}`}
                  >
                    {DAY_NAMES[d]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-36">
            <Combobox label="From" options={fromOptions} value={timeFrom} onChange={setTimeFrom} placeholder="Any time" />
          </div>
          <div className="w-36">
            <Combobox label="To" options={toOptions} value={timeTo} onChange={setTimeTo} placeholder="Any time" />
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Match</span>
            <div className="flex rounded-lg border border-stone-300 bg-white p-0.5 text-sm" role="group" aria-label="Time match mode">
              {(
                [
                  ["inside", "Fully inside"],
                  ["overlap", "Overlaps"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={timeMode === v}
                  onClick={() => setTimeMode(v)}
                  title={v === "inside" ? "Every meeting is on the chosen days and within the time window" : "At least one meeting touches the time window on a chosen day"}
                  className={`rounded-md px-3 py-1.5 ${timeMode === v ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="pb-2 text-xs text-stone-400">
            {timeMode === "inside" ? "Shows classes that fit entirely in the days and hours you pick." : "Shows classes that meet at least partly in the days and hours you pick."}
          </p>
        </div>
      </div>

      {/* Nothing is listed until the user sets at least one search condition. */}
      {!anyFilter ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          <p className="font-medium text-stone-700">Start a search to see courses</p>
          <p className="mt-1 text-sm">Type a keyword, or pick a department, a Core, a professor, or a time above.</p>
        </div>
      ) : (
      <>
      <div className="mb-2 flex items-center justify-between text-sm text-stone-500">
        <span>
          {results.length} section{results.length === 1 ? "" : "s"}
          {cores.length === 2 && <> satisfying both <b>{cores.join(" + ")}</b></>}
        </span>
        {anyFilter && (
          <button
            className="underline hover:text-stone-800"
            onClick={() => {
              setDept(null);
              setCore1(null);
              setCore2(null);
              setProf(null);
              setKeyword("");
              setInstitution("All");
              setDays([]);
              setTimeFrom(null);
              setTimeTo(null);
              setTimeMode("inside");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {results.map(({ section, course }) => (
          <li key={section.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition hover:border-orange-300">
            <div className="flex flex-wrap items-start gap-3">
              <Link to={`/course/${course.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <InstitutionBadge institution={course.institution} />
                  <span className="font-semibold">
                    {courseCode(course)}
                    <span className="text-stone-400">-{section.sectionNo}</span>
                  </span>
                  <span className="text-stone-800">{sectionTitle(section)}</span>
                  {section.isLab && <TagBadge text="Lab · own CRN" />}
                  {course.cores.includes("CFAP") && <TagBadge text={`Partial: ${course.units} unit${course.units === 1 ? "" : "s"} toward the 4 for Fine Arts`} />}
                  <QuarterBadge quarter={section.caltechQuarter} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-stone-600">
                  <span>{instructorNames(section)}</span>
                  <span>{section.meetings.map(fmtMeeting).join(" + ")}</span>
                  <span>{sectionUnits(section)} units</span>
                  <span>Max seats {section.capacity}</span>
                  <span>CRN {section.crn}</span>
                </div>
                {(course.cores.length > 0 || course.tags.length > 0) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {course.tags.map((t) => (
                      <TagBadge key={t} text={TAG_LABEL[t]} />
                    ))}
                    {course.cores.map((c) => (
                      <CoreBadge key={c} code={c} />
                    ))}
                  </div>
                )}
              </Link>
              <FavoriteButton sectionId={section.id} />
            </div>
          </li>
        ))}
        {results.length === 0 && <li className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">No sections match these filters in this term.</li>}
      </ul>
      </>
      )}
    </div>
  );
}
