// Spec §3.3: manage collections — create, rename, delete, remove items, move items.
import { useState } from "react";
import { Link } from "react-router-dom";
import { courseCode, getCourse, instructorNames } from "../api/catalog";
import { CoreBadge, InstitutionBadge } from "../components/Badges";
import { SECTION_BY_ID, TERM_BY_ID } from "../data/catalog";
import { fmtMeeting } from "../lib/time";
import { useApp } from "../state/AppContext";

export function CollectionsPage() {
  const { data, createCollection, renameCollection, deleteCollection, removeFromCollection, moveToCollection } = useApp();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Collections</h1>
      <p className="mb-4 text-sm text-stone-500">Group saved courses however you like, e.g. "Spring 2027" or "Spring 2027 V2". Collections feed the visualizer.</p>

      <form
        className="mb-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          createCollection(newName);
          setNewName("");
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          placeholder="New collection name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">Create</button>
      </form>

      {data.collections.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No collections yet. Create one above, or <Link to="/" className="text-orange-700 underline">search</Link> and click ☆ Save on a course.
        </p>
      )}

      <div className="space-y-4">
        {data.collections.map((c) => (
          <section key={c.id} className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-4 py-3">
              {editing === c.id ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    renameCollection(c.id, draft);
                    setEditing(null);
                  }}
                >
                  <input autoFocus className="rounded-lg border border-stone-300 px-2 py-1 text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <button className="text-sm font-semibold text-orange-700">Save</button>
                  <button type="button" className="text-sm text-stone-500" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <h2 className="font-semibold">{c.name}</h2>
              )}
              <span className="text-xs text-stone-400">{c.sectionIds.length} courses</span>
              <div className="ml-auto flex gap-2 text-sm">
                <button
                  className="text-stone-600 hover:text-stone-900"
                  onClick={() => {
                    setEditing(c.id);
                    setDraft(c.name);
                  }}
                >
                  Rename
                </button>
                <button className="text-red-700 hover:text-red-900" onClick={() => confirm(`Delete collection "${c.name}"?`) && deleteCollection(c.id)}>
                  Delete
                </button>
              </div>
            </header>
            <ul className="divide-y divide-stone-100">
              {c.sectionIds.length === 0 && <li className="px-4 py-3 text-sm text-stone-400">Empty.</li>}
              {c.sectionIds.map((sid) => {
                const s = SECTION_BY_ID[sid];
                if (!s) return null;
                const course = getCourse(s.courseId);
                return (
                  <li key={sid} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
                    <InstitutionBadge institution={course.institution} />
                    <Link to={`/course/${course.id}`} className="min-w-0 flex-1 hover:underline">
                      <b>
                        {courseCode(course)}-{s.sectionNo}
                      </b>{" "}
                      {course.title}
                      {s.isLab ? " Lab" : ""}
                      <div className="text-xs text-stone-500">
                        {TERM_BY_ID[s.termId].name} · {instructorNames(s)} · {s.meetings.map(fmtMeeting).join("; ")}
                      </div>
                    </Link>
                    <div className="flex gap-1">
                      {course.cores.map((k) => (
                        <CoreBadge key={k} code={k} />
                      ))}
                    </div>
                    {data.collections.length > 1 && (
                      <select
                        aria-label="Move to collection"
                        className="rounded-lg border border-stone-300 px-1.5 py-1 text-xs"
                        value=""
                        onChange={(e) => e.target.value && moveToCollection(c.id, e.target.value, sid)}
                      >
                        <option value="">Move to…</option>
                        {data.collections
                          .filter((o) => o.id !== c.id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                    )}
                    <button className="text-xs text-stone-500 hover:text-red-700" onClick={() => removeFromCollection(c.id, sid)}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
