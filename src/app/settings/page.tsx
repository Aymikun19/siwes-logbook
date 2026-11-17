import { requireUser } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { saveSettings } from "../actions";

export default async function Settings() {
  const { supabase, user } = await requireUser();
  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const f = (name: keyof Profile, label: string, placeholder = "") => (
    <label className="field">
      <span>{label}</span>
      <input name={name} defaultValue={(me?.[name] as string) ?? ""} placeholder={placeholder} />
    </label>
  );
  return (
    <form action={saveSettings} className="card mx-auto grid w-full max-w-xl gap-4 p-6 sm:p-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="page-title mt-1">Settings</h1>
      </div>
      <label className="field">
        <span>I am a…</span>
        <select name="role" defaultValue={me?.role}>
          <option value="student">Student</option>
          <option value="supervisor">Industry supervisor</option>
        </select>
      </label>
      {f("full_name", "Full name")}
      {f("matric_no", "Matric number", "RUN/CMP/24/00000")}
      {f("institution", "Institution")}
      {f("company", "Placement company")}
      {f("supervisor_email", "Supervisor's email (students only)", "supervisor@company.com")}
      <button className="btn justify-self-start">Save settings</button>
    </form>
  );
}
