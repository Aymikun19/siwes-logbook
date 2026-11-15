/** Date helpers for grouping logbook entries into Monday-start weeks (UTC-safe, ISO yyyy-mm-dd strings). */

export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function weekStart(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00Z");
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

export function addDays(isoDate: string, n: number) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

export function groupByWeek<T extends { entry_date: string }>(entries: T[]) {
  const map = new Map<string, T[]>();
  for (const e of entries) {
    const k = weekStart(e.entry_date);
    map.set(k, [...(map.get(k) ?? []), e]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([week, items]) => ({ week, items: items.sort((a, b) => a.entry_date.localeCompare(b.entry_date)) }));
}

/** Week number relative to the placement start (week 1 = the week containing `start`). */
export function weekNumber(start: string, week: string) {
  const ms = Date.parse(week + "T00:00:00Z") - Date.parse(weekStart(start) + "T00:00:00Z");
  return Math.floor(ms / (7 * 86_400_000)) + 1;
}

export const fmt = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
