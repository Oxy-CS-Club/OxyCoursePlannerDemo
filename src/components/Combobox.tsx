// Every filter supports both: open the dropdown and pick, or type to fuzzy-match.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fuzzyScore } from "../lib/fuzzy";

export interface Option {
  value: string;
  label: string;
  hint?: string;
  group?: string;
}

interface Props {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Clear the input after picking (used for "add" pickers). */
  resetOnSelect?: boolean;
  disabledValues?: string[];
}

export function Combobox({ label, options, value, onChange, placeholder, resetOnSelect, disabledValues = [] }: Props) {
  const id = useId();
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options
      .map((o) => ({ o, score: Math.max(fuzzyScore(query, o.label), fuzzyScore(query, o.hint ?? "") - 5) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.o);
  }, [options, query]);

  const pick = (o: Option) => {
    if (disabledValues.includes(o.value)) return;
    onChange(o.value);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </label>
      <div className="flex items-center rounded-lg border border-stone-300 bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          autoComplete="off"
          className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
          placeholder={selected && !resetOnSelect ? selected.label : placeholder ?? "Type or pick…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && open && filtered[active]) {
              e.preventDefault();
              pick(filtered[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {selected && !resetOnSelect && (
          <span className="mr-1 max-w-[50%] truncate rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800" title={selected.label}>
            {selected.label}
          </span>
        )}
        {selected && !resetOnSelect ? (
          <button type="button" aria-label={`Clear ${label}`} className="px-2 text-stone-400 hover:text-stone-700" onClick={() => onChange(null)}>
            ✕
          </button>
        ) : (
          <button type="button" aria-label={`Show ${label} options`} className="px-2 text-stone-400 hover:text-stone-700" onClick={() => setOpen((o) => !o)}>
            ▾
          </button>
        )}
      </div>
      {open && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white py-1 text-sm shadow-lg">
          {filtered.length === 0 && <li className="px-3 py-2 text-stone-400">No matches</li>}
          {filtered.map((o, i) => {
            const disabled = disabledValues.includes(o.value);
            const showGroup = o.group && (i === 0 || filtered[i - 1].group !== o.group) && !query.trim();
            return (
              <li key={o.value}>
                {showGroup && <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{o.group}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  disabled={disabled}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                  className={`flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left ${i === active ? "bg-orange-50" : ""} ${disabled ? "cursor-not-allowed text-stone-300" : ""}`}
                >
                  <span>{o.label}</span>
                  {o.hint && <span className="shrink-0 text-xs text-stone-400">{o.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
