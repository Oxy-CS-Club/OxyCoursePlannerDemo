import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { TERMS } from "../data/catalog";
import { useApp } from "../state/AppContext";
import { Modal } from "./Modal";
import { RecommendationSidebar } from "./RecommendationSidebar";

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? "bg-white/15 text-white" : "text-stone-300 hover:text-white"}`;

export function Layout() {
  const { user, logout, termId, setTermId, pendingImport, resolveImport, resetDemo } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-amber-300 px-4 py-1 text-center text-xs font-medium text-amber-950">
        DEMO — mock data for illustration only. Not the official Oxy or Caltech schedule.
      </div>
      <header className="bg-stone-900 text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-600 text-sm">OX</span>
            <span>Oxy Course Planner</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navCls}>
              Search
            </NavLink>
            <NavLink to="/collections" className={navCls}>
              Collections
            </NavLink>
            <NavLink to="/visualizer" className={navCls}>
              Visualizer
            </NavLink>
            {user && (
              <NavLink to="/my-courses" className={navCls}>
                My Courses
              </NavLink>
            )}
            {user && (
              <NavLink to="/profile" className={navCls}>
                Profile
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-stone-400">Term</span>
              <select
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="rounded-lg border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-white"
              >
                {TERMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status})
                  </option>
                ))}
              </select>
            </label>
            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-stone-300 sm:inline">{user.name}</span>
                <button onClick={logout} className="rounded-lg border border-stone-600 px-2.5 py-1 hover:bg-stone-800">
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold hover:bg-orange-700">
                Sign in
              </Link>
            )}
          </div>
        </div>
        {!user && (
          <div className="bg-stone-800 px-4 py-1.5 text-center text-xs text-stone-300">
            You're browsing as a guest. Collections and schedules are kept only until you close this tab.{" "}
            <Link to="/login" className="font-semibold text-orange-300 underline">
              Sign in
            </Link>{" "}
            to save them and get recommendations.
          </div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col lg:flex-row">
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <RecommendationSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      </div>

      <footer className="border-t border-stone-200 px-4 py-3 text-center text-xs text-stone-500">
        Oxy CS Club · Course Planner demo ·{" "}
        <button onClick={resetDemo} className="underline hover:text-stone-800">
          Reset demo data
        </button>
      </footer>

      {pendingImport && (
        <Modal title="Import your guest data?" onClose={() => resolveImport(false)}>
          <p className="mb-4 text-sm text-stone-600">
            Before signing in you created {pendingImport.collections.length} collection(s) and {pendingImport.schedules.length} schedule(s). Import them into your
            account so they're saved?
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => resolveImport(false)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
              Discard
            </button>
            <button onClick={() => resolveImport(true)} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">
              Import
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
