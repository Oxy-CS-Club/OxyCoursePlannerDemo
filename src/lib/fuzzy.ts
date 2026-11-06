/** Lowercase and strip accents so "hern" matches "Hernández". */
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Returns a score (higher = better) or -1 if no match.
 * Every whitespace-separated token must appear as a substring; if not,
 * fall back to an in-order subsequence match ("mlc" → "Mei-Ling Chen").
 */
export function fuzzyScore(query: string, text: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const t = normalize(text);
  const tokens = q.split(/\s+/);
  if (tokens.every((tok) => t.includes(tok))) {
    return 100 - t.indexOf(tokens[0]) + (t.startsWith(q) ? 50 : 0);
  }
  let i = 0;
  for (const ch of t) if (ch === q[i]) i++;
  return i === q.length ? 10 : -1;
}
