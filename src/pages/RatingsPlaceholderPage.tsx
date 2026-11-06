import { useSearchParams } from "react-router-dom";

export function RatingsPlaceholderPage() {
  const [params] = useSearchParams();
  const kind = params.get("kind");
  const subject = kind === "professor" ? params.get("name") : params.get("course")?.replace("-", " ");
  return (
    <div className="grid min-h-screen place-items-center bg-stone-100 p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-orange-600 text-xl text-white">★</div>
        <h1 className="text-xl font-bold">RateMyClass</h1>
        <p className="mt-2 text-stone-600">
          Ratings for {kind === "professor" ? "professor" : "class"} <b>{subject}</b> ({params.get("school")}) will appear here.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          RateMyClass isn't live yet. This placeholder opened in a new tab, which is how the real link will behave. When RateMyClass launches, we only need to
          change the URL templates in <code className="rounded bg-stone-100 px-1">src/api/ratings.ts</code>.
        </p>
        <button onClick={() => window.close()} className="mt-6 rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">
          Close tab
        </button>
      </div>
    </div>
  );
}
