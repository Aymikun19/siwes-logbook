import { addDays, toISODate, weekStart } from "./weeks";
import type { Entry } from "./types";

const isWeekend = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z").getUTCDay();
  return d === 0 || d === 6;
};

/** Consecutive working days (Mon–Fri) logged, counting back from today (or yesterday if today isn't logged yet). */
export function streak(entries: Pick<Entry, "entry_date">[], today: string): number {
  const days = new Set(entries.map((e) => e.entry_date));
  let d = today;
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  for (let i = 0; i < 400; i++) {
    if (isWeekend(d)) {
      if (days.has(d)) n++;
      d = addDays(d, -1);
      continue;
    }
    if (!days.has(d)) break;
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Total hours for each of the last `count` weeks (oldest first). */
export function weeklyHours(entries: Pick<Entry, "entry_date" | "hours">[], today: string, count = 12) {
  const end = weekStart(today);
  const weeks = Array.from({ length: count }, (_, i) => addDays(end, -7 * (count - 1 - i)));
  const totals = new Map<string, number>(weeks.map((w) => [w, 0]));
  for (const e of entries) {
    const w = weekStart(e.entry_date);
    if (totals.has(w)) totals.set(w, totals.get(w)! + Number(e.hours));
  }
  return weeks.map((w) => ({ week: w, hours: totals.get(w)! }));
}

/** Grid of the last `weeks` weeks, Monday to Friday, with hours logged per day. */
export function heatmap(entries: Pick<Entry, "entry_date" | "hours">[], today: string, weeks = 16) {
  const byDay = new Map(entries.map((e) => [e.entry_date, Number(e.hours)]));
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 5 }, (_, d) => {
      const date = addDays(start, w * 7 + d);
      return { date, hours: date > today ? null : (byDay.get(date) ?? 0) };
    }),
  );
}

/** Skills mentioned across entries, most frequent first. */
export function topSkills(entries: Pick<Entry, "skills_learned">[], limit = 18) {
  const counts = new Map<string, { label: string; n: number }>();
  for (const e of entries) {
    for (const raw of (e.skills_learned ?? "").split(/[,;\n]/)) {
      const label = raw.trim().replace(/\.$/, "");
      if (label.length < 2) continue;
      const key = label.toLowerCase();
      const c = counts.get(key) ?? { label, n: 0 };
      c.n++;
      counts.set(key, c);
    }
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label)).slice(0, limit);
}

export const todayISO = () => toISODate(new Date());
