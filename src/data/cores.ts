import type { CoreCategory } from "../types";

// Based on the Oxy 2025–26 catalog. CPPE/CPFA/CPMS/CPLS are the catalog codes;
// the codes for the three Cultural Studies areas are placeholders until we
// confirm what the official schedule data uses.
export const CORES: CoreCategory[] = [
  { code: "USD", name: "U.S. Diversity", short: "US Div", group: "Cultural Studies", description: "Difference in the U.S.: race, religion, ethnicity, class, gender, sexuality." },
  { code: "RF", name: "Regional Focus", short: "Regional", group: "Cultural Studies", description: "A region outside the United States, without a U.S.-centric lens." },
  { code: "GC", name: "Global Connections", short: "Global", group: "Cultural Studies", description: "Global, transnational, or comparative understanding of regions." },
  { code: "CPPE", name: "Pre-1800", short: "Pre-1800", description: "Focus on a historical period before 1800." },
  { code: "CPFA", name: "Fine Arts", short: "Arts", description: "Theory or practice of the fine arts." },
  { code: "CPMS", name: "Math/Science", short: "Math/Sci", description: "A course in mathematics or science." },
  { code: "CPLS", name: "Lab Science", short: "Lab", description: "Hands-on data collection through observation or experiment." },
];

export const CORE_BY_CODE = Object.fromEntries(CORES.map((c) => [c.code, c])) as Record<
  CoreCategory["code"],
  CoreCategory
>;

export const CORE_COLORS: Record<CoreCategory["code"], string> = {
  USD: "bg-rose-100 text-rose-800 ring-rose-200",
  RF: "bg-amber-100 text-amber-800 ring-amber-200",
  GC: "bg-teal-100 text-teal-800 ring-teal-200",
  CPPE: "bg-stone-200 text-stone-800 ring-stone-300",
  CPFA: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200",
  CPMS: "bg-sky-100 text-sky-800 ring-sky-200",
  CPLS: "bg-lime-100 text-lime-800 ring-lime-200",
};
