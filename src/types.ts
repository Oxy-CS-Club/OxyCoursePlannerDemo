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

export interface Term {
  id: string;
  name: string;
  status: TermStatus;
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

export interface Meeting {
  days: Day[];
  start: string; // "HH:MM" 24h
  end: string;
  location: string;
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
  capacity: number;
  /** Reserved for a future feature (live seat counts). Always null in v1. */
  seatsRemaining: number | null;
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
  history: string[]; // course ids
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
}
