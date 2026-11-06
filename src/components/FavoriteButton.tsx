// Spec §3.3: favorite a section into a chosen collection, or create & name one on the spot.
import { useState } from "react";
import { getCourse, courseCode } from "../api/catalog";
import { SECTION_BY_ID } from "../data/catalog";
import { useApp } from "../state/AppContext";
import { Modal } from "./Modal";

export function FavoriteButton({ sectionId, compact }: { sectionId: string; compact?: boolean }) {
  const { data } = useApp();
  const [open, setOpen] = useState(false);
  const saved = data.collections.some((c) => c.sectionIds.includes(sectionId));
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition ${
          saved ? "border-orange-300 bg-orange-50 text-orange-700" : "border-stone-300 bg-white text-stone-700 hover:border-orange-400 hover:text-orange-700"
        }`}
        aria-label={saved ? "Saved to a collection — edit" : "Add to a collection"}
      >
        <span aria-hidden>{saved ? "★" : "☆"}</span>
        {!compact && (saved ? "Saved" : "Save")}
      </button>
      {open && <FavoriteDialog sectionId={sectionId} onClose={() => setOpen(false)} />}
    </>
  );
}

function FavoriteDialog({ sectionId, onClose }: { sectionId: string; onClose: () => void }) {
  const { data, createCollection, addToCollection, removeFromCollection } = useApp();
  const [newName, setNewName] = useState("");
  const section = SECTION_BY_ID[sectionId];
  const course = getCourse(section.courseId);

  return (
    <Modal title={`Save ${courseCode(course)}-${section.sectionNo}`} onClose={onClose}>
      <p className="mb-3 text-sm text-stone-600">{course.title}</p>
      <div className="mb-4 space-y-1">
        {data.collections.length === 0 && <p className="text-sm text-stone-500">No collections yet. Create your first one below.</p>}
        {data.collections.map((c) => {
          const checked = c.sectionIds.includes(sectionId);
          return (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-stone-50">
              <input
                type="checkbox"
                className="accent-orange-600"
                checked={checked}
                onChange={() => (checked ? removeFromCollection(c.id, sectionId) : addToCollection(c.id, sectionId))}
              />
              <span className="text-sm">{c.name}</span>
              <span className="ml-auto text-xs text-stone-400">{c.sectionIds.length} courses</span>
            </label>
          );
        })}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          const id = createCollection(newName);
          addToCollection(id, sectionId);
          setNewName("");
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          placeholder='New collection, e.g. "Spring 2027"'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">Create &amp; add</button>
      </form>
      <div className="mt-4 flex justify-end">
        <button onClick={onClose} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
          Done
        </button>
      </div>
    </Modal>
  );
}
