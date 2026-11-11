// The single data-access layer for catalog data. In the real app these become
// HTTP calls to the backend; the UI would not need to change.
import { COURSE_BY_ID, COURSES, DEPARTMENTS, INSTRUCTOR_BY_ID, INSTRUCTORS, SECTIONS, TERMS } from "../data/catalog";
import { fuzzyScore } from "../lib/fuzzy";
import { toMinutes } from "../lib/time";
import type { CoreCode, Course, Day, Institution, Section } from "../types";

export interface SearchFilters {
  termId: string;
  dept?: string | null;
  cores?: CoreCode[]; // up to 2, AND-ed
  instructorId?: string | null;
  keyword?: string;
  institution?: Institution | "All";
  /** Search by time. No days = any day; a missing bound = open-ended. */
  days?: Day[];
  timeFrom?: string | null;
  timeTo?: string | null;
  /** "inside": every meeting fits in the window. "overlap": some meeting touches it. */
  timeMode?: "inside" | "overlap";
}

export const hasTimeFilter = (f: Pick<SearchFilters, "days" | "timeFrom" | "timeTo">) =>
  Boolean(f.days?.length || f.timeFrom || f.timeTo);

export function matchesTime(section: Section, f: SearchFilters): boolean {
  if (!hasTimeFilter(f)) return true;
  const from = f.timeFrom ? toMinutes(f.timeFrom) : 0;
  const to = f.timeTo ? toMinutes(f.timeTo) : 24 * 60;
  const days = f.days?.length ? f.days : null;
  if (f.timeMode === "overlap") {
    return section.meetings.some(
      (m) => (!days || m.days.some((d) => days.includes(d))) && toMinutes(m.start) < to && toMinutes(m.end) > from,
    );
  }
  return section.meetings.every(
    (m) => (!days || m.days.every((d) => days.includes(d))) && toMinutes(m.start) >= from && toMinutes(m.end) <= to,
  );
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
      if (!matchesTime(section, f)) return false;
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
/** Labs with their own CRN carry 0 units and a " Lab" title, like counts. */
export const sectionUnits = (s: Section) => (s.isLab ? 0 : COURSE_BY_ID[s.courseId].units);
export const sectionTitle = (s: Section) => `${COURSE_BY_ID[s.courseId].title}${s.isLab ? " Lab" : ""}`;
export const sectionLabel = (s: Section) => `${courseCode(COURSE_BY_ID[s.courseId])}-${s.sectionNo}`;
export const locationKey = (sectionId: string, meetingIndex: number) => `${sectionId}#${meetingIndex}`;
export const instructorNames = (s: Section) => s.instructorIds.map((id) => INSTRUCTOR_BY_ID[id]?.name ?? id).join(", ");
