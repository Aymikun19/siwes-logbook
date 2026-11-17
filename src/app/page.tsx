import { ArrowRight, CalendarCheck, Clock, Download, Flame, Printer, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { fmt, groupByWeek } from "@/lib/weeks";
import { heatmap, streak, todayISO, topSkills, weeklyHours } from "@/lib/stats";
import type { Entry, Profile, Review } from "@/lib/types";
import { EntryRow, WeekHeader } from "@/components";
import { Landing } from "@/components/kit/Landing";
import { BarChart } from "@/components/kit/Charts";
import { EmptyState, Stat } from "@/components/kit/Stat";
import { EntryForm } from "./EntryForm";
import { EntryActions } from "./EntryActions";
import { Heatmap } from "./Heatmap";

export default async function Home() {
  const { supabase, user } = await getUser();
  if (!user) return <Landing />;
  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!me) return null;
  if (me.role === "supervisor") return <SupervisorHome me={me} />;

  const [{ data: entries }, { data: reviews }] = await Promise.all([
    supabase.from("entries").select("*").eq("student_id", user.id).order("entry_date"),
    supabase.from("reviews").select("*").eq("student_id", user.id),
  ]);
  const list = (entries ?? []) as Entry[];
  const reviewList = (reviews ?? []) as Review[];
  const today = todayISO();
  const weeks = groupByWeek(list);
  const first = list[0]?.entry_date ?? today;
  const reviewFor = (w: string) => reviewList.find((r) => r.week_start === w);
  const totalHours = list.reduce((s, e) => s + Number(e.hours), 0);
  const approved = reviewList.filter((r) => r.status === "approved").length;
  const weekly = weeklyHours(list, today);
  const skills = topSkills(list);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{me.company ?? "Your placement"}</p>
          <h1 className="page-title mt-1">Hi {me.full_name.split(" ")[0] || "there"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/export" className="btn-outline">
            <Download size={16} aria-hidden /> Export CSV
          </a>
          <Link href="/print" className="btn-outline">
            <Printer size={16} aria-hidden /> Print / PDF
          </Link>
        </div>
      </div>

      {!me.supervisor_email && (
        <p className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add your industry supervisor&apos;s email in{" "}
          <Link className="font-medium underline" href="/settings">Settings</Link> so they can review your weeks.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Days logged" value={String(list.length)} hint={list.length ? `Since ${fmt(first, { day: "numeric", month: "short" })}` : "Log your first day below"} />
        <Stat icon={Clock} label="Total hours" value={String(totalHours)} hint={list.length ? `${(totalHours / list.length).toFixed(1)}h per day on average` : undefined} />
        <Stat icon={ShieldCheck} label="Weeks approved" value={`${approved}/${weeks.length}`} hint="By your supervisor" />
        <Stat icon={Flame} label="Current streak" value={`${streak(list, today)} days`} hint="Working days in a row" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="card p-6" aria-labelledby="log">
          <h2 id="log" className="mb-4 font-semibold">Log a day</h2>
          <EntryForm today={today} />
        </section>
        <div className="grid gap-6">
          <section className="card p-6" aria-labelledby="hours">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 id="hours" className="font-semibold">Hours per week</h2>
              <span className="text-xs text-stone-500">Last 12 weeks</span>
            </div>
            <BarChart
              label="Hours logged per week"
              data={weekly.map((w) => ({ label: fmt(w.week, { day: "numeric", month: "short" }), value: w.hours, hint: `Week of ${fmt(w.week, { day: "numeric", month: "short" })}: ${w.hours}h` }))}
              height={120}
            />
          </section>
          <section className="card p-6" aria-labelledby="cal">
            <h2 id="cal" className="mb-4 font-semibold">Activity</h2>
            <Heatmap grid={heatmap(list, today)} />
          </section>
        </div>
      </div>

      {skills.length > 0 && (
        <section className="card p-6" aria-labelledby="skills">
          <h2 id="skills" className="mb-4 font-semibold">Skills you&apos;ve picked up</h2>
          <ul className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s.label} className="badge !bg-accent/10 !px-3 !py-1 !text-sm !text-accent">
                {s.label}
                {s.n > 1 && <span className="text-xs opacity-70">×{s.n}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4" aria-labelledby="weeks">
        <h2 id="weeks" className="text-lg font-semibold">Your weeks</h2>
        {weeks.length === 0 && <EmptyState icon={CalendarCheck} title="No entries yet" text="Your logged days appear here, grouped into weeks for your supervisor to review." />}
        {weeks.map(({ week, items }) => {
          const review = reviewFor(week);
          const locked = review?.status === "approved";
          return (
            <article key={week} className="card p-5">
              <WeekHeader week={week} first={first} review={review} />
              {review?.comment && <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">Supervisor: “{review.comment}”</p>}
              <div className="mt-3">
                {items.map((e) => (
                  <div key={e.id} className="flex items-start gap-2">
                    <div className="flex-1"><EntryRow e={e} /></div>
                    <div className="pt-2"><EntryActions entry={e} today={today} locked={locked} /></div>
                  </div>
                ))}
              </div>
              {locked && <p className="mt-2 text-xs text-stone-500">Approved weeks are locked.</p>}
            </article>
          );
        })}
      </section>
    </div>
  );
}

async function SupervisorHome({ me }: { me: Profile }) {
  const { supabase } = await getUser();
  const [{ data: students }, { data: entries }, { data: reviews }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, matric_no, institution").neq("id", me.id),
    supabase.from("entries").select("student_id, entry_date"),
    supabase.from("reviews").select("student_id, week_start"),
  ]);
  const pending = (id: string) => {
    const days = (entries ?? []).filter((e) => e.student_id === id).length;
    const reviewed = (reviews ?? []).filter((r) => r.student_id === id).length;
    return { days, reviewed };
  };
  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Supervisor</p>
        <h1 className="page-title mt-1">Your SIWES students</h1>
        <p className="mt-1 text-sm text-stone-500">Students who list {me.email} as their supervisor appear here.</p>
      </div>
      {(students ?? []).length === 0 && <EmptyState icon={Users} title="No students linked yet" text="Ask your students to add your email address in their Settings." />}
      <div className="grid gap-3 sm:grid-cols-2">
        {(students ?? []).map((s) => {
          const p = pending(s.id);
          return (
            <Link key={s.id} href={`/students/${s.id}`} className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:border-accent">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {(s.full_name || s.email).slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-medium">{s.full_name || s.email}</p>
                  <p className="text-xs text-stone-500">{[s.matric_no, s.institution].filter(Boolean).join(" · ") || s.email}</p>
                  <p className="mt-1 text-xs text-stone-500">{p.days} days logged · {p.reviewed} weeks reviewed</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-accent" aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
