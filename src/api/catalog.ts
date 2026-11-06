// The single data-access layer for catalog data. In the real app these become
// HTTP calls to the backend; the UI would not need to change.
import { COURSE_BY_ID, COURSES, DEPARTMENTS, INSTRUCTOR_BY_ID, INSTRUCTORS, SECTIONS, TERMS } from "../data/catalog";
import { fuzzyScore } from "../lib/fuzzy";
import type { CoreCode, Course, Institution, Section } from "../types";

export interface SearchFilters {
  termId: string;
  dept?: string | null;
  cores?: CoreCode[]; // up to 2, AND-ed
  instructorId?: string | null;
  keyword?: string;
  institution?: Institution | "All";
}

export interface SectionResult {
  section: Section;
  course: Course;
}

export const listTerms = () => TERMS;
export const listDepartments = () => DEPARTMENTS;
export const listInstructors = () => INSTRUCTORS;
export const listCourses = () => COURSES;
export const getCourse = (id: string) => COURSE_BY_ID[id];
export const getInstructor = (id: string) => INSTRUCTOR_BY_ID[id];

export function searchSections(f: SearchFilters): SectionResult[] {
  return SECTIONS.filter((s) => s.termId === f.termId)
    .map((section) => ({ section, course: COURSE_BY_ID[section.courseId] }))
    .filter(({ section, course }) => {
      if (f.institution && f.institution !== "All" && course.institution !== f.institution) return false;
      if (f.dept && course.dept !== f.dept) return false;
      if (f.cores?.length && !f.cores.every((c) => course.cores.includes(c))) return false;
      if (f.instructorId && !section.instructorIds.includes(f.instructorId)) return false;
      if (f.keyword?.trim()) {
        const hay = `${course.dept} ${course.number} ${course.title}`;
        if (fuzzyScore(f.keyword, hay) < 0) return false;
      }
      return true;
    })
    .sort((a, b) =>
      a.course.institution.localeCompare(b.course.institution) ||
      a.course.dept.localeCompare(b.course.dept) ||
      a.course.number.localeCompare(b.course.number, undefined, { numeric: true }) ||
      a.section.sectionNo.localeCompare(b.section.sectionNo),
    );
}

export const sectionsForCourse = (courseId: string, termId?: string) =>
  SECTIONS.filter((s) => s.courseId === courseId && (!termId || s.termId === termId));

export const courseCode = (c: Course) => `${c.dept} ${c.number}`;
export const instructorNames = (s: Section) => s.instructorIds.map((id) => INSTRUCTOR_BY_ID[id]?.name ?? id).join(", ");
