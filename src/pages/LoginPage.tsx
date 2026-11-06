// Mock sign-in. The real app will use the college's account system; no password is checked here.
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";

export function LoginPage() {
  const { user, login } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("Alex Student");
  const [email, setEmail] = useState("astudent@oxy.edu");
  const valid = name.trim() && /@oxy\.edu$/i.test(email.trim());
  if (user) return <Navigate to="/profile" replace />;

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Sign in</h1>
      <p className="mt-1 mb-4 text-sm text-stone-500">Demo sign-in: any name and an @oxy.edu address. Nothing is sent anywhere; data is stored in this browser.</p>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          login({ name: name.trim(), email: email.trim().toLowerCase() });
          nav("/profile");
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Oxy email</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {!valid && <p className="text-xs text-red-600">Use an @oxy.edu email address.</p>}
        <button disabled={!valid} className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
          Continue with Oxy account
        </button>
      </form>
      <p className="mt-4 text-xs text-stone-400">
        Tip: as a guest, save a few courses first, then sign in to see the "import your guest data" prompt.
      </p>
    </div>
  );
}
