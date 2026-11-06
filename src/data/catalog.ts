// MOCK DATA for the demo. Course titles, instructors, times and rooms are
// illustrative only and are NOT the official Oxy or Caltech schedule.
import type { Course, Day, Department, Instructor, Meeting, Section, Term } from "../types";

export const TERMS: Term[] = [
  { id: "SP26", name: "Spring 2026", status: "past", caltechQuarters: ["WI", "SP"] },
  { id: "FA26", name: "Fall 2026", status: "current", caltechQuarters: ["FA"] },
  { id: "SP27", name: "Spring 2027", status: "future", caltechQuarters: ["WI", "SP"] },
];

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
  course({ institution: "Oxy", dept: "FYS", number: "101", title: "Cities and Memory: Reading Los Angeles", cores: ["USD"], tags: ["fys"], description: "How neighborhoods, monuments and freeways shape what a city remembers and forgets. Writing-intensive seminar for first-year students." }),
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
  course({ institution: "Oxy", dept: "PHYS", number: "490", title: "Senior Seminar in Physics", cores: [], tags: ["senior-seminar"], prereqs: "Senior standing", description: "Senior research presentations and the physics comprehensive requirement." }),
  // ---- Natural sciences ----
  course({ institution: "Oxy", dept: "CHEM", number: "120", title: "General Chemistry", cores: ["CPMS", "CPLS"], description: "Atomic structure, bonding, reactions and equilibrium, with lab." }),
  course({ institution: "Oxy", dept: "BIO", number: "110", title: "Organismal Biology", cores: ["CPLS"], description: "Form and function of organisms, with field and laboratory work." }),
  // ---- Social sciences ----
  course({ institution: "Oxy", dept: "ECON", number: "101", title: "Principles of Economics", cores: [], description: "Introduction to micro- and macroeconomic reasoning." }),
  course({ institution: "Oxy", dept: "ECON", number: "250", title: "Economic Development in Latin America", cores: ["RF"], prereqs: "ECON 101", description: "Growth, inequality and policy in Latin American economies." }),
  course({ institution: "Oxy", dept: "ECON", number: "395", title: "Junior Seminar in Economics", cores: [], tags: ["junior-seminar"], prereqs: "ECON 101; junior standing", description: "Research design and writing in economics." }),
  course({ institution: "Oxy", dept: "POLS", number: "230", title: "Immigration Politics in the U.S.", cores: ["USD"], description: "Policy, citizenship and immigrant political participation in the United States." }),
  course({ institution: "Oxy", dept: "DWA", number: "101", title: "Global Governance and Migration", cores: ["GC"], description: "How states and international institutions manage the movement of people." }),
  // ---- Humanities & arts ----
  course({ institution: "Oxy", dept: "HIST", number: "101", title: "The Ancient Mediterranean World", cores: ["CPPE", "RF"], description: "Greece, Rome, Egypt and their neighbors, ca. 800 BCE–500 CE." }),
  course({ institution: "Oxy", dept: "HIST", number: "270", title: "Race and Civil Rights in the U.S.", cores: ["USD"], description: "Movements for racial justice from Reconstruction to the present." }),
  course({ institution: "Oxy", dept: "HIST", number: "380", title: "Junior Seminar in History", cores: [], tags: ["junior-seminar"], prereqs: "Junior standing", description: "Historiography and research methods." }),
  course({ institution: "Oxy", dept: "ARTH", number: "150", title: "Renaissance Art and Architecture", cores: ["CPPE", "CPFA"], description: "Painting, sculpture and building in Italy and northern Europe, 1300–1600." }),
  course({ institution: "Oxy", dept: "ARTH", number: "202", title: "Arts of East Asia", cores: ["CPFA", "RF"], description: "Visual culture of China, Korea and Japan from antiquity to today." }),
  course({ institution: "Oxy", dept: "ARTS", number: "101", title: "Drawing I", cores: ["CPFA"], description: "Observational drawing in a studio setting." }),
  course({ institution: "Oxy", dept: "MUSC", number: "101", title: "Music in Global Contexts", cores: ["CPFA", "GC"], description: "Musical traditions as they travel and transform across the world." }),
  course({ institution: "Oxy", dept: "MUSC", number: "140", title: "Jazz and American Identity", cores: ["CPFA", "USD"], description: "Jazz history and its role in debates about race and nation." }),
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
const m = (days: string, start: string, end: string, location: string, kind?: Meeting["kind"]): Meeting => ({
  days: days.split("") as Day[],
  start,
  end,
  location,
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
): Section => ({
  id: `${courseId}-${termId}-${sectionNo}`.toLowerCase(),
  courseId,
  termId,
  sectionNo,
  crn: String(++crn),
  instructorIds,
  meetings,
  capacity,
  seatsRemaining: null,
  caltechQuarter,
});

export const SECTIONS: Section[] = [
  // ===== Fall 2026 (current) =====
  s("oxy-fys-101", "FA26", "01", ["hernandez"], [m("TR", "10:30", "11:55", "Johnson 203")], 16),
  s("oxy-fys-106", "FA26", "01", ["nguyen"], [m("MW", "13:30", "14:55", "Fowler 110")], 16),
  s("oxy-fys-112", "FA26", "01", ["moreau"], [m("TR", "13:30", "14:55", "Booth 104")], 16),
  // COMP 131 and MATH 120-01 deliberately overlap (MWF 10:30).
  s("oxy-comp-131", "FA26", "01", ["kim"], [m("MWF", "10:30", "11:25", "Fowler 112")], 30),
  s("oxy-comp-131", "FA26", "02", ["liu"], [m("MWF", "13:30", "14:25", "Fowler 112")], 30),
  s("oxy-comp-229", "FA26", "01", ["kim"], [m("TR", "09:00", "10:25", "Fowler 112")], 28),
  s("oxy-comp-390", "FA26", "01", ["liu"], [m("W", "15:00", "17:50", "Fowler 301")], 18),
  s("oxy-math-120", "FA26", "01", ["petrova"], [m("MWF", "10:30", "11:25", "Fowler 309")], 32),
  s("oxy-math-120", "FA26", "02", ["brooks"], [m("MWF", "09:35", "10:30", "Fowler 309")], 32),
  s("oxy-math-212", "FA26", "01", ["brooks"], [m("TR", "10:30", "11:55", "Fowler 309")], 30),
  s("oxy-math-214", "FA26", "01", ["petrova"], [m("MWF", "11:45", "12:40", "Fowler 307")], 30),
  // PHYS 120 lab on Wednesday afternoon overlaps COMP 131-02 and FYS 106.
  s("oxy-phys-120", "FA26", "01", ["tanaka"], [m("MWF", "08:30", "09:25", "Hameetman 115", "Lecture"), m("W", "13:30", "16:20", "Hameetman 130", "Lab")], 24),
  s("oxy-phys-490", "FA26", "01", ["tanaka"], [m("F", "14:00", "15:30", "Hameetman 220")], 15),
  s("oxy-chem-120", "FA26", "01", ["okafor"], [m("TR", "08:00", "09:25", "Hameetman 105", "Lecture"), m("T", "13:30", "16:20", "Hameetman 140", "Lab")], 40),
  s("oxy-bio-110", "FA26", "01", ["okafor"], [m("MWF", "11:45", "12:40", "Bio 102", "Lecture"), m("R", "13:30", "16:20", "Bio 110", "Lab")], 36),
  s("oxy-econ-101", "FA26", "01", ["rahman"], [m("MWF", "09:35", "10:30", "Johnson 102")], 40),
  s("oxy-econ-250", "FA26", "01", ["ortiz"], [m("TR", "15:05", "16:30", "Johnson 102")], 25),
  s("oxy-econ-395", "FA26", "01", ["rahman"], [m("R", "18:00", "20:50", "Johnson 301")], 16),
  s("oxy-pols-230", "FA26", "01", ["mensah"], [m("MW", "15:05", "16:30", "Johnson 204")], 28),
  s("oxy-dwa-101", "FA26", "01", ["mensah"], [m("TR", "09:00", "10:25", "Johnson 200")], 35),
  s("oxy-hist-101", "FA26", "01", ["whitfield"], [m("MWF", "11:45", "12:40", "Swan 201")], 30),
  // ARTH 150 and HIST 270 partially overlap on Tue/Thu afternoons.
  s("oxy-hist-270", "FA26", "01", ["goldberg"], [m("TR", "14:00", "15:25", "Swan 105")], 30),
  s("oxy-arth-150", "FA26", "01", ["bianchi"], [m("TR", "13:30", "14:55", "Weingart 110")], 30),
  s("oxy-arts-101", "FA26", "01", ["moreau"], [m("MW", "09:00", "11:50", "Studio A")], 14),
  s("oxy-musc-101", "FA26", "01", ["chen"], [m("MWF", "13:30", "14:25", "Booth 201")], 35),
  s("oxy-musc-140", "FA26", "01", ["chen"], [m("TR", "15:05", "16:30", "Booth 201")], 30),
  s("oxy-engl-210", "FA26", "01", ["whitfield"], [m("TR", "10:30", "11:55", "Swan 302")], 25),
  s("caltech-cs-1", "FA26", "01", ["feldman"], [m("MWF", "13:00", "13:55", "Annenberg 105")], 120, "FA"),
  s("caltech-ma-2", "FA26", "01", ["kowalski"], [m("MWF", "10:00", "10:55", "Linde 310")], 80, "FA"),
  s("caltech-ph-2", "FA26", "01", ["huang"], [m("MWF", "11:00", "11:55", "Bridge 201")], 90, "FA"),
  s("caltech-ec-11", "FA26", "01", ["park"], [m("TR", "10:30", "11:55", "Baxter 25")], 60, "FA"),

  // ===== Spring 2027 (future) =====
  s("oxy-fys-106", "SP27", "01", ["nguyen"], [m("TR", "09:00", "10:25", "Fowler 110")], 16),
  s("oxy-comp-131", "SP27", "01", ["liu"], [m("MWF", "10:30", "11:25", "Fowler 112")], 30),
  s("oxy-comp-229", "SP27", "01", ["kim"], [m("MWF", "13:30", "14:25", "Fowler 112")], 28),
  s("oxy-comp-490", "SP27", "01", ["kim"], [m("W", "15:00", "17:50", "Fowler 301")], 18),
  s("oxy-math-120", "SP27", "01", ["brooks"], [m("MWF", "09:35", "10:30", "Fowler 309")], 32),
  s("oxy-math-212", "SP27", "01", ["petrova"], [m("MWF", "10:30", "11:25", "Fowler 309")], 30),
  s("oxy-math-214", "SP27", "01", ["brooks"], [m("TR", "10:30", "11:55", "Fowler 307")], 30),
  s("oxy-math-395", "SP27", "01", ["petrova"], [m("R", "15:05", "17:50", "Fowler 301")], 15),
  s("oxy-phys-220", "SP27", "01", ["tanaka"], [m("MWF", "08:30", "09:25", "Hameetman 115", "Lecture"), m("R", "13:30", "16:20", "Hameetman 130", "Lab")], 24),
  s("oxy-chem-120", "SP27", "01", ["okafor"], [m("TR", "08:00", "09:25", "Hameetman 105", "Lecture"), m("W", "13:30", "16:20", "Hameetman 140", "Lab")], 40),
  s("oxy-econ-250", "SP27", "01", ["ortiz"], [m("MW", "15:05", "16:30", "Johnson 102")], 25),
  s("oxy-hist-380", "SP27", "01", ["goldberg"], [m("T", "15:05", "17:50", "Swan 301")], 15),
  s("oxy-arth-202", "SP27", "01", ["bianchi"], [m("MW", "13:30", "14:55", "Weingart 110")], 30),
  s("oxy-musc-140", "SP27", "01", ["chen"], [m("TR", "13:30", "14:55", "Booth 201")], 30),
  s("oxy-engl-210", "SP27", "01", ["whitfield"], [m("MWF", "11:45", "12:40", "Swan 302")], 25),
  s("oxy-pols-230", "SP27", "01", ["mensah"], [m("TR", "10:30", "11:55", "Johnson 204")], 28),
  s("oxy-dwa-101", "SP27", "01", ["rahman", "mensah"], [m("MWF", "09:35", "10:30", "Johnson 200")], 35),
  s("caltech-ee-44", "SP27", "01", ["feldman"], [m("MWF", "14:00", "14:55", "Moore 80")], 70, "WI"),
  s("caltech-me-11", "SP27", "01", ["huang"], [m("TR", "09:00", "10:25", "Gates 104")], 60, "WI"),
  s("caltech-ph-2", "SP27", "01", ["huang"], [m("MWF", "11:00", "11:55", "Bridge 201")], 90, "SP"),
  s("caltech-ma-2", "SP27", "01", ["kowalski"], [m("TR", "13:00", "14:25", "Linde 310")], 80, "SP"),

  // ===== Spring 2026 (past) =====
  s("oxy-comp-131", "SP26", "01", ["kim"], [m("MWF", "10:30", "11:25", "Fowler 112")], 30),
  s("oxy-math-120", "SP26", "01", ["brooks"], [m("MWF", "09:35", "10:30", "Fowler 309")], 32),
  s("oxy-hist-270", "SP26", "01", ["goldberg"], [m("TR", "13:30", "14:55", "Swan 105")], 30),
  s("oxy-arts-101", "SP26", "01", ["moreau"], [m("TR", "09:00", "11:50", "Studio A")], 14),
  s("caltech-cs-1", "SP26", "01", ["feldman"], [m("MWF", "13:00", "13:55", "Annenberg 105")], 120, "WI"),
];

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((x) => [x.id, x])) as Record<string, Section>;
