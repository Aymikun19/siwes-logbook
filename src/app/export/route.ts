import { createClient } from "@/lib/supabase/server";
import { csvResponse } from "@/lib/csv";
import { weekStart } from "@/lib/weeks";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Sign in first", { status: 401 });
  const { data } = await supabase
    .from("entries")
    .select("entry_date, hours, activities, skills_learned")
    .eq("student_id", user.id)
    .order("entry_date");
  const rows = (data ?? []).map((e) => [e.entry_date, weekStart(e.entry_date), e.hours, e.activities, e.skills_learned]);
  return csvResponse("siwes-logbook.csv", [["Date", "Week starting", "Hours", "Activities", "Skills learned"], ...rows]);
}
