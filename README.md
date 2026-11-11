# Oxy Course Planner — UI Demo

A clickable front-end demo of the **Oxy Course Planner**, a course planning and schedule visualization tool built just for Occidental College students. It shows what the finished product should look like and how each feature in the spec works.

> **This is a demo.** All course data is mock data, made up for illustration. It is **not** the official Oxy or Caltech schedule. There is no backend: "accounts" and saved data live only in your browser.

The full product spec is in [`docs/project-spec-en.md`](docs/project-spec-en.md).

---

## Run it on your computer

The demo runs entirely inside a Docker container. **You don't need Node, npm, or Python on your machine**, and nothing gets installed outside the container: no global packages, and no `node_modules` folder in the repo.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Git

### Steps

```bash
git clone https://github.com/Oxy-CS-Club/OxyCoursePlannerDemo.git
cd OxyCoursePlannerDemo
docker compose up --build
```

Then open **http://localhost:5280** in your browser.

- The first run downloads the Node image and installs packages inside the container. This takes a minute or two. Later runs start in seconds.
- Editing files in `src/` hot-reloads the page automatically.
- Stop it with `Ctrl+C`, or run `docker compose down` if you started it with `-d`.
- To remove everything the demo created (container + image): `docker compose down --rmi local`.

### Port already in use?

The demo uses port **5280**, which other tools rarely use. If something else on your machine already uses it, Docker will report that the port is taken. To pick another port, e.g. 5390, change the **left** number in `compose.yaml`:

```yaml
ports:
  - "127.0.0.1:5390:5280"
```

Then open http://localhost:5390.

### Other commands (all run inside the container)

```bash
docker compose run --rm web npm run typecheck   # TypeScript check
docker compose run --rm web npm run build       # production build (output stays in the container)
```

---

## Feature tour

Every feature in the spec is clickable. A suggested walkthrough:

| Spec | Feature | Where to try it |
|---|---|---|
| §3.1 | **Empty until you search** | The search page lists nothing until you type a keyword or pick a department, Core, professor, or time. The Oxy/Caltech toggle alone doesn't trigger a search. |
| §3.1 | **Term selector** | Top bar. Spring 2026 is a *past* term, Fall 2026 is *current*, Spring 2027 is *future*. |
| §3.1 | **Department search**, incl. **First-Year Seminar as a subject** | Search page → *Department / subject* → type "first" or pick "First-Year Seminar (FYS)". |
| §3.1 | **Core search, up to two Cores (AND)** | Set *Core 1* = Pre-1800 and *Core 2* = Fine Arts. Only courses meeting both are shown (e.g., ARTH 150). All 7 Core categories exist in the data: U.S. Diversity, Regional Focus, Global Connections, Pre-1800, Fine Arts, Math/Science, Lab Science. |
| §3.1 | **Professor search with type-to-match** | *Professor* → type "hern" (accent-insensitive: matches "Elena Hernández") or "chen". Every filter supports both dropdown picking and typing. |
| §3.1 | **Search by time** | Below the other filters, pick days (e.g., Mon + Wed) and a time range (e.g., 9:00am–12:00pm). Switch between **Fully inside** (the class fits entirely in your window) and **Overlaps** (the class meets at least partly in your window). |
| §3.1 | **Max seats, no rooms** | Each result shows max seats and CRN, like counts. Remaining seats are not shown. Counts doesn't list classrooms, so the demo doesn't show rooms either. |
| §3.1 | **Two kinds of labs** | Search "comp 131": its labs (sections 1-1, 1-2, 2-1) have their own CRN and 0 units. Search "phys 310": its extra Tuesday session sits under the same CRN as the MWF lecture. |
| §3.2 | **Course detail + RateMyClass buttons** | Click any course. "See ratings for this class / professor" open a **new browser tab** (a placeholder page, since RateMyClass isn't live yet). |
| §3.3 | **Favorites & collections** | Click **☆ Save** on a result or a section. Pick a collection or create and name one ("Spring 2027"). Manage them on **Collections**: rename, delete, remove, move between collections. |
| §3.4 | **Visualizer with conflict display** | Save COMP 131-1 and MATH 120-1 (Fall 2026), go to **Visualizer**, and drag both onto the calendar (or press **+**). They overlap, so they sit side by side with a red outline and a conflict summary. Try **+ New schedule** to keep alternative plans. When you're happy, click **★ Use this as the final schedule** (signed in). Change the schedule later and the button becomes **Update final schedule**, which replaces the old final version. |
| §3.4 | **Add to Google Calendar / Download .ics** | On a course detail page, each section has **Add to Google Calendar**, which opens Google Calendar in a new tab with the class prefilled (just click Save; no Google permissions are needed). It also has **⤓ .ics**. In the visualizer, **Download schedule (.ics)** exports the whole schedule for Apple or Google Calendar, and each course has its own Google Calendar link. Type a room next to any meeting time to include it in exports. Otherwise, add it in Google Calendar and choose "All events". A lab or extra session is its own event with its own room. Oxy class dates and no-class days come from the official academic calendar (see below); the .ics skips them, and Google links list them in the description. Caltech quarter dates are still mock. |
| §3.5 | **Guest vs. signed in** | As a guest, data disappears when you close the tab. Save something, then **Sign in** (any name + an `@oxy.edu` email): you'll be offered to **import** your guest data. Signed-in data persists across visits. |
| §3.5 | **Profile: year, one or more majors (incl. 3-2 tracks), course history** | **Profile** page. Add as many majors as you like (double major, or a major plus a "3-2 Engineering" track); remove one with ✕. To add a past course, pick the **term taken**, then type to match the course. |
| §3.5 | **My Courses** | Signed in → **My Courses**. It shows your final schedule for each planning term (with room fields, Google Calendar links and an .ics download) and your past courses grouped by term. |
| §3.6 | **Recommendation sidebar** | Signed in → collapsible panel on the right. Each recommendation group expands or collapses on its own (plus *Expand all* / *Collapse all*). Try setting your profile to *first-year + Physics — 3-2 Engineering* → FYS + major + 3-2 list + missing Cores. Or try *junior + Computer Science + Mathematics* → one course group per major, and junior seminars **only from the student's own majors** (switch to Spring 2027 to also see the Math one). Switch the term to **Spring 2026 (past)** → no recommendations. |
| §3.7 | **Caltech courses** | Search for something (e.g., keyword "economics", which matches both Oxy and Caltech courses), then toggle **Oxy / Caltech / Oxy + Caltech** to narrow the results. Caltech courses carry a badge and a quarter tag (Caltech uses quarters, so dates don't fully line up with Oxy semesters). |

Use **Reset demo data** in the footer to start over.

---

## How it's built

- **Vite + React 18 + TypeScript**, **React Router**, **Tailwind CSS v4**. Drag and drop uses the native HTML5 API.
- Runs in **Docker** (`node:22-alpine`). Only `src/` and a few config files are mounted (read-only) for hot reload.
- **Mock data** lives in `src/data/`. All data access goes through `src/api/`, so a real backend can replace the mock layer later without changing the UI.
- **Academic calendar:** Oxy's first and last day of classes and no-class days live in `src/data/academic-calendar.json`. The file is generated from the official catalog pages by `scripts/scrape-academic-calendar.mjs`, which cross-checks every date against the weekday the table lists. To refresh it (for example, when a new catalog year is published), run the command below, review the diff, and commit it:

  ```bash
  docker run --rm -v "$PWD":/app -w /app node:22.12.0-alpine node scripts/scrape-academic-calendar.mjs
  ```

- Mock persistence: guests use `sessionStorage` (cleared when the tab closes), signed-in users use `localStorage` (kept between visits).

```
src/
├─ data/         mock terms, departments, instructors, courses, sections, Cores, majors (+ 3-2 lists)
├─ api/          catalog search/filter, RateMyClass URL templates (configurable)
├─ lib/          fuzzy matching, overlap layout for the visualizer, recommendation rules
├─ state/        app state: user, collections, schedules, profile, guest → account import
├─ components/   Combobox (dropdown + type-to-match), badges, favorite dialog, sidebar, layout
└─ pages/        Search, Course detail, Collections, Visualizer, Profile, Sign in, RateMyClass placeholder
```

---

## Contributing

Follow the team Git SOP: Issue → branch → PR → review → squash merge.

> **IF YOU ARE USING CODING AGENTS, DO NOT LET THEM COMMIT OR PUSH FOR YOU.**
> If you do, the AI will show up as a collaborator on GitHub. Review the changes yourself, then `git add`, `git commit`, and `git push` yourself.
