import { fmt } from "@/lib/weeks";

const shade = (h: number | null) =>
  h === null ? "bg-transparent" : h === 0 ? "bg-stone-100" : h < 4 ? "bg-accent/30" : h < 7 ? "bg-accent/60" : "bg-accent";

export function Heatmap({ grid }: { grid: { date: string; hours: number | null }[][] }) {
  return (
    <div className="flex gap-2">
      <div className="grid grid-rows-5 gap-1 text-[10px] leading-[14px] text-stone-400" aria-hidden>
        {["Mon", "", "Wed", "", "Fri"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="flex gap-1" role="img" aria-label="Days logged over the last 16 weeks">
        {grid.map((week, i) => (
          <div key={i} className="grid grid-rows-5 gap-1">
            {week.map((d) => (
              <span
                key={d.date}
                title={d.hours === null ? "" : `${fmt(d.date)}: ${d.hours ? `${d.hours}h` : "not logged"}`}
                className={`size-3.5 rounded-[4px] ${shade(d.hours)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
