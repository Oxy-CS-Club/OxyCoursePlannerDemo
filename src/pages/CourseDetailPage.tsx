// Spec §3.2: full course info + RateMyClass buttons that open in a NEW browser tab.
import { Link, useParams } from "react-router-dom";
import { courseCode, getCourse, getInstructor, instructorNames, sectionsForCourse, sectionUnits } from "../api/catalog";
import { courseRatingsUrl, professorRatingsUrl } from "../api/ratings";
import { CoreBadge, InstitutionBadge, QuarterBadge } from "../components/Badges";
import { CalendarActions } from "../components/CalendarActions";
import { FavoriteButton } from "../components/FavoriteButton";
import { TERM_BY_ID } from "../data/catalog";
import { CORE_BY_CODE } from "../data/cores";
import { fmtMeeting } from "../lib/time";
import { useApp } from "../state/AppContext";

export function CourseDetailPage() {
  const { courseId = "" } = useParams();
  const { termId } = useApp();
  const course = getCourse(courseId);
  if (!course) return <p>Course not found. <Link to="/" className="underline">Back to search</Link></p>;

  const sections = sectionsForCourse(course.id, termId);
  const otherTerms = [...new Set(sectionsForCourse(course.id).map((s) => s.termId))].filter((t) => t !== termId);
  const instructorIds = [...new Set(sections.flatMap((s) => s.instructorIds))];

  return (
    <div className="max-w-4xl">
      <Link to="/" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to search
      </Link>
      <div className="mt-2 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <InstitutionBadge institution={course.institution} />
          <h1 className="text-2xl font-bold">{courseCode(course)}</h1>
          <span className="text-sm text-stone-500">{course.units} units</span>
        </div>
        <p className="mt-1 text-lg">{course.title}</p>
        {course.cores.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {course.cores.map((c) => (
              <CoreBadge key={c} code={c} />
            ))}
            <span className="ml-1 text-xs text-stone-500">Satisfies: {course.cores.map((c) => CORE_BY_CODE[c].name).join(", ")}</span>
          </div>
        )}
        <p className="mt-4 text-stone-700">{course.description}</p>
        <p className="mt-2 text-sm text-stone-600">
          <b>Prerequisites:</b> {course.prereqs}
        </p>
        {course.institution === "Caltech" && (
          <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            Caltech course, available to Oxy students through cross-registration. Caltech runs on quarters, so its dates don't fully line up with Oxy's semester.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
          <a
            href={courseRatingsUrl(course)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-700"
          >
            See ratings for this class ↗
          </a>
          {instructorIds.length === 0 && (
            <span className="inline-flex items-center rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-400">See ratings for this professor (not offered this term)</span>
          )}
          {instructorIds.map((id) => {
            const ins = getInstructor(id);
            return (
              <a
                key={id}
                href={professorRatingsUrl(ins)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold hover:border-stone-500"
              >
                See ratings for this professor{instructorIds.length > 1 ? ` (${ins.name})` : ""} ↗
              </a>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-stone-400">Opens RateMyClass in a new tab. (RateMyClass isn't live yet, so the demo shows a placeholder.)</p>
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Sections in {TERM_BY_ID[termId].name}</h2>
      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
          Not offered this term.{otherTerms.length > 0 && <> Offered in: {otherTerms.map((t) => TERM_BY_ID[t].name).join(", ")}.</>}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">CRN</th>
                <th className="px-3 py-2">Instructor</th>
                <th className="px-3 py-2">Meetings</th>
                <th className="px-3 py-2">Max seats</th>
                <th className="px-3 py-2">Calendar</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-t border-stone-100 align-top">
                  <td className="px-3 py-2 font-medium">
                    {s.sectionNo} {s.isLab && <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] text-indigo-800">Lab · {sectionUnits(s)} units</span>}{" "}
                    <QuarterBadge quarter={s.caltechQuarter} />
                  </td>
                  <td className="px-3 py-2 text-stone-500">{s.crn}</td>
                  <td className="px-3 py-2">{instructorNames(s)}</td>
                  <td className="px-3 py-2">
                    {s.meetings.map((mt, i) => (
                      <div key={i}>{fmtMeeting(mt)}</div>
                    ))}
                    {s.meetings.length > 1 && <div className="text-xs text-stone-400">Same CRN, separate meeting times</div>}
                  </td>
                  <td className="px-3 py-2">
                    {s.capacity}
                  </td>
                  <td className="px-3 py-2">
                    <CalendarActions section={s} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <FavoriteButton sectionId={s.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
