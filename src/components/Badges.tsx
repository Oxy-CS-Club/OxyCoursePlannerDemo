import { QUARTER_NAMES } from "../data/catalog";
import { CORE_BY_CODE, CORE_COLORS } from "../data/cores";
import type { CaltechQuarter, CoreCode, Institution } from "../types";

export function CoreBadge({ code }: { code: CoreCode }) {
  const core = CORE_BY_CODE[code];
  return (
    <span title={`${core.name}: ${core.description}`} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${CORE_COLORS[code]}`}>
      {core.short}
    </span>
  );
}

export function InstitutionBadge({ institution }: { institution: Institution }) {
  return institution === "Caltech" ? (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold bg-orange-500 text-white" title="Caltech course (cross-registration)">
      Caltech
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold bg-stone-900 text-white">Oxy</span>
  );
}

export function QuarterBadge({ quarter }: { quarter?: CaltechQuarter }) {
  if (!quarter) return null;
  return (
    <span
      className="inline-flex items-center rounded border border-dashed border-orange-400 px-1.5 py-0.5 text-[11px] text-orange-700"
      title="Caltech runs on quarters. Dates do not fully line up with Oxy's semester; check both calendars."
    >
      {QUARTER_NAMES[quarter]} ⚠
    </span>
  );
}

export function TagBadge({ text }: { text: string }) {
  return <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800 ring-1 ring-indigo-200">{text}</span>;
}
