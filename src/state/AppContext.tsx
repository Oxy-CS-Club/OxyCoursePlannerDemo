// Mock persistence (spec §3.5):
//  - Guests: sessionStorage → data disappears when the tab is closed.
//  - Logged-in users: localStorage keyed by email → data is there next time.
// In the real app the logged-in branch becomes API calls to the backend.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SECTION_BY_ID, TERMS } from "../data/catalog";
import type { Collection, Profile, Schedule, User, UserData } from "../types";

const GUEST_KEY = "ocp:guest";
const USER_KEY = "ocp:user";
const dataKey = (email: string) => `ocp:data:${email}`;

const emptyProfile = (): Profile => ({ year: null, majorIds: [], history: [], langExempt: false });

/** Upgrade data saved by older demo versions so nothing breaks after an update. */
function migrate(d: UserData | null): UserData | null {
  if (!d) return d;
  const p = d.profile as Profile & { majorId?: string | null; history: unknown[] };
  if (!Array.isArray(p.majorIds)) p.majorIds = p.majorId ? [p.majorId] : [];
  delete p.majorId;
  // History used to be plain course ids; now each entry also has a term.
  p.history = (p.history ?? []).map((h) => (typeof h === "string" ? { courseId: h, termId: "FA25" } : h)) as Profile["history"];
  // Section numbers changed from "01" to "1" (counts style); drop ids that no longer exist.
  const fix = (ids: string[]) =>
    ids.map((id) => (SECTION_BY_ID[id] ? id : id.replace(/-0(\d)$/, "-$1"))).filter((id) => SECTION_BY_ID[id]);
  d.collections?.forEach((c) => (c.sectionIds = fix(c.sectionIds)));
  d.schedules?.forEach((s) => (s.sectionIds = fix(s.sectionIds)));
  d.finalSchedules ??= {};
  Object.values(d.finalSchedules).forEach((f) => (f.sectionIds = fix(f.sectionIds)));
  d.locations ??= {};
  p.langExempt ??= false;
  return d;
}
const emptyData = (): UserData => ({ collections: [], schedules: [], activeScheduleByTerm: {}, profile: emptyProfile(), finalSchedules: {}, locations: {} });
const uid = () => Math.random().toString(36).slice(2, 10);

function read<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(store: Storage, key: string, value: unknown) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: demo still works in memory */
  }
}
function remove(store: Storage, key: string) {
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

const hasContent = (d: UserData) => d.collections.some((c) => c.sectionIds.length) || d.schedules.some((s) => s.sectionIds.length);

interface AppState {
  user: User | null;
  data: UserData;
  termId: string;
  setTermId: (id: string) => void;
  // auth
  login: (u: User) => void;
  logout: () => void;
  pendingImport: UserData | null;
  resolveImport: (doImport: boolean) => void;
  // collections
  createCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, sectionId: string) => void;
  removeFromCollection: (collectionId: string, sectionId: string) => void;
  moveToCollection: (fromId: string, toId: string, sectionId: string) => void;
  // schedules
  activeSchedule: Schedule | null;
  schedulesForTerm: Schedule[];
  createSchedule: (name: string) => void;
  renameSchedule: (id: string, name: string) => void;
  deleteSchedule: (id: string) => void;
  setActiveSchedule: (id: string) => void;
  addToSchedule: (sectionId: string) => void;
  removeFromSchedule: (sectionId: string) => void;
  // profile
  updateProfile: (p: Partial<Profile>) => void;
  // final schedules + user-entered rooms
  setFinalSchedule: (termId: string, schedule: Schedule) => void;
  removeFinalSchedule: (termId: string) => void;
  setLocation: (key: string, value: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read<User>(localStorage, USER_KEY));
  const [data, setData] = useState<UserData>(() => {
    const u = read<User>(localStorage, USER_KEY);
    return migrate(u ? read<UserData>(localStorage, dataKey(u.email)) : read<UserData>(sessionStorage, GUEST_KEY)) ?? emptyData();
  });
  const [termId, setTermId] = useState(() => TERMS.find((t) => t.status === "current")!.id);
  const [pendingImport, setPendingImport] = useState<UserData | null>(null);

  // Persist on every change to the right store.
  useEffect(() => {
    if (user) write(localStorage, dataKey(user.email), data);
    else write(sessionStorage, GUEST_KEY, data);
  }, [user, data]);

  const update = useCallback((fn: (d: UserData) => UserData) => setData((d) => fn(structuredClone(d))), []);

  const login = useCallback(
    (u: User) => {
      const guest = data;
      write(localStorage, USER_KEY, u);
      setUser(u);
      setData(migrate(read<UserData>(localStorage, dataKey(u.email))) ?? emptyData());
      remove(sessionStorage, GUEST_KEY);
      if (hasContent(guest)) setPendingImport(guest);
    },
    [data],
  );

  const logout = useCallback(() => {
    remove(localStorage, USER_KEY);
    setUser(null);
    setData(emptyData());
  }, []);

  const resolveImport = useCallback(
    (doImport: boolean) => {
      if (doImport && pendingImport) {
        update((d) => {
          d.collections.push(...pendingImport.collections.map((c) => ({ ...c, name: `${c.name} (imported)` })));
          d.schedules.push(...pendingImport.schedules.map((s) => ({ ...s, name: `${s.name} (imported)` })));
          return d;
        });
      }
      setPendingImport(null);
    },
    [pendingImport, update],
  );

  const schedulesForTerm = useMemo(() => data.schedules.filter((s) => s.termId === termId), [data.schedules, termId]);
  const activeSchedule = useMemo(
    () => schedulesForTerm.find((s) => s.id === data.activeScheduleByTerm[termId]) ?? schedulesForTerm[0] ?? null,
    [schedulesForTerm, data.activeScheduleByTerm, termId],
  );

  const value: AppState = {
    user,
    data,
    termId,
    setTermId,
    login,
    logout,
    pendingImport,
    resolveImport,

    createCollection: (name) => {
      const id = uid();
      update((d) => {
        d.collections.push({ id, name: name.trim() || "Untitled", sectionIds: [] } satisfies Collection);
        return d;
      });
      return id;
    },
    renameCollection: (id, name) =>
      update((d) => {
        const c = d.collections.find((x) => x.id === id);
        if (c) c.name = name.trim() || c.name;
        return d;
      }),
    deleteCollection: (id) =>
      update((d) => {
        d.collections = d.collections.filter((c) => c.id !== id);
        return d;
      }),
    addToCollection: (collectionId, sectionId) =>
      update((d) => {
        const c = d.collections.find((x) => x.id === collectionId);
        if (c && !c.sectionIds.includes(sectionId)) c.sectionIds.push(sectionId);
        return d;
      }),
    removeFromCollection: (collectionId, sectionId) =>
      update((d) => {
        const c = d.collections.find((x) => x.id === collectionId);
        if (c) c.sectionIds = c.sectionIds.filter((s) => s !== sectionId);
        return d;
      }),
    moveToCollection: (fromId, toId, sectionId) =>
      update((d) => {
        const from = d.collections.find((x) => x.id === fromId);
        const to = d.collections.find((x) => x.id === toId);
        if (!from || !to) return d;
        from.sectionIds = from.sectionIds.filter((s) => s !== sectionId);
        if (!to.sectionIds.includes(sectionId)) to.sectionIds.push(sectionId);
        return d;
      }),

    activeSchedule,
    schedulesForTerm,
    createSchedule: (name) =>
      update((d) => {
        const id = uid();
        d.schedules.push({ id, name: name.trim() || "Untitled schedule", termId, sectionIds: [] });
        d.activeScheduleByTerm[termId] = id;
        return d;
      }),
    renameSchedule: (id, name) =>
      update((d) => {
        const s = d.schedules.find((x) => x.id === id);
        if (s) s.name = name.trim() || s.name;
        return d;
      }),
    deleteSchedule: (id) =>
      update((d) => {
        d.schedules = d.schedules.filter((s) => s.id !== id);
        if (d.activeScheduleByTerm[termId] === id) delete d.activeScheduleByTerm[termId];
        return d;
      }),
    setActiveSchedule: (id) =>
      update((d) => {
        d.activeScheduleByTerm[termId] = id;
        return d;
      }),
    addToSchedule: (sectionId) =>
      update((d) => {
        let s = d.schedules.find((x) => x.id === activeSchedule?.id);
        if (!s) {
          s = { id: uid(), name: "My schedule", termId, sectionIds: [] };
          d.schedules.push(s);
          d.activeScheduleByTerm[termId] = s.id;
        }
        if (!s.sectionIds.includes(sectionId)) s.sectionIds.push(sectionId);
        return d;
      }),
    removeFromSchedule: (sectionId) =>
      update((d) => {
        const s = d.schedules.find((x) => x.id === activeSchedule?.id);
        if (s) s.sectionIds = s.sectionIds.filter((x) => x !== sectionId);
        return d;
      }),

    updateProfile: (p) =>
      update((d) => {
        d.profile = { ...d.profile, ...p };
        return d;
      }),
    setFinalSchedule: (termId, schedule) =>
      update((d) => {
        d.finalSchedules[termId] = { name: schedule.name, sectionIds: [...schedule.sectionIds], finalizedAt: new Date().toISOString() };
        return d;
      }),
    removeFinalSchedule: (termId) =>
      update((d) => {
        delete d.finalSchedules[termId];
        return d;
      }),
    setLocation: (key, value) =>
      update((d) => {
        if (value.trim()) d.locations[key] = value.trim();
        else delete d.locations[key];
        return d;
      }),
    resetDemo: () => {
      try {
        Object.keys(localStorage).filter((k) => k.startsWith("ocp:")).forEach((k) => localStorage.removeItem(k));
        sessionStorage.removeItem(GUEST_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
      setData(emptyData());
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
