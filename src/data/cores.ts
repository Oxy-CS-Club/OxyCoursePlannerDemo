import type { CoreCategory, CoreCode } from "../types";

// Codes and names follow the Core area list on counts.oxy.edu
// (Core Arts, Core Arts Partial, Core Global Connections, ... Core Language Proficiency).
// This is a data table so it can be updated each catalog year without code changes.

/** Categories a student can filter by. CFAP is a filter of its own and also shows up under Fine Arts. */
export const CORES: CoreCategory[] = [
  { code: "CPUD", name: "U.S. Diversity", short: "US Div", group: "Cultural Studies", description: "Difference in the U.S.: race, religion, ethnicity, class, gender, sexuality." },
  { code: "CPRF", name: "Regional Focus", short: "Regional", group: "Cultural Studies", description: "A region outside the United States, without a U.S.-centric lens." },
  { code: "CPGC", name: "Global Connections", short: "Global", group: "Cultural Studies", description: "Global, transnational, or comparative understanding of regions." },
  { code: "CPPE", name: "Pre-1800", short: "Pre-1800", description: "Focus on a historical period before 1800." },
  { code: "CPFA", name: "Fine Arts", short: "Arts", description: "Theory or practice of the fine arts. The requirement is 4 units: one 4-unit course, or partial courses that add up to 4." },
  { code: "CFAP", name: "Fine Arts (partial)", short: "Arts · partial", description: "1–2 unit arts courses. Combine them to reach the 4 units that satisfy Fine Arts." },
  { code: "CPMS", name: "Math/Science", short: "Math/Sci", description: "A course in mathematics or science." },
  { code: "CPLS", name: "Lab Science", short: "Lab", description: "Hands-on data collection through observation or experiment." },
  { code: "LANG", name: "Language Proficiency", short: "Language", description: "Two language courses, or a passed language exemption test." },
];

export const CORE_BY_CODE = Object.fromEntries(CORES.map((c) => [c.code, c])) as Record<CoreCode, CoreCategory>;

export const CORE_COLORS: Record<CoreCode, string> = {
  CPUD: "bg-rose-100 text-rose-800 ring-rose-200",
  CPRF: "bg-amber-100 text-amber-800 ring-amber-200",
  CPGC: "bg-teal-100 text-teal-800 ring-teal-200",
  CPPE: "bg-stone-200 text-stone-800 ring-stone-300",
  CPFA: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200",
  CFAP: "bg-white text-fuchsia-700 ring-fuchsia-400",
  CPMS: "bg-sky-100 text-sky-800 ring-sky-200",
  CPLS: "bg-lime-100 text-lime-800 ring-lime-200",
  LANG: "bg-violet-100 text-violet-800 ring-violet-200",
};

/** What it takes to satisfy each Core requirement. CFAP is not its own requirement; it counts toward Fine Arts. */
export type CoreRequirement =
  | { code: CoreCode; name: string; kind: "course" }
  | { code: CoreCode; name: string; kind: "units"; units: number; countsFrom: CoreCode[] }
  | { code: CoreCode; name: string; kind: "courses"; count: number; exemptible: true };

export const CORE_REQUIREMENTS: CoreRequirement[] = [
  { code: "CPUD", name: "U.S. Diversity", kind: "course" },
  { code: "CPRF", name: "Regional Focus", kind: "course" },
  { code: "CPGC", name: "Global Connections", kind: "course" },
  { code: "CPPE", name: "Pre-1800", kind: "course" },
  { code: "CPFA", name: "Fine Arts", kind: "units", units: 4, countsFrom: ["CPFA", "CFAP"] },
  { code: "CPMS", name: "Math/Science", kind: "course" },
  { code: "CPLS", name: "Lab Science", kind: "course" },
  { code: "LANG", name: "Language Proficiency", kind: "courses", count: 2, exemptible: true },
];
