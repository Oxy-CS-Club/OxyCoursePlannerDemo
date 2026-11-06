# Oxy Course Planner & Schedule Visualizer — Project Specification

> Version: v0.1 (early planning draft) · Date: 2026-11-05 · Owner: Barry
> This document covers *what* we are building, *for whom*, and *to what standard*.

## 1. Background and Goals

This project is a course planning and schedule visualization website built exclusively for students at Occidental College (Oxy). Today, Oxy students planning their classes jump between several places: the official Schedule of Classes (counts.oxy.edu), Coursicle, and Subitize. The official page is the most authoritative source but is awkward to search. The third-party tools search better but know nothing about Oxy's own Core requirements, the 3-2 engineering program, or cross-registration at Caltech. We want one tool designed only for Oxy, where students can search for courses, save them, build schedules, look up ratings, and get personalized recommendations in a single place. 

A team of 6–8 students will build the project, collaborating on GitHub, each with their own free personal GitHub account. Apart from the domain name, which costs money, every part of the project must use free services: hosting, database, backups, and CI. Once launched, the site must reliably support up to a few thousand concurrent users, which covers essentially the whole Oxy student body hitting the site during registration week. Development environments are managed with Docker and uv, and the backend is written in Python. For the public launch we will choose a free and stable server, and the database must be backed up automatically on a schedule to a location outside that server.

## 2. Target Users

The primary users are current Oxy undergraduates: first-years, upper-class students, students considering or already in the 3-2 engineering program (three years at Oxy plus two years at a partner engineering school), and students who want to cross-register at Caltech. The secondary users are anonymous visitors, for example students who haven't decided whether to sign up or who just want to look up one course quickly. Visitors can search, view course details, and build a temporary schedule, but nothing they do is saved.

## 3. Functional Requirements

### 3.1 Course Search

Search is the entry point of the site. The user first picks a term (e.g., Fall 2026 or Spring 2027) and can then combine the following filters: department (First-Year Seminar is listed as its own "subject" in the department list, so first-years can browse all FYS courses directly), Core category, professor, and a keyword search on course number or title. Every filter must support two ways of entering a value. Users can pick from a dropdown list, or they can type, and the system fuzzy-matches as they type and suggests candidates, so nobody has to scroll through a long list looking for one entry. This matters most for professor search, because there are many professors and users often remember only part of a first or last name.

Core search must cover every Oxy Core Program requirement that can be attached to a course. According to the 2025–2026 Oxy catalog and the college's August 2025 Core Requirements overview, there are currently seven filterable Core categories. Three of them are U.S. Diversity, Regional Focus, and Global Connections. Together these make up the Cultural Studies area, and a single course belongs to at most one of the three. The other four are Pre-1800 (code CPPE), Fine Arts (code CPFA), Math/Science (code CPMS), and Lab Science (code CPLS). First-Year Seminar (CSP) is not a Core filter. As noted above, it appears as a "subject" in the department filter, and the recommendation feature also has to recognize it separately. Users may select up to two Core categories at once, and the system returns courses that satisfy both (for example, a course that is both Pre-1800 and Fine Arts). This matches the college rule that a single course can satisfy at most two Core requirements. The exact Core categories and codes follow each year's catalog, so the system must let us update this list without changing code.

Until the user sets at least one search condition, the page lists no courses and simply prompts the user to type a keyword or pick a filter, so they aren't greeted by a long, cluttered list. The institution filter only narrows a search; switching it on its own does not count as a search condition. Results are shown as a list. Each row shows at least the course number, title, units, instructor(s), meeting times and location, Core tags, institution (Oxy or Caltech), and maximum seats (seat capacity). The first version shows only each course's seat capacity, not remaining seats, because remaining seats would require frequent, high-speed syncing with the college's system. Live remaining seats is a future feature, and the data model reserves a field for it. Clicking a row opens the course detail page. Results are listed one section per row, and every row has a save button. The selected term is shared across the whole site, so search, course details, the visualizer, and the recommendation sidebar always show the same term.

### 3.2 Course Detail Page and RateMyClass Links

The course detail page shows everything about the course for the selected term: description, prerequisites, all sections with their times, locations, and instructors, and Core tags. The page has two buttons, labeled "See ratings for this class" and "See ratings for this professor." Clicking one opens the matching course or professor page on the RateMyClass website in a new browser tab, so the course detail page stays open and the user can return to planning after reading the ratings. RateMyClass has not been built yet, and its data format, URL scheme, and API are all undecided, so this feature comes last. Until then, the buttons stay on the page (disabled for now, or pointing to a placeholder page), and we connect the real links once RateMyClass is settled. The rules for building these URLs must be configurable, not hard-coded. If a course has several instructors this term, each instructor gets their own ratings button. If the course isn't offered this term, the detail page says which terms it is offered in.

### 3.3 Favorites and Collections

Users can favorite a course, down to a specific section, from both the search results list and the course detail page. When favoriting, the user picks which collection to put the course in, or creates and names a new collection on the spot, such as "Spring 2027" or "Spring 2027 V2." Users can rename and delete collections, and they can remove a course from a collection or move it to another one. The same course can be in several collections at once, and saved courses are marked in the list. Collections supply the courses for the visualizer.

### 3.4 Schedule Visualizer

The visualizer is a weekly calendar view. The horizontal axis is Monday through Friday (plus weekends if needed), and the vertical axis is the time of day. One side of the page lists the user's collections and the courses in each, and the user can drag courses from any collection onto the calendar. Once placed, each course appears as a colored block at its meeting times.

When two or more courses overlap in time, the visualizer does not refuse to place them. Instead, it shows them side by side within that time slot and marks the conflict with a prominent color, such as a red border or red background. The reason is that students planning next semester often have two courses they both want that conflict, and they want to place both and compare the whole picture before deciding which one to drop. Users can remove a course from the calendar at any time and can save several alternative schedules.

The collections panel lists only courses from the selected term. Courses from other terms are shown as a count and can be placed after switching to that term. Besides dragging, users can click an add button next to a course to place it, which also works on phones where dragging is awkward. When there are conflicts, a summary above the calendar lists which courses conflict and on which days, and a list below the calendar shows every course in the current schedule with the total units. Schedules are saved per term, and each term can have several schedules that users can create, rename, delete, and switch between.

### 3.5 Accounts, Profile, and Course History

Students can create an account and log in. Anonymous visitors can use search, favorites, and the visualizer, but their data lives only in the current browsing session and is gone once the page is closed. Collections and schedules are stored on the server, and are still there the next time the user visits, only when the user is logged in. If a visitor built collections or schedules before logging in, the system offers to import that temporary data into the account at login. While browsing as a guest, a notice at the top of the page says that nothing will be saved and invites the user to log in. Accounts use an Oxy email address (@oxy.edu).

Once logged in, users can add the following to their profile: class year (first-year through senior), major, and courses they have already taken. When choosing a major, users must be able to choose a 3-2 engineering track as well as the regular majors. Entering past courses also supports type-to-match, not only picking from a long list. Students can list more than one major, such as a double major or a regular major plus a 3-2 track, and can add or remove majors at any time. The profile page also shows which Core categories the user has already satisfied, based on their course history.

### 3.6 Course Recommendation Sidebar

Logged-in users see a collapsible sidebar with course recommendations. Recommendations appear only for the current term and future terms. When the user is browsing a past term, the sidebar shows no recommendations. Recommendations are based on the user's major and course history. For the selected term, the sidebar lists the major courses the user can take, plus courses that cover Core categories the user has not yet satisfied.

The first version keeps the rules simple. For a regular major, it recommends courses from that major's course list that are offered this term and that the user hasn't taken, plus courses in Core categories the user still needs. Students on a 3-2 track also get courses from the 3-2 program's designated course list. First-year students are recommended First-Year Seminars. Upper-class students are recommended junior seminars, senior seminars, or similar upper-level seminars. Seminars are recommended only from the student's own major department(s). If an upper-class student hasn't entered a major yet, the sidebar recommends no seminars and asks them to add one. A student with several majors gets a separate group of recommendations for each major. If any of their majors is a 3-2 track, the sidebar also shows the 3-2 course list, which may include Caltech courses. For each Core category the student still needs, only a few representative courses are shown.

The top of the sidebar briefly explains what the recommendations are based on (year, majors, and number of past courses) and links to the profile page. If the profile is incomplete, the sidebar prompts the user to fill it in. Each recommendation group can be expanded or collapsed on its own, and the sidebar also offers "Expand all" and "Collapse all," so students can focus on the parts they care about.

The first version covers only this "recommend courses by major" layer. Later we could add tracking and recommendations for completing major requirements, and course requirements for specific focuses (concentrations) within a major. Both require reading each year's catalog, and the requirements may change every year, which is a lot of work, so we are not doing them now. The system design should still leave room for them.

### 3.7 Caltech Courses

Oxy students can cross-register for courses at Caltech. To make Caltech planning easier, every course list includes Caltech courses, clearly labeled with their institution. Users can filter by institution (Oxy only, Caltech only, or both), and they can favorite Caltech courses and drag them into the visualizer just like Oxy courses. Caltech runs on quarters (fall, winter, spring) while Oxy runs on semesters. The system must map Caltech quarters onto Oxy semesters correctly (for example, Oxy's spring semester roughly corresponds to Caltech's winter and spring quarters) and tell users in the interface where the dates don't fully line up. The visualizer shows the same notice whenever a schedule includes Caltech courses.

## 4. Non-Functional Requirements

**Performance.** The site must handle a few thousand concurrent users during registration week, and course searches should respond in under one second.

**Cost.** Everything except the domain must be free, and we prefer free options that are stable and don't frequently sleep or cold-start.

**Data safety.** The database must be backed up automatically every day to storage outside the server, with several days of history kept, and we must check regularly that backups can actually be restored. Sensitive data such as passwords must never be stored in plain text, and no secrets may ever be committed to the repository.

**Data freshness.** Course data must be refreshed automatically from official Oxy and Caltech sources on a schedule, more often during registration periods.

**Usability.** The site must work on both phones and computers. On phones, the visualizer must at least be viewable.

**Maintainability.** The code must be highly modular, with one module per feature. Adding a feature should mostly mean adding files rather than editing shared code.

## 5. Collaboration Requirements

We collaborate on GitHub. Every change reaches `main` through the same flow: Issue → branch → Pull Request → review → squash merge. Tasks are assigned through GitHub Issues. Each Issue has an owner, acceptance criteria, and a due date, and Issues are grouped into two-week cycles (milestones), so it is always clear and traceable who is finishing what, and by when. The repository is modular from day one, so that two people rarely edit the same shared code at the same time and then conflict when they merge one after the other. The detailed task breakdown and timeline will come in a later planning document.

When team members use AI coding assistants (Claude Code, Copilot Agent, Cursor, etc.), **AI must never commit or push on your behalf.** If an AI makes a commit, it shows up as a co-author in the repository's contributor list on GitHub. Every commit and every push must be made by the team member personally.

## 6. Out of Scope for v1

The following are explicitly not part of the first version: live remaining seats (a field is reserved in the data model); full major-requirement tracking or degree audits; requirement recommendations for focuses within a major; building RateMyClass itself; direct integration with the college registration system (e.g., one-click enrollment); and native mobile apps.


