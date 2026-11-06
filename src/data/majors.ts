// MOCK major course lists. Real lists will come from curated, per-catalog-year data files.
import type { Major } from "../types";

const THREE_TWO_CORE = ["oxy-math-120", "oxy-math-212", "oxy-math-214", "oxy-phys-120", "oxy-phys-220", "oxy-chem-120", "oxy-comp-131", "caltech-ma-2", "caltech-ee-44", "caltech-me-11"];

export const MAJORS: Major[] = [
  { id: "comp", name: "Computer Science", dept: "COMP", threeTwo: false, courseIds: ["oxy-comp-131", "oxy-comp-229", "oxy-math-120", "oxy-math-214", "oxy-comp-390", "oxy-comp-490"] },
  { id: "math", name: "Mathematics", dept: "MATH", threeTwo: false, courseIds: ["oxy-math-120", "oxy-math-212", "oxy-math-214", "oxy-math-395", "oxy-comp-131"] },
  { id: "phys", name: "Physics", dept: "PHYS", threeTwo: false, courseIds: ["oxy-phys-120", "oxy-phys-220", "oxy-math-120", "oxy-math-212", "oxy-phys-490"] },
  { id: "econ", name: "Economics", dept: "ECON", threeTwo: false, courseIds: ["oxy-econ-101", "oxy-econ-250", "oxy-econ-395", "oxy-math-120"] },
  { id: "hist", name: "History", dept: "HIST", threeTwo: false, courseIds: ["oxy-hist-101", "oxy-hist-270", "oxy-hist-380"] },
  { id: "arth", name: "Art History & Visual Arts", dept: "ARTH", threeTwo: false, courseIds: ["oxy-arth-150", "oxy-arth-202", "oxy-arts-101"] },
  { id: "phys-32", name: "Physics — 3-2 Engineering", dept: "PHYS", threeTwo: true, courseIds: ["oxy-phys-120", "oxy-phys-220", "oxy-math-212", "oxy-phys-490"] },
  { id: "math-32", name: "Mathematics — 3-2 Engineering", dept: "MATH", threeTwo: true, courseIds: ["oxy-math-212", "oxy-math-214", "oxy-math-395"] },
  { id: "comp-32", name: "Computer Science — 3-2 Engineering", dept: "COMP", threeTwo: true, courseIds: ["oxy-comp-131", "oxy-comp-229", "oxy-comp-390"] },
];

export const THREE_TWO_COURSE_IDS = THREE_TWO_CORE;
export const MAJOR_BY_ID = Object.fromEntries(MAJORS.map((x) => [x.id, x])) as Record<string, Major>;
