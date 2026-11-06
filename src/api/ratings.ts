// RateMyClass links are built from configurable templates, not hard-coded.
// RateMyClass doesn't exist yet, so the demo points at a local placeholder page.
// Once it launches, only these two templates need to change.
import type { Course, Instructor } from "../types";

export const RATINGS_CONFIG = {
  courseUrl: "/ratings-placeholder?kind=class&school={institution}&course={dept}-{number}",
  professorUrl: "/ratings-placeholder?kind=professor&school={institution}&name={name}",
};

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(vars[k] ?? ""));

export const courseRatingsUrl = (c: Course) =>
  fill(RATINGS_CONFIG.courseUrl, { institution: c.institution, dept: c.dept, number: c.number });

export const professorRatingsUrl = (i: Instructor) =>
  fill(RATINGS_CONFIG.professorUrl, { institution: i.institution, name: i.name });
