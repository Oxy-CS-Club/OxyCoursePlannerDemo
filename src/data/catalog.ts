// MOCK DATA for the demo. Course titles, instructors, times and rooms are
// illustrative only and are NOT the official Oxy or Caltech schedule.
import ACADEMIC_CALENDAR from "./academic-calendar.json";
import type { CaltechQuarter, Course, DateSpan, Day, Department, Instructor, Meeting, Section, Term } from "../types";

// Class dates and no-class days come from Oxy's official academic calendar,
// scraped by scripts/scrape-academic-calendar.mjs into academic-calendar.json
// (reviewed and committed; the app never scrapes at runtime).
const OFFICIAL = ACADEMIC_CALENDAR.terms as Record<string, { source: string; firstDay: string; lastDay: string; noClass: DateSpan[] }>;
const official = (termId: string) => ({
  startDate: OFFICIAL[termId].firstDay,
  endDate: OFFICIAL[termId].lastDay,
  breaks: OFFICIAL[termId].noClass,
  calendarSource: OFFICIAL[termId].source,
});

export const TERMS: Term[] = [
  { id: "SP26", name: "Spring 2026", status: "past", caltechQuarters: ["WI", "SP"], ...official("SP26") },
  { id: "FA26", name: "Fall 2026", status: "current", caltechQuarters: ["FA"], ...official("FA26") },
  { id: "SP27", name: "Spring 2027", status: "future", caltechQuarters: ["WI", "SP"], ...official("SP27") },
];

/** MOCK Caltech quarter dates (Caltech has its own academic calendar, not scraped in the demo). */
export const CALTECH_QUARTER_DATES: Record<string, Partial<Record<CaltechQuarter, DateSpan & { breaks: DateSpan[] }>>> = {
  SP26: {
    WI: { start: "2026-01-05", end: "2026-03-20", breaks: [] },
    SP: { start: "2026-03-30", end: "2026-06-12", breaks: [] },
  },
  FA26: { FA: { start: "2026-09-28", end: "2026-12-11", breaks: [{ start: "2026-11-26", end: "2026-11-27", name: "Thanksgiving" }] } },
  SP27: {
    WI: { start: "2027-01-04", end: "2027-03-19", breaks: [] },
    SP: { start: "2027-03-29", end: "2027-06-11", breaks: [] },
  },
};

/** Terms students can pick when recording courses they already took (history only). */
export const HISTORY_TERMS: { id: string; name: string }[] = [
  { id: "FA23", name: "Fall 2023" },
  { id: "SP24", name: "Spring 2024" },
  { id: "FA24", name: "Fall 2024" },
  { id: "SP25", name: "Spring 2025" },
  { id: "FA25", name: "Fall 2025" },
  { id: "SP26", name: "Spring 2026" },
  { id: "FA26", name: "Fall 2026" },
];
export const HISTORY_TERM_NAME = Object.fromEntries(HISTORY_TERMS.map((t) => [t.id, t.name])) as Record<string, string>;

export const QUARTER_NAMES = { FA: "Fall quarter", WI: "Winter quarter", SP: "Spring quarter" } as const;

export const DEPARTMENTS: Department[] = [
  { code: "FYS", name: "First-Year Seminar", institution: "Oxy", isSubject: true },
  { code: "ARTH", name: "Art History", institution: "Oxy" },
  { code: "ARTS", name: "Studio Art", institution: "Oxy" },
  { code: "BIO", name: "Biology", institution: "Oxy" },
  { code: "CHEM", name: "Chemistry", institution: "Oxy" },
  { code: "COMP", name: "Computer Science", institution: "Oxy" },
  { code: "DWA", name: "Diplomacy & World Affairs", institution: "Oxy" },
  { code: "ECON", name: "Economics", institution: "Oxy" },
  { code: "ENGL", name: "English", institution: "Oxy" },
  { code: "HIST", name: "History", institution: "Oxy" },
  { code: "MATH", name: "Mathematics", institution: "Oxy" },
  { code: "MUSC", name: "Music", institution: "Oxy" },
  { code: "PHYS", name: "Physics", institution: "Oxy" },
  { code: "POLS", name: "Politics", institution: "Oxy" },
  { code: "CHIN", name: "Chinese", institution: "Oxy" },
  { code: "FREN", name: "French", institution: "Oxy" },
  { code: "SPAN", name: "Spanish", institution: "Oxy" },
  { code: "THEA", name: "Theater & Performance Studies", institution: "Oxy" },
  { code: "CS", name: "Computing + Mathematical Sciences", institution: "Caltech" },
  { code: "Ma", name: "Mathematics", institution: "Caltech" },
  { code: "Ph", name: "Physics", institution: "Caltech" },
  { code: "EE", name: "Electrical Engineering", institution: "Caltech" },
  { code: "ME", name: "Mechanical Engineering", institution: "Caltech" },
  { code: "Ec", name: "Economics", institution: "Caltech" },
];

const I = (id: string, name: string, institution: Instructor["institution"] = "Oxy"): Instructor => ({ id, name, institution });

export const INSTRUCTORS: Instructor[] = [
  I("hernandez", "Elena Hernández"),
  I("kim", "David Kim"),
  I("rahman", "Aisha Rahman"),
  I("whitfield", "Thomas Whitfield"),
  I("chen", "Mei-Ling Chen"),
  I("ortiz", "Rafael Ortiz"),
  I("goldberg", "Sarah Goldberg"),
  I("mensah", "Kwame Mensah"),
  I("bianchi", "Laura Bianchi"),
  I("tanaka", "Hiroshi Tanaka"),
  I("petrova", "Nadia Petrova"),
  I("brooks", "Samuel Brooks"),
  I("moreau", "Isabel Moreau"),
  I("okafor", "Daniel Okafor"),
  I("liu", "Grace Liu"),
  I("nguyen", "Minh Nguyen"),
  I("feldman", "Robert Feldman", "Caltech"),
  I("kowalski", "Anna Kowalski", "Caltech"),
  I("huang", "Victor Huang", "Caltech"),
  I("park", "Jennifer Park", "Caltech"),
];

type C = Omit<Course, "id" | "tags" | "prereqs" | "units"> & Partial<Pick<Course, "tags" | "prereqs" | "units">>;
const course = (c: C): Course => ({
  id: `${c.institution}-${c.dept}-${c.number}`.toLowerCase().replace(/\s+/g, ""),
  units: c.institution === "Oxy" ? 4 : 9,
  prereqs: "None",
  tags: [],
  ...c,
});

export const COURSES: Course[] = [
  // ---- First-Year Seminars (listed as their own subject) ----
  course({ institution: "Oxy", dept: "FYS", number: "101", title: "Cities and Memory: Reading Los Angeles", cores: ["CPUD"], tags: ["fys"], description: "How neighborhoods, monuments and freeways shape what a city remembers and forgets. Writing-intensive seminar for first-year students." }),
  course({ institution: "Oxy", dept: "FYS", number: "106", title: "Science Fact and Science Fiction", cores: [], tags: ["fys"], description: "From Frankenstein to climate fiction: what stories about science reveal about the people who tell them." }),
  course({ institution: "Oxy", dept: "FYS", number: "112", title: "Music and Protest", cores: ["CPFA"], tags: ["fys"], description: "Songs as political action, from spirituals to hip-hop. Includes listening labs and a short creative project." }),
  // ---- Computer Science ----
  course({ institution: "Oxy", dept: "COMP", number: "131", title: "Fundamentals of Computer Science", cores: ["CPMS"], description: "Problem solving, abstraction and programming in Python. No prior experience required." }),
  course({ institution: "Oxy", dept: "COMP", number: "229", title: "Data Structures", cores: [], prereqs: "COMP 131", description: "Lists, trees, hash tables, graphs, and the analysis of algorithms." }),
  course({ institution: "Oxy", dept: "COMP", number: "390", title: "Junior Seminar in Computer Science", cores: [], tags: ["junior-seminar"], prereqs: "COMP 229; junior standing", description: "Reading research papers, technical writing and preparation for the senior comprehensive project." }),
  course({ institution: "Oxy", dept: "COMP", number: "490", title: "Senior Comprehensive Project", cores: [], tags: ["senior-seminar"], prereqs: "COMP 390", description: "Year-long independent software or research project with faculty advising." }),
  // ---- Mathematics ----
  course({ institution: "Oxy", dept: "MATH", number: "120", title: "Calculus I", cores: ["CPMS"], description: "Limits, derivatives and integrals with applications." }),
  course({ institution: "Oxy", dept: "MATH", number: "212", title: "Multivariable Calculus", cores: ["CPMS"], prereqs: "MATH 120 or equivalent", description: "Vectors, partial derivatives, multiple integrals and vector calculus." }),
  course({ institution: "Oxy", dept: "MATH", number: "214", title: "Linear Algebra", cores: ["CPMS"], prereqs: "MATH 120", description: "Vector spaces, matrices, linear transformations and eigenvalues." }),
  course({ institution: "Oxy", dept: "MATH", number: "395", title: "Junior Seminar in Mathematics", cores: [], tags: ["junior-seminar"], prereqs: "MATH 214; junior standing", description: "Mathematical communication and exploration of a research topic." }),
  // ---- Physics ----
  course({ institution: "Oxy", dept: "PHYS", number: "120", title: "Mechanics", cores: ["CPMS", "CPLS"], prereqs: "MATH 120 (may be concurrent)", description: "Newtonian mechanics with a weekly laboratory." }),
  course({ institution: "Oxy", dept: "PHYS", number: "220", title: "Electricity and Magnetism", cores: ["CPLS"], prereqs: "PHYS 120, MATH 212 (may be concurrent)", description: "Electric and magnetic fields, circuits and Maxwell's equations, with lab." }),
  course({ institution: "Oxy", dept: "PHYS", number: "310", title: "Mathematical Methods in Physics", cores: ["CPMS"], prereqs: "PHYS 220, MATH 214", description: "Vector calculus, linear algebra and differential equations for physics. Meets MWF plus an extra Tuesday session under the same CRN." }),
  course({ institution: "Oxy", dept: "PHYS", number: "490", title: "Senior Seminar in Physics", cores: [], tags: ["senior-seminar"], prereqs: "Senior standing", description: "Senior research presentations and the physics comprehensive requirement." }),
  // ---- Natural sciences ----
  course({ institution: "Oxy", dept: "CHEM", number: "120", title: "General Chemistry", cores: ["CPMS", "CPLS"], description: "Atomic structure, bonding, reactions and equilibrium, with lab." }),
  course({ institution: "Oxy", dept: "BIO", number: "110", title: "Organismal Biology", cores: ["CPLS"], description: "Form and function of organisms, with field and laboratory work." }),
  // ---- Social sciences ----
  course({ institution: "Oxy", dept: "ECON", number: "101", title: "Principles of Economics", cores: [], description: "Introduction to micro- and macroeconomic reasoning." }),
  course({ institution: "Oxy", dept: "ECON", number: "250", title: "Economic Development in Latin America", cores: ["CPRF"], prereqs: "ECON 101", description: "Growth, inequality and policy in Latin American economies." }),
  course({ institution: "Oxy", dept: "ECON", number: "395", title: "Junior Seminar in Economics", cores: [], tags: ["junior-seminar"], prereqs: "ECON 101; junior standing", description: "Research design and writing in economics." }),
  course({ institution: "Oxy", dept: "POLS", number: "230", title: "Immigration Politics in the U.S.", cores: ["CPUD"], description: "Policy, citizenship and immigrant political participation in the United States." }),
  course({ institution: "Oxy", dept: "DWA", number: "101", title: "Global Governance and Migration", cores: ["CPGC"], description: "How states and international institutions manage the movement of people." }),
  // ---- Humanities & arts ----
  course({ institution: "Oxy", dept: "HIST", number: "101", title: "The Ancient Mediterranean World", cores: ["CPPE", "CPRF"], description: "Greece, Rome, Egypt and their neighbors, ca. 800 BCE–500 CE." }),
  course({ institution: "Oxy", dept: "HIST", number: "270", title: "Race and Civil Rights in the U.S.", cores: ["CPUD"], description: "Movements for racial justice from Reconstruction to the present." }),
  course({ institution: "Oxy", dept: "HIST", number: "380", title: "Junior Seminar in History", cores: [], tags: ["junior-seminar"], prereqs: "Junior standing", description: "Historiography and research methods." }),
  course({ institution: "Oxy", dept: "ARTH", number: "150", title: "Renaissance Art and Architecture", cores: ["CPPE", "CPFA"], description: "Painting, sculpture and building in Italy and northern Europe, 1300–1600." }),
  course({ institution: "Oxy", dept: "ARTH", number: "202", title: "Arts of East Asia", cores: ["CPFA", "CPRF"], description: "Visual culture of China, Korea and Japan from antiquity to today." }),
  course({ institution: "Oxy", dept: "ARTS", number: "101", title: "Drawing I", cores: ["CPFA"], description: "Observational drawing in a studio setting." }),
  course({ institution: "Oxy", dept: "MUSC", number: "101", title: "Music in Global Contexts", cores: ["CPFA", "CPGC"], description: "Musical traditions as they travel and transform across the world." }),
  course({ institution: "Oxy", dept: "MUSC", number: "140", title: "Jazz and American Identity", cores: ["CPFA", "CPUD"], description: "Jazz history and its role in debates about race and nation." }),
  // ---- Fine Arts partial (CFAP): 1–2 unit courses that add up to the 4-unit Fine Arts requirement ----
  course({ institution: "Oxy", dept: "MUSC", number: "131", title: "Improvisation", units: 1, cores: ["CFAP"], description: "Group improvisation across styles. 1 unit; counts toward the 4 units of Fine Arts." }),
  course({ institution: "Oxy", dept: "MUSC", number: "150", title: "Chamber Ensemble", units: 1, cores: ["CFAP"], description: "Rehearsal and performance in small ensembles. 1 unit; counts toward the 4 units of Fine Arts." }),
  course({ institution: "Oxy", dept: "THEA", number: "105", title: "Production Practicum", units: 2, cores: ["CFAP"], description: "Hands-on work on a department production. 2 units; counts toward the 4 units of Fine Arts." }),
  // ---- Language Proficiency (LANG): two courses, or a passed exemption test ----
  course({ institution: "Oxy", dept: "SPAN", number: "101", title: "Elementary Spanish I", cores: ["LANG"], description: "Introduction to spoken and written Spanish." }),
  course({ institution: "Oxy", dept: "SPAN", number: "102", title: "Elementary Spanish II", cores: ["LANG"], prereqs: "SPAN 101 or placement", description: "Continuation of SPAN 101." }),
  course({ institution: "Oxy", dept: "FREN", number: "101", title: "Elementary French I", cores: ["LANG"], description: "Introduction to spoken and written French." }),
  course({ institution: "Oxy", dept: "CHIN", number: "101", title: "Elementary Chinese I", cores: ["LANG"], description: "Introduction to Mandarin Chinese." }),
  course({ institution: "Oxy", dept: "ENGL", number: "210", title: "Shakespeare", cores: ["CPPE"], description: "Major comedies, histories and tragedies in performance and print." }),
  // ---- Caltech (cross-registration) ----
  course({ institution: "Caltech", dept: "CS", number: "1", title: "Introduction to Computer Programming", cores: [], description: "Programming fundamentals for scientists and engineers." }),
  course({ institution: "Caltech", dept: "Ma", number: "2", title: "Differential Equations", cores: [], prereqs: "Calculus", description: "Ordinary differential equations and their applications." }),
  course({ institution: "Caltech", dept: "Ph", number: "2", title: "Waves, Quantum Mechanics and Statistical Physics", cores: [], prereqs: "Ph 1 or PHYS 120 + PHYS 220", description: "Second-year physics sequence." }),
  course({ institution: "Caltech", dept: "EE", number: "44", title: "Circuits and Systems", cores: [], prereqs: "Ma 2 (may be concurrent)", description: "Analysis of linear circuits and signals." }),
  course({ institution: "Caltech", dept: "ME", number: "11", title: "Thermal Science", cores: [], prereqs: "Ph 1", description: "Thermodynamics and its engineering applications." }),
  course({ institution: "Caltech", dept: "Ec", number: "11", title: "Introduction to Economics", cores: [], description: "Markets, prices and strategic behavior." }),
];

export const COURSE_BY_ID = Object.fromEntries(COURSES.map((c) => [c.id, c])) as Record<string, Course>;
export const INSTRUCTOR_BY_ID = Object.fromEntries(INSTRUCTORS.map((i) => [i.id, i])) as Record<string, Instructor>;
export const TERM_BY_ID = Object.fromEntries(TERMS.map((t) => [t.id, t])) as Record<string, Term>;

// ---- Sections ----
const m = (days: string, start: string, end: string, kind?: Meeting["kind"]): Meeting => ({
  days: days.split("") as Day[],
  start,
  end,
  kind,
});

let crn = 10000;
const s = (
  courseId: string,
  termId: string,
  sectionNo: string,
  instructorIds: string[],
  meetings: Meeting[],
  capacity: number,
  caltechQuarter?: Section["caltechQuarter"],
  isLab?: boolean,
): Section => ({
  id: `${courseId}-${termId}-${sectionNo}`.toLowerCase(),
  courseId,
  termId,
  sectionNo,
  crn: String(++crn),
  instructorIds,
  meetings,
  capacity,
  caltechQuarter,
  isLab,
});
/** A lab section with its own CRN, numbered like counts: lecture "1" → labs "1-1", "1-2". */
const lab = (courseId: string, termId: string, sectionNo: string, instructorIds: string[], meeting: Meeting, capacity: number) =>
  s(courseId, termId, sectionNo, instructorIds, [meeting], capacity, undefined, true);

export const SECTIONS: Section[] = [
  // ===== Fall 2026 (current) =====
  s("oxy-fys-101", "FA26", "1", ["hernandez"], [m("TR", "10:30", "11:55")], 16),
  s("oxy-fys-106", "FA26", "1", ["nguyen"], [m("MW", "13:30", "14:55")], 16),
  s("oxy-fys-112", "FA26", "1", ["moreau"], [m("TR", "13:30", "14:55")], 16),
  // COMP 131 and MATH 120-01 deliberately overlap (MWF 10:30).
  // Labs with their own CRN, like counts lists COMP 131 (sections "1-1", "1-2", 0 units).
  s("oxy-comp-131", "FA26", "1", ["kim"], [m("MWF", "10:30", "11:25")], 30),
  lab("oxy-comp-131", "FA26", "1-1", ["kim"], m("T", "08:35", "11:25"), 18),
  lab("oxy-comp-131", "FA26", "1-2", ["kim"], m("T", "13:20", "16:10"), 18),
  s("oxy-comp-131", "FA26", "2", ["liu"], [m("MWF", "13:30", "14:25")], 30),
  lab("oxy-comp-131", "FA26", "2-1", ["liu"], m("R", "08:35", "11:25"), 18),
  s("oxy-comp-229", "FA26", "1", ["kim"], [m("TR", "09:00", "10:25")], 28),
  s("oxy-comp-390", "FA26", "1", ["liu"], [m("W", "15:00", "17:50")], 18),
  s("oxy-math-120", "FA26", "1", ["petrova"], [m("MWF", "10:30", "11:25")], 32),
  s("oxy-math-120", "FA26", "2", ["brooks"], [m("MWF", "09:35", "10:30")], 32),
  s("oxy-math-212", "FA26", "1", ["brooks"], [m("TR", "10:30", "11:55")], 30),
  s("oxy-math-214", "FA26", "1", ["petrova"], [m("MWF", "11:45", "12:40")], 30),
  // PHYS 120 lab 1-1 on Wednesday afternoon overlaps COMP 131-2 and FYS 106.
  s("oxy-phys-120", "FA26", "1", ["tanaka"], [m("MWF", "08:30", "09:25")], 24),
  lab("oxy-phys-120", "FA26", "1-1", ["tanaka"], m("W", "13:30", "16:20"), 12),
  lab("oxy-phys-120", "FA26", "1-2", ["tanaka"], m("R", "13:30", "16:20"), 12),
  // An extra weekly meeting under the SAME CRN, like PHYS 310 on counts (MWF + Tue).
  s("oxy-phys-310", "FA26", "1", ["tanaka"], [m("MWF", "09:00", "09:55"), m("T", "10:05", "11:25")], 20),
  s("oxy-phys-490", "FA26", "1", ["tanaka"], [m("F", "14:00", "15:30")], 15),
  s("oxy-chem-120", "FA26", "1", ["okafor"], [m("TR", "08:00", "09:25")], 40),
  lab("oxy-chem-120", "FA26", "1-1", ["okafor"], m("T", "13:30", "16:20"), 20),
  lab("oxy-chem-120", "FA26", "1-2", ["okafor"], m("R", "13:30", "16:20"), 20),
  s("oxy-bio-110", "FA26", "1", ["okafor"], [m("MWF", "11:45", "12:40", "Lecture"), m("R", "13:30", "16:20", "Lab")], 36),
  s("oxy-econ-101", "FA26", "1", ["rahman"], [m("MWF", "09:35", "10:30")], 40),
  s("oxy-econ-250", "FA26", "1", ["ortiz"], [m("TR", "15:05", "16:30")], 25),
  s("oxy-econ-395", "FA26", "1", ["rahman"], [m("R", "18:00", "20:50")], 16),
  s("oxy-pols-230", "FA26", "1", ["mensah"], [m("MW", "15:05", "16:30")], 28),
  s("oxy-dwa-101", "FA26", "1", ["mensah"], [m("TR", "09:00", "10:25")], 35),
  s("oxy-hist-101", "FA26", "1", ["whitfield"], [m("MWF", "11:45", "12:40")], 30),
  // ARTH 150 and HIST 270 partially overlap on Tue/Thu afternoons.
  s("oxy-hist-270", "FA26", "1", ["goldberg"], [m("TR", "14:00", "15:25")], 30),
  s("oxy-arth-150", "FA26", "1", ["bianchi"], [m("TR", "13:30", "14:55")], 30),
  s("oxy-arts-101", "FA26", "1", ["moreau"], [m("MW", "09:00", "11:50")], 14),
  s("oxy-musc-101", "FA26", "1", ["chen"], [m("MWF", "13:30", "14:25")], 35),
  s("oxy-musc-140", "FA26", "1", ["chen"], [m("TR", "15:05", "16:30")], 30),
  s("oxy-engl-210", "FA26", "1", ["whitfield"], [m("TR", "10:30", "11:55")], 25),
  s("oxy-musc-131", "FA26", "1", ["chen"], [m("T", "19:20", "21:45")], 15),
  s("oxy-musc-150", "FA26", "1", ["chen"], [m("R", "16:00", "17:50")], 20),
  s("oxy-thea-105", "FA26", "1", ["moreau"], [m("MW", "16:00", "17:50")], 18),
  s("oxy-span-101", "FA26", "1", ["ortiz"], [m("MTWR", "09:00", "09:55")], 18),
  s("oxy-fren-101", "FA26", "1", ["bianchi"], [m("MTWR", "11:45", "12:40")], 18),
  s("oxy-chin-101", "FA26", "1", ["liu"], [m("MTWR", "13:30", "14:25")], 18),
  s("caltech-cs-1", "FA26", "1", ["feldman"], [m("MWF", "13:00", "13:55")], 120, "FA"),
  s("caltech-ma-2", "FA26", "1", ["kowalski"], [m("MWF", "10:00", "10:55")], 80, "FA"),
  s("caltech-ph-2", "FA26", "1", ["huang"], [m("MWF", "11:00", "11:55")], 90, "FA"),
  s("caltech-ec-11", "FA26", "1", ["park"], [m("TR", "10:30", "11:55")], 60, "FA"),

  // ===== Spring 2027 (future) =====
  s("oxy-fys-106", "SP27", "1", ["nguyen"], [m("TR", "09:00", "10:25")], 16),
  s("oxy-comp-131", "SP27", "1", ["liu"], [m("MWF", "10:30", "11:25")], 30),
  lab("oxy-comp-131", "SP27", "1-1", ["liu"], m("T", "08:35", "11:25"), 18),
  s("oxy-comp-229", "SP27", "1", ["kim"], [m("MWF", "13:30", "14:25")], 28),
  s("oxy-comp-490", "SP27", "1", ["kim"], [m("W", "15:00", "17:50")], 18),
  s("oxy-math-120", "SP27", "1", ["brooks"], [m("MWF", "09:35", "10:30")], 32),
  s("oxy-math-212", "SP27", "1", ["petrova"], [m("MWF", "10:30", "11:25")], 30),
  s("oxy-math-214", "SP27", "1", ["brooks"], [m("TR", "10:30", "11:55")], 30),
  s("oxy-math-395", "SP27", "1", ["petrova"], [m("R", "15:05", "17:50")], 15),
  s("oxy-phys-220", "SP27", "1", ["tanaka"], [m("MWF", "08:30", "09:25")], 24),
  lab("oxy-phys-220", "SP27", "1-1", ["tanaka"], m("R", "13:30", "16:20"), 12),
  s("oxy-chem-120", "SP27", "1", ["okafor"], [m("TR", "08:00", "09:25")], 40),
  lab("oxy-chem-120", "SP27", "1-1", ["okafor"], m("W", "13:30", "16:20"), 20),
  s("oxy-econ-250", "SP27", "1", ["ortiz"], [m("MW", "15:05", "16:30")], 25),
  s("oxy-hist-380", "SP27", "1", ["goldberg"], [m("T", "15:05", "17:50")], 15),
  s("oxy-arth-202", "SP27", "1", ["bianchi"], [m("MW", "13:30", "14:55")], 30),
  s("oxy-musc-140", "SP27", "1", ["chen"], [m("TR", "13:30", "14:55")], 30),
  s("oxy-engl-210", "SP27", "1", ["whitfield"], [m("MWF", "11:45", "12:40")], 25),
  s("oxy-musc-131", "SP27", "1", ["chen"], [m("T", "19:20", "21:45")], 15),
  s("oxy-thea-105", "SP27", "1", ["moreau"], [m("TR", "16:00", "17:50")], 18),
  s("oxy-span-102", "SP27", "1", ["ortiz"], [m("MTWR", "09:00", "09:55")], 18),
  s("oxy-fren-101", "SP27", "1", ["bianchi"], [m("MTWR", "11:45", "12:40")], 18),
  s("oxy-pols-230", "SP27", "1", ["mensah"], [m("TR", "10:30", "11:55")], 28),
  s("oxy-dwa-101", "SP27", "1", ["rahman", "mensah"], [m("MWF", "09:35", "10:30")], 35),
  s("caltech-ee-44", "SP27", "1", ["feldman"], [m("MWF", "14:00", "14:55")], 70, "WI"),
  s("caltech-me-11", "SP27", "1", ["huang"], [m("TR", "09:00", "10:25")], 60, "WI"),
  s("caltech-ph-2", "SP27", "1", ["huang"], [m("MWF", "11:00", "11:55")], 90, "SP"),
  s("caltech-ma-2", "SP27", "1", ["kowalski"], [m("TR", "13:00", "14:25")], 80, "SP"),

  // ===== Spring 2026 (past) =====
  s("oxy-comp-131", "SP26", "1", ["kim"], [m("MWF", "10:30", "11:25")], 30),
  s("oxy-math-120", "SP26", "1", ["brooks"], [m("MWF", "09:35", "10:30")], 32),
  s("oxy-hist-270", "SP26", "1", ["goldberg"], [m("TR", "13:30", "14:55")], 30),
  s("oxy-arts-101", "SP26", "1", ["moreau"], [m("TR", "09:00", "11:50")], 14),
  s("caltech-cs-1", "SP26", "1", ["feldman"], [m("MWF", "13:00", "13:55")], 120, "WI"),
];

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((x) => [x.id, x])) as Record<string, Section>;
