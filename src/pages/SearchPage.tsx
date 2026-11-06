// Spec §3.1: term + department (incl. FYS subject) + up to 2 Cores (AND) + professor + keyword + institution.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { courseCode, instructorNames, listDepartments, listInstructors, searchSections } from "../api/catalog";
import { CoreBadge, InstitutionBadge, QuarterBadge, TagBadge } from "../components/Badges";
import { Combobox, type Option } from "../components/Combobox";
import { FavoriteButton } from "../components/FavoriteButton";
import { TERM_BY_ID } from "../data/catalog";
import { CORES } from "../data/cores";
import { fmtMeeting } from "../lib/time";
import { useApp } from "../state/AppContext";
import type { CoreCode, Institution } from "../types";

const TAG_LABEL = { fys: "First-Year Seminar", "junior-seminar": "Junior seminar", "senior-seminar": "Senior seminar" } as const;

export function SearchPage() {
  const { termId } = useApp();
  const [dept, setDept] = useState<string | null>(null);
  const [core1, setCore1] = useState<string | null>(null);
  const [core2, setCore2] = useState<string | null>(null);
  const [prof, setProf] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [institution, setInstitution] = useState<Institution | "All">("All");

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
  const results = searchSections({ termId, dept, cores, instructorId: prof, keyword, institution });
  // The school toggle only narrows a search; on its own it doesn't count as one.
  const anyFilter = Boolean(dept || cores.length || prof || keyword.trim());

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
      </div>

      {/* Nothing is listed until the user sets at least one search condition. */}
      {!anyFilter ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          <p className="font-medium text-stone-700">Start a search to see courses</p>
          <p className="mt-1 text-sm">Type a keyword, or pick a department, a Core, or a professor above.</p>
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
                  <span className="text-stone-800">{course.title}</span>
                  <QuarterBadge quarter={section.caltechQuarter} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-stone-600">
                  <span>{instructorNames(section)}</span>
                  {section.meetings.map((mt, i) => (
                    <span key={i}>
                      {fmtMeeting(mt)} · {mt.location}
                    </span>
                  ))}
                  <span>{course.units} units</span>
                  <span title="Live remaining seats are a planned future feature.">
                    Capacity {section.capacity} · remaining <span className="text-stone-400">—</span>
                  </span>
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
