import { requireUser } from "@/lib/supabase/server";
import { addDays, fmt, groupByWeek, weekNumber } from "@/lib/weeks";
import type { Entry, Profile, Review } from "@/lib/types";
import { PrintButton } from "./PrintButton";

export default async function PrintLogbook() {
  const { supabase, user } = await requireUser();
  const [{ data: me }, { data: entries }, { data: reviews }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("entries").select("*").eq("student_id", user.id).order("entry_date"),
    supabase.from("reviews").select("*").eq("student_id", user.id),
  ]);
  const list = (entries ?? []) as Entry[];
  const weeks = groupByWeek(list).reverse();
  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-[13px] print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <header className="border-b-2 border-stone-800 pb-4 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wide">SIWES Daily Logbook</h1>
        <p className="mt-2">
          {me?.full_name} · {me?.matric_no} · {me?.institution}
        </p>
        <p>Place of attachment: {me?.company}</p>
      </header>
      {weeks.map(({ week, items }) => {
        const r = (reviews as Review[] | null)?.find((x) => x.week_start === week);
        return (
          <section key={week} className="mt-6 break-inside-avoid">
            <h2 className="font-bold">
              Week {weekNumber(list[0].entry_date, week)}: {fmt(week, { day: "numeric", month: "long" })} to{" "}
              {fmt(addDays(week, 6), { day: "numeric", month: "long", year: "numeric" })}
            </h2>
            <table className="mt-2 w-full border-collapse">
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="align-top">
                    <td className="w-28 border border-stone-400 p-2 font-medium">{fmt(e.entry_date)}</td>
                    <td className="border border-stone-400 p-2 whitespace-pre-wrap">
                      {e.activities}
                      {e.skills_learned && <div className="mt-1 italic">Skills: {e.skills_learned}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2">
              Supervisor&apos;s remark: {r ? `${r.status === "approved" ? "Approved" : "Changes requested"}${r.comment ? `: ${r.comment}` : ""}` : "________________"}
            </p>
          </section>
        );
      })}
    </article>
  );
}
