import { ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { groupByWeek, toISODate } from "@/lib/weeks";
import type { Entry, Profile, Review } from "@/lib/types";
import { EntryRow, WeekHeader } from "@/components";
import { EntryForm } from "./EntryForm";
import { deleteEntry } from "./actions";

export default async function Dashboard() {
  const { supabase, user } = await requireUser();
  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!me) return null;
  if (me.role === "supervisor") return <SupervisorHome me={me} />;

  const [{ data: entries }, { data: reviews }] = await Promise.all([
    supabase.from("entries").select("*").eq("student_id", user.id).order("entry_date"),
    supabase.from("reviews").select("*").eq("student_id", user.id),
  ]);
  const list = (entries ?? []) as Entry[];
  const weeks = groupByWeek(list);
  const first = list[0]?.entry_date ?? toISODate(new Date());
  const reviewFor = (w: string) => (reviews as Review[] | null)?.find((r) => r.week_start === w);
  const totalHours = list.reduce((s, e) => s + Number(e.hours), 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Hi {me.full_name.split(" ")[0] || "there"}</h1>
          <p className="text-sm text-stone-500">
            {list.length} days logged · {totalHours} hours · {me.company ?? "Set your company in Settings"}
          </p>
        </div>
        <Link href="/print" className="btn-outline">
          <Printer size={16} aria-hidden /> Print / save as PDF
        </Link>
      </div>
      {!me.supervisor_email && (
        <p className="card border-amber-200 bg-amber-50 p-4 text-sm">
          Add your industry supervisor&apos;s email in <Link className="underline" href="/settings">Settings</Link> so they can review your weeks.
        </p>
      )}
      <EntryForm today={toISODate(new Date())} />
      {weeks.map(({ week, items }) => {
        const review = reviewFor(week);
        return (
          <section key={week} className="card p-5">
            <WeekHeader week={week} first={first} review={review} />
            {review?.comment && (
              <p className="mt-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">Supervisor: “{review.comment}”</p>
            )}
            <div className="mt-3">
              {items.map((e) => (
                <div key={e.id} className="group relative">
                  <EntryRow e={e} />
                  <form action={deleteEntry.bind(null, e.id)} className="absolute right-0 top-3 hidden group-hover:block">
                    <button className="text-xs text-red-500">delete</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

async function SupervisorHome({ me }: { me: Profile }) {
  const { supabase } = await requireUser();
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, matric_no, institution")
    .neq("id", me.id);
  return (
    <div>
      <h1 className="text-2xl font-semibold">Your SIWES students</h1>
      <p className="text-sm text-stone-500">Students who listed {me.email} as their supervisor appear here.</p>
      <div className="mt-6 grid gap-3">
        {(students ?? []).length === 0 && <p className="card p-6 text-sm text-stone-500">No students linked yet.</p>}
        {(students ?? []).map((s) => (
          <Link key={s.id} href={`/students/${s.id}`} className="card flex items-center justify-between p-4 hover:border-accent">
            <div>
              <p className="font-medium">{s.full_name || s.email}</p>
              <p className="text-xs text-stone-500">
                {[s.matric_no, s.institution].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-accent">
              Review <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
