import { describe, expect, it } from "vitest";
import { heatmap, streak, topSkills, weeklyHours } from "./stats";

describe("streak", () => {
  it("counts consecutive weekdays and skips weekends", () => {
    // 2026-11-13 is a Friday, 2026-11-16 a Monday.
    const e = ["2026-11-12", "2026-11-13", "2026-11-16", "2026-11-17"].map((entry_date) => ({ entry_date }));
    expect(streak(e, "2026-11-17")).toBe(4);
  });
  it("starts from yesterday when today is not logged", () => {
    expect(streak([{ entry_date: "2026-11-16" }], "2026-11-17")).toBe(1);
  });
  it("is zero with a gap", () => {
    expect(streak([{ entry_date: "2026-11-10" }], "2026-11-17")).toBe(0);
  });
});

describe("weeklyHours", () => {
  it("buckets hours into Monday-start weeks", () => {
    const w = weeklyHours(
      [
        { entry_date: "2026-11-16", hours: 8 },
        { entry_date: "2026-11-17", hours: 6 },
        { entry_date: "2026-11-13", hours: 7 },
      ],
      "2026-11-17",
      2,
    );
    expect(w).toEqual([
      { week: "2026-11-09", hours: 7 },
      { week: "2026-11-16", hours: 14 },
    ]);
  });
});

describe("heatmap", () => {
  it("marks future days as null", () => {
    const h = heatmap([{ entry_date: "2026-11-16", hours: 8 }], "2026-11-17", 1);
    expect(h[0].map((d) => d.hours)).toEqual([8, 0, null, null, null]);
  });
});

describe("topSkills", () => {
  it("merges case and counts", () => {
    const s = topSkills([{ skills_learned: "SQL, Excel" }, { skills_learned: "sql; Git" }]);
    expect(s[0]).toEqual({ label: "SQL", n: 2 });
  });
});
