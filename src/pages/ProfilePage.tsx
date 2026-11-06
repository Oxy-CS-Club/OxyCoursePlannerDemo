// Spec §3.5: year, major (incl. 3-2 tracks), and course history (type-to-match).
import { Link, Navigate } from "react-router-dom";
import { courseCode, getCourse, listCourses } from "../api/catalog";
import { CoreBadge, InstitutionBadge } from "../components/Badges";
import { Combobox, type Option } from "../components/Combobox";
import { CORES } from "../data/cores";
import { MAJOR_BY_ID, MAJORS } from "../data/majors";
import { satisfiedCores } from "../lib/recommend";
import { useApp } from "../state/AppContext";
import type { Profile } from "../types";

const YEARS: { v: Profile["year"]; label: string }[] = [
  { v: 1, label: "First-year" },
  { v: 2, label: "Sophomore" },
  { v: 3, label: "Junior" },
  { v: 4, label: "Senior" },
];

const SAMPLES: { label: string; profile: Profile }[] = [
  { label: "First-year, Physics 3-2", profile: { year: 1, majorIds: ["phys-32"], history: ["oxy-math-120"] } },
  { label: "Junior, CS + Math double major", profile: { year: 3, majorIds: ["comp", "math"], history: ["oxy-comp-131", "oxy-comp-229", "oxy-math-120", "oxy-fys-106", "oxy-hist-270", "oxy-arts-101"] } },
  { label: "Senior, History", profile: { year: 4, majorIds: ["hist"], history: ["oxy-hist-101", "oxy-hist-270", "oxy-hist-380", "oxy-fys-101", "oxy-arth-150", "oxy-chem-120", "oxy-dwa-101"] } },
];

export function ProfilePage() {
  const { user, data, updateProfile } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  const p = data.profile;

  const majorOptions: Option[] = MAJORS.map((m) => ({ value: m.id, label: m.name, group: m.threeTwo ? "3-2 Engineering tracks" : "Majors" }));
  const courseOptions: Option[] = listCourses().map((c) => ({ value: c.id, label: `${courseCode(c)} — ${c.title}`, hint: c.institution }));
  const have = satisfiedCores(p.history);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p className="mb-4 text-sm text-stone-500">
        Signed in as {user.name} ({user.email}). This information drives the recommendation sidebar.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-3 text-sm">
        <span className="font-medium text-orange-900">Demo shortcuts:</span>
        {SAMPLES.map((s) => (
          <button key={s.label} onClick={() => updateProfile(s.profile)} className="rounded-lg border border-orange-300 bg-white px-2 py-1 text-xs hover:bg-orange-100">
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Class year</span>
          <div className="flex flex-wrap gap-1">
            {YEARS.map((y) => (
              <button
                key={y.v}
                onClick={() => updateProfile({ year: y.v })}
                className={`rounded-lg border px-3 py-1.5 text-sm ${p.year === y.v ? "border-orange-500 bg-orange-600 text-white" : "border-stone-300 hover:border-orange-400"}`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Combobox
            label="Majors (add one or more, incl. 3-2 tracks)"
            options={majorOptions}
            value={null}
            resetOnSelect
            disabledValues={p.majorIds}
            onChange={(v) => v && updateProfile({ majorIds: [...p.majorIds, v] })}
            placeholder={p.majorIds.length ? "Add another major" : "Type or pick a major"}
          />
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {p.majorIds.length === 0 && <li className="text-sm text-stone-400">No major added yet.</li>}
            {p.majorIds.map((id) => (
              <li key={id} className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-sm font-medium text-orange-900">
                {MAJOR_BY_ID[id]?.name ?? id}
                <button
                  className="ml-0.5 text-orange-700 hover:text-red-700"
                  aria-label={`Remove major ${MAJOR_BY_ID[id]?.name ?? id}`}
                  onClick={() => updateProfile({ majorIds: p.majorIds.filter((x) => x !== id) })}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold">Courses you've taken</h2>
        <div className="mb-3 max-w-md">
          <Combobox
            label="Add a course"
            options={courseOptions}
            value={null}
            resetOnSelect
            disabledValues={p.history}
            onChange={(v) => v && updateProfile({ history: [...p.history, v] })}
            placeholder='Type e.g. "calc" or "comp 131"'
          />
        </div>
        {p.history.length === 0 ? (
          <p className="text-sm text-stone-400">No courses added yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {p.history.map((id) => {
              const c = getCourse(id);
              return (
                <li key={id} className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-2 py-1 text-sm">
                  <InstitutionBadge institution={c.institution} />
                  <span className="font-medium">{courseCode(c)}</span>
                  <span className="text-stone-500">{c.title}</span>
                  <button className="ml-1 text-stone-400 hover:text-red-600" aria-label={`Remove ${courseCode(c)}`} onClick={() => updateProfile({ history: p.history.filter((x) => x !== id) })}>
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <h3 className="mt-5 mb-2 text-sm font-semibold">Core progress (from your history)</h3>
        <ul className="grid gap-1 sm:grid-cols-2">
          {CORES.map((c) => (
            <li key={c.code} className="flex items-center gap-2 text-sm">
              <span className={have.has(c.code) ? "text-emerald-600" : "text-stone-300"}>{have.has(c.code) ? "✔" : "○"}</span>
              <CoreBadge code={c.code} />
              <span className={have.has(c.code) ? "" : "text-stone-500"}>{c.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-stone-500">
        Recommendations appear in the sidebar on the right for the <b>current and future</b> terms. Try switching the term in the top bar, or{" "}
        <Link to="/" className="text-orange-700 underline">
          go search
        </Link>
        .
      </p>
    </div>
  );
}
