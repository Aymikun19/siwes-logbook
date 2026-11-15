import { describe, expect, it } from "vitest";
import { addDays, groupByWeek, weekNumber, weekStart } from "./weeks";

describe("weekStart", () => {
  it("returns the Monday for mid-week dates", () => expect(weekStart("2026-11-12")).toBe("2026-11-09"));
  it("treats Sunday as the end of the week", () => expect(weekStart("2026-11-15")).toBe("2026-11-09"));
  it("keeps Mondays as-is", () => expect(weekStart("2026-11-09")).toBe("2026-11-09"));
  it("crosses month boundaries", () => expect(weekStart("2026-12-02")).toBe("2026-11-30"));
});

describe("groupByWeek", () => {
  it("groups and sorts newest week first, entries oldest first", () => {
    const g = groupByWeek([
      { entry_date: "2026-11-11" },
      { entry_date: "2026-11-03" },
      { entry_date: "2026-11-10" },
    ]);
    expect(g.map((w) => w.week)).toEqual(["2026-11-09", "2026-11-02"]);
    expect(g[0].items.map((i) => i.entry_date)).toEqual(["2026-11-10", "2026-11-11"]);
  });
});

describe("weekNumber", () => {
  it("counts weeks from the placement start", () => {
    expect(weekNumber("2026-11-04", "2026-11-02")).toBe(1);
    expect(weekNumber("2026-11-04", addDays("2026-11-02", 14))).toBe(3);
  });
});
