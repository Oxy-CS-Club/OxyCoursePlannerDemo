// v1 recommendation rules (spec §3.6): by major + course history only.
import { COURSE_BY_ID, SECTIONS } from "../data/catalog";
import { CORE_REQUIREMENTS } from "../data/cores";
import { MAJOR_BY_ID, THREE_TWO_COURSE_IDS } from "../data/majors";
import type { CoreCode, Course, Profile } from "../types";

export interface RecGroup {
  id: string;
  title: string;
  reason: string;
  courses: Course[];
}

export interface CoreProgress {
  code: CoreCode;
  name: string;
  done: boolean;
  /** e.g. "3 / 4 units", "1 / 2 courses", "Exempt (test)". */
  detail?: string;
}

/**
 * Progress on each Core requirement from the student's history.
 * - Most Cores: one course.
 * - Fine Arts: 4 units, from one 4-unit CPFA course or CFAP partial courses that add up.
 * - Language Proficiency: two LANG courses, or a passed exemption test.
 */
export function coreProgress(profile: Pick<Profile, "history" | "langExempt">): CoreProgress[] {
  const taken = profile.history.map((h) => COURSE_BY_ID[h.courseId]).filter(Boolean);
  return CORE_REQUIREMENTS.map((r) => {
    if (r.kind === "units") {
      const units = taken.filter((c) => c.cores.some((k) => r.countsFrom.includes(k))).reduce((n, c) => n + c.units, 0);
      return { code: r.code, name: r.name, done: units >= r.units, detail: `${Math.min(units, r.units)} / ${r.units} units` };
    }
    if (r.kind === "courses") {
      if (profile.langExempt) return { code: r.code, name: r.name, done: true, detail: "Exempt (test)" };
      const n = taken.filter((c) => c.cores.includes(r.code)).length;
      return { code: r.code, name: r.name, done: n >= r.count, detail: `${Math.min(n, r.count)} / ${r.count} courses` };
    }
    return { code: r.code, name: r.name, done: taken.some((c) => c.cores.includes(r.code)) };
  });
}

export function recommend(profile: Profile, termId: string): RecGroup[] {
  const offered = new Set(SECTIONS.filter((s) => s.termId === termId).map((s) => s.courseId));
  const taken = new Set(profile.history.map((h) => h.courseId));
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

  // One group per Core requirement that isn't done yet. Fine Arts lists both full (CPFA) and partial (CFAP) courses.
  coreProgress(profile)
    .filter((p) => !p.done)
    .forEach((p) => {
      const req = CORE_REQUIREMENTS.find((r) => r.code === p.code)!;
      const codes = req.kind === "units" ? req.countsFrom : [req.code];
      const courses = available([...offered].filter((id) => COURSE_BY_ID[id]?.cores.some((k) => codes.includes(k)))).slice(0, req.kind === "units" ? 6 : 4);
      const reason =
        req.kind === "units"
          ? `You have ${p.detail}. Take one 4-unit Fine Arts course, or partial (1–2 unit) courses that add up to 4.`
          : req.kind === "courses"
            ? `You have ${p.detail}. Take two language courses, or mark the exemption test on your profile.`
            : "You haven't satisfied this Core yet.";
      groups.push({ id: `core-${p.code}`, title: `Core: ${p.name}`, reason, courses });
    });

  return groups;
}
