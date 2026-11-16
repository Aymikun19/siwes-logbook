import { Check } from "lucide-react";
import { fmt, weekNumber, addDays } from "@/lib/weeks";
import type { Entry, Review } from "@/lib/types";

export function WeekHeader({ week, first, review }: { week: string; first: string; review?: Review }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">
        Week {weekNumber(first, week)}{" "}
        <span className="font-normal text-stone-500">
          · {fmt(week, { day: "numeric", month: "short" })} – {fmt(addDays(week, 6), { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </h3>
      <ReviewBadge review={review} />
    </div>
  );
}

export function ReviewBadge({ review }: { review?: Review }) {
  if (!review) return <span className="badge">Awaiting review</span>;
  return review.status === "approved" ? (
    <span className="badge inline-flex items-center gap-1 !bg-emerald-100 !text-emerald-800">
      <Check size={12} aria-hidden /> Approved
    </span>
  ) : (
    <span className="badge !bg-amber-100 !text-amber-800">Changes requested</span>
  );
}

export function EntryRow({ e }: { e: Entry }) {
  return (
    <div className="grid gap-1 border-t border-stone-100 py-3 sm:grid-cols-[110px_1fr_auto]">
      <p className="text-sm font-medium text-stone-500">{fmt(e.entry_date)}</p>
      <div>
        <p className="whitespace-pre-wrap text-sm">{e.activities}</p>
        {e.skills_learned && <p className="mt-1 text-xs text-stone-500">Learned: {e.skills_learned}</p>}
      </div>
      <p className="text-xs text-stone-400">{e.hours}h</p>
    </div>
  );
}
