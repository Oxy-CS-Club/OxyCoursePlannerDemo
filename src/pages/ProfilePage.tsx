// Spec §3.5: year, majors (incl. 3-2 tracks), and course history with the term taken.
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { courseCode, getCourse, listCourses } from "../api/catalog";
import { CoreBadge, InstitutionBadge } from "../components/Badges";
import { Combobox, type Option } from "../components/Combobox";
import { HISTORY_TERMS } from "../data/catalog";
import { MAJOR_BY_ID, MAJORS } from "../data/majors";
import { coreProgress } from "../lib/recommend";
import { useApp } from "../state/AppContext";
import type { Profile } from "../types";

const YEARS: { v: Profile["year"]; label: string }[] = [
  { v: 1, label: "First-year" },
  { v: 2, label: "Sophomore" },
  { v: 3, label: "Junior" },
  { v: 4, label: "Senior" },
];

export function ProfilePage() {
  const { user, data, updateProfile } = useApp();
  const [historyTerm, setHistoryTerm] = useState(HISTORY_TERMS[HISTORY_TERMS.length - 2].id);
  if (!user) return <Navigate to="/login" replace />;
  const p = data.profile;

  const majorOptions: Option[] = MAJORS.map((m) => ({ value: m.id, label: m.name, group: m.threeTwo ? "3-2 Engineering tracks" : "Majors" }));
  const courseOptions: Option[] = listCourses().map((c) => ({ value: c.id, label: `${courseCode(c)} — ${c.title}`, hint: c.institution }));
  const progress = coreProgress(p);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p className="mb-4 text-sm text-stone-500">
        Signed in as {user.name} ({user.email}). This information drives the recommendation sidebar.
      </p>

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
        <div className="mb-3 flex max-w-xl flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Term taken</span>
            <select value={historyTerm} onChange={(e) => setHistoryTerm(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm">
              {HISTORY_TERMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="min-w-64 flex-1">
            <Combobox
              label="Add a course"
              options={courseOptions}
              value={null}
              resetOnSelect
              disabledValues={p.history.map((h) => h.courseId)}
              onChange={(v) => v && updateProfile({ history: [...p.history, { courseId: v, termId: historyTerm }] })}
              placeholder='Type e.g. "calc" or "comp 131"'
            />
          </div>
        </div>
        {p.history.length === 0 ? (
          <p className="text-sm text-stone-400">No courses added yet.</p>
        ) : (
          <div className="space-y-2">
            {[...HISTORY_TERMS].reverse().map((t) => {
              const items = p.history.filter((h) => h.termId === t.id);
              if (items.length === 0) return null;
              return (
                <div key={t.id}>
                  <div className="mb-1 text-xs font-semibold text-stone-500">{t.name}</div>
                  <ul className="flex flex-wrap gap-2">
                    {items.map((h) => {
                      const c = getCourse(h.courseId);
                      return (
                        <li key={h.courseId} className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-2 py-1 text-sm">
                          <InstitutionBadge institution={c.institution} />
                          <span className="font-medium">{courseCode(c)}</span>
                          <span className="text-stone-500">{c.title}</span>
                          <button
                            className="ml-1 text-stone-400 hover:text-red-600"
                            aria-label={`Remove ${courseCode(c)}`}
                            onClick={() => updateProfile({ history: p.history.filter((x) => x.courseId !== h.courseId) })}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-stone-500">
          Your past courses also appear on{" "}
          <Link to="/my-courses" className="text-orange-700 underline">
            My Courses
          </Link>
          , next to your final schedules.
        </p>

        <h3 className="mt-5 mb-2 text-sm font-semibold">Core progress (from your history)</h3>
        <ul className="grid gap-1 sm:grid-cols-2">
          {progress.map((c) => (
            <li key={c.code} className="flex items-center gap-2 text-sm">
              <span className={c.done ? "text-emerald-600" : "text-stone-300"}>{c.done ? "✔" : "○"}</span>
              <CoreBadge code={c.code} />
              <span className={c.done ? "" : "text-stone-500"}>{c.name}</span>
              {c.detail && <span className="text-xs text-stone-400">{c.detail}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-500">
          Fine Arts needs 4 units: one 4-unit Fine Arts course, or partial (1–2 unit) arts courses that add up to 4. Language Proficiency needs two language courses, unless
          you passed the exemption test.
        </p>
        <label className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Language requirement</span>
          <select
            value={p.langExempt ? "exempt" : "courses"}
            onChange={(e) => updateProfile({ langExempt: e.target.value === "exempt" })}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="courses">Complete with 2 language courses</option>
            <option value="exempt">I passed the language exemption test</option>
          </select>
        </label>
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
