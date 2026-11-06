// Spec §3.6: collapsible, logged-in only, current/future terms only.
import { useState } from "react";
import { Link } from "react-router-dom";
import { courseCode } from "../api/catalog";
import { TERM_BY_ID } from "../data/catalog";
import { MAJOR_BY_ID } from "../data/majors";
import { recommend } from "../lib/recommend";
import { useApp } from "../state/AppContext";
import { CoreBadge, InstitutionBadge } from "./Badges";

export function RecommendationSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { user, data, termId } = useApp();
  // Each recommendation group can be expanded or collapsed; all start expanded.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  if (!user) return null;
  const term = TERM_BY_ID[termId];

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/3 z-20 rounded-l-lg bg-orange-600 px-2 py-3 text-xs font-semibold text-white shadow-lg [writing-mode:vertical-rl]"
        aria-label="Open recommendations"
      >
        ✦ Recommendations
      </button>
    );
  }

  const p = data.profile;
  const groups = term.status === "past" ? [] : recommend(p, termId);

  return (
    <aside className="w-full shrink-0 border-t border-stone-200 bg-white p-4 lg:sticky lg:top-0 lg:h-[calc(100vh-0px)] lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">✦ Recommended for {term.name}</h2>
        <button onClick={onToggle} className="text-sm text-stone-500 hover:text-stone-800" aria-label="Collapse recommendations">
          Hide ›
        </button>
      </div>

      {term.status === "past" ? (
        <p className="rounded-lg bg-stone-100 p-3 text-sm text-stone-600">Recommendations are only shown for the current and future terms.</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-stone-500">
            Based on{" "}
            {p.year ? <b>{["", "first-year", "sophomore", "junior", "senior"][p.year]}</b> : <i>no year set</i>},{" "}
            {p.majorIds.length ? <b>{p.majorIds.map((id) => MAJOR_BY_ID[id]?.name ?? id).join(" + ")}</b> : <i>no major set</i>}, {p.history.length} past courses.{" "}
            <Link to="/profile" className="text-orange-700 underline">
              Edit profile
            </Link>
          </p>
          {(p.year === 3 || p.year === 4) && p.majorIds.length === 0 && (
            <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Add your major to see junior/senior seminars in your field.</p>
          )}
          {!p.year && p.majorIds.length === 0 && (
            <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Set your year and major on your profile to get major, FYS and seminar recommendations.</p>
          )}
          {groups.length > 0 && (
            <div className="mb-2 flex justify-end gap-3 text-xs">
              <button className="text-stone-500 hover:text-stone-800" onClick={() => setCollapsed({})}>
                Expand all
              </button>
              <button className="text-stone-500 hover:text-stone-800" onClick={() => setCollapsed(Object.fromEntries(groups.map((g) => [g.id, true])))}>
                Collapse all
              </button>
            </div>
          )}
          <div className="space-y-3">
            {groups.map((g) => {
              const isOpen = !collapsed[g.id];
              return (
              <section key={g.id} className="rounded-lg border border-stone-100">
                <button
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-stone-50"
                  aria-expanded={isOpen}
                  onClick={() => setCollapsed((c) => ({ ...c, [g.id]: isOpen }))}
                >
                  <span className="text-sm font-semibold text-stone-800">{g.title}</span>
                  <span className="shrink-0 text-xs text-stone-400">
                    {g.courses.length} {isOpen ? "▾" : "▸"}
                  </span>
                </button>
                {isOpen && (
                <div className="px-2 pb-2">
                <p className="mb-1 text-xs text-stone-500">{g.reason}</p>
                {g.courses.length === 0 ? (
                  <p className="text-xs italic text-stone-400">Nothing offered this term.</p>
                ) : (
                  <ul className="space-y-1">
                    {g.courses.map((c) => (
                      <li key={c.id}>
                        <Link to={`/course/${c.id}`} className="block rounded-lg border border-stone-200 px-2 py-1.5 text-sm hover:border-orange-300 hover:bg-orange-50">
                          <div className="flex items-center gap-1.5">
                            <InstitutionBadge institution={c.institution} />
                            <span className="font-medium">{courseCode(c)}</span>
                          </div>
                          <div className="truncate text-xs text-stone-600">{c.title}</div>
                          {c.cores.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.cores.map((k) => (
                                <CoreBadge key={k} code={k} />
                              ))}
                            </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                </div>
                )}
              </section>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
