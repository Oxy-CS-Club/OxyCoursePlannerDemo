// Shapes mirror what a future backend API would return.

export type Institution = "Oxy" | "Caltech";
export type Day = "M" | "T" | "W" | "R" | "F";
export type CaltechQuarter = "FA" | "WI" | "SP";
export type TermStatus = "past" | "current" | "future";

export type CoreCode = "USD" | "RF" | "GC" | "CPPE" | "CPFA" | "CPMS" | "CPLS";

export interface CoreCategory {
  code: CoreCode;
  name: string;
  short: string;
  group?: "Cultural Studies";
  description: string;
}

/** Dates are "YYYY-MM-DD" in Pacific time. */
export interface DateSpan {
  start: string;
  end: string;
  name?: string;
}

export interface Term {
  id: string;
  name: string;
  status: TermStatus;
  /** First and last day of classes, plus breaks with no classes (used for calendar export). */
  startDate: string;
  endDate: string;
  breaks: DateSpan[];
  /** Caltech quarters that roughly fall inside this Oxy semester. */
  caltechQuarters: CaltechQuarter[];
}

export interface Department {
  code: string;
  name: string;
  institution: Institution;
  /** First-Year Seminar is listed as its own subject. */
  isSubject?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  institution: Institution;
}

export type CourseTag = "fys" | "junior-seminar" | "senior-seminar";

export interface Course {
  id: string;
  institution: Institution;
  dept: string;
  number: string;
  title: string;
  units: number;
  description: string;
  prereqs: string;
  cores: CoreCode[];
  tags: CourseTag[];
}

// counts.oxy.edu lists no rooms, so meetings carry no location.
// Students can add a room themselves (see UserData.locations).
export interface Meeting {
  days: Day[];
  start: string; // "HH:MM" 24h
  end: string;
  kind?: "Lecture" | "Lab";
}

export interface Section {
  id: string;
  courseId: string;
  termId: string;
  sectionNo: string;
  crn: string;
  instructorIds: string[];
  meetings: Meeting[];
  /** "Max Seats" on counts. We do not show remaining seats. */
  capacity: number;
  /** A lab with its own CRN (e.g. COMP 131 section "1-1"): 0 units, title + " Lab". */
  isLab?: boolean;
  caltechQuarter?: CaltechQuarter;
}

export interface Major {
  id: string;
  name: string;
  dept: string;
  threeTwo: boolean;
  courseIds: string[];
}

// ---- User-side data ----

export interface Collection {
  id: string;
  name: string;
  sectionIds: string[];
}

export interface Schedule {
  id: string;
  name: string;
  termId: string;
  sectionIds: string[];
}

export interface Profile {
  year: 1 | 2 | 3 | 4 | null;
  /** Students can declare more than one major (double major, major + 3-2 track, …). */
  majorIds: string[];
  history: HistoryEntry[];
}

export interface HistoryEntry {
  courseId: string;
  termId: string; // a HISTORY_TERMS id, e.g. "FA25"
}

export interface FinalSchedule {
  name: string;
  sectionIds: string[];
  finalizedAt: string; // ISO timestamp
}

export interface User {
  name: string;
  email: string;
}

export interface UserData {
  collections: Collection[];
  schedules: Schedule[];
  activeScheduleByTerm: Record<string, string>;
  profile: Profile;
  /** One final schedule per term, shown on My Courses. Overwritten when updated. */
  finalSchedules: Record<string, FinalSchedule>;
  /** Rooms students typed in themselves, keyed "<sectionId>#<meetingIndex>". */
  locations: Record<string, string>;
}
