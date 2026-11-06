// v1 recommendation rules (spec §3.6): by major + course history only.
import { COURSE_BY_ID, SECTIONS } from "../data/catalog";
import { CORES } from "../data/cores";
import { MAJOR_BY_ID, THREE_TWO_COURSE_IDS } from "../data/majors";
import type { CoreCode, Course, Profile } from "../types";

export interface RecGroup {
  id: string;
  title: string;
  reason: string;
  courses: Course[];
}

export function satisfiedCores(history: string[]): Set<CoreCode> {
  const set = new Set<CoreCode>();
  history.forEach((id) => COURSE_BY_ID[id]?.cores.forEach((c) => set.add(c)));
  return set;
}

export function recommend(profile: Profile, termId: string): RecGroup[] {
  const offered = new Set(SECTIONS.filter((s) => s.termId === termId).map((s) => s.courseId));
  const taken = new Set(profile.history);
  const available = (ids: string[]) =>
    ids.filter((id) => offered.has(id) && !taken.has(id)).map((id) => COURSE_BY_ID[id]).filter(Boolean);
  const groups: RecGroup[] = [];
  const majors = profile.majorIds.map((id) => MAJOR_BY_ID[id]).filter(Boolean);
  const majorDepts = new Set(majors.map((m) => m.dept));

  if (profile.year === 1) {
    const fys = available([...offered].filter((id) => COURSE_BY_ID[id]?.tags.includes("fys")));
    groups.push({ id: "fys", title: "First-Year Seminar", reason: "Recommended for first-year students.", courses: fys });
  }

  // Upper-class seminars: ONLY from the student's own major department(s).
  if ((profile.year === 3 || profile.year === 4) && majors.length > 0) {
    const tag = profile.year === 3 ? "junior-seminar" : "senior-seminar";
    const own = available([...offered].filter((id) => COURSE_BY_ID[id]?.tags.includes(tag) && majorDepts.has(COURSE_BY_ID[id].dept)));
    groups.push({
      id: "seminar",
      title: profile.year === 3 ? "Junior seminars" : "Senior seminars",
      reason: `Only seminars in your major${majors.length > 1 ? "s" : ""} (${[...majorDepts].join(", ")}).`,
      courses: own,
    });
  }

  // One group per declared major.
  majors.forEach((major) => {
    groups.push({ id: `major-${major.id}`, title: `${major.name} courses`, reason: "From this major's course list, offered this term, not yet taken.", courses: available(major.courseIds) });
  });

  if (majors.some((m) => m.threeTwo)) {
    const inMajorLists = new Set(majors.flatMap((m) => m.courseIds));
    const extra = available(THREE_TWO_COURSE_IDS).filter((c) => !inMajorLists.has(c.id));
    groups.push({ id: "3-2", title: "3-2 Engineering list", reason: "Courses on the 3-2 program list (includes Caltech).", courses: extra });
  }

  const have = satisfiedCores(profile.history);
  CORES.filter((c) => !have.has(c.code)).forEach((core) => {
    const courses = available([...offered].filter((id) => COURSE_BY_ID[id]?.cores.includes(core.code))).slice(0, 4);
    groups.push({ id: `core-${core.code}`, title: `Core: ${core.name}`, reason: "You haven't satisfied this Core yet.", courses });
  });

  return groups;
}
