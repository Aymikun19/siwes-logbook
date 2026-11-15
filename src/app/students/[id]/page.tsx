import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { groupByWeek } from "@/lib/weeks";
import type { Entry, Profile, Review } from "@/lib/types";
import { EntryRow, WeekHeader } from "@/components";
import { reviewWeek } from "../../actions";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: student } = await supabase.from("profiles").select("*").eq("id", id).single<Profile>();
  if (!student) notFound(); // RLS hides students you don't supervise

  const [{ data: entries }, { data: reviews }] = await Promise.all([
    supabase.from("entries").select("*").eq("student_id", id).order("entry_date"),
    supabase.from("reviews").select("*").eq("student_id", id),
  ]);
  const list = (entries ?? []) as Entry[];
  const first = list[0]?.entry_date;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{student.full_name}</h1>
        <p className="text-sm text-stone-500">
          {[student.matric_no, student.institution, student.company].filter(Boolean).join(" · ")}
        </p>
      </div>
      {groupByWeek(list).map(({ week, items }) => {
        const review = (reviews as Review[] | null)?.find((r) => r.week_start === week);
        return (
          <section key={week} className="card p-5">
            <WeekHeader week={week} first={first!} review={review} />
            <div className="mt-3">
              {items.map((e) => (
                <EntryRow key={e.id} e={e} />
              ))}
            </div>
            <form action={reviewWeek} className="mt-4 grid gap-2 border-t border-stone-100 pt-4">
              <input type="hidden" name="student_id" value={id} />
              <input type="hidden" name="week_start" value={week} />
              <label className="field">
                <span>Comment</span>
                <input name="comment" defaultValue={review?.comment ?? ""} placeholder="Good progress this week." />
              </label>
              <div className="flex gap-2">
                <button name="status" value="approved" className="btn">
                  Approve week
                </button>
                <button name="status" value="needs_changes" className="btn-outline">
                  Request changes
                </button>
              </div>
            </form>
          </section>
        );
      })}
    </div>
  );
}
