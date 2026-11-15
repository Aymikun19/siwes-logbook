"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";

const entrySchema = z.object({
  entry_date: z.iso.date(),
  activities: z.string().trim().min(5, "Describe what you did"),
  skills_learned: z.string().trim().optional(),
  hours: z.coerce.number().min(0).max(24),
});

export async function saveEntry(_prev: { error?: string }, form: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = entrySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await supabase
    .from("entries")
    .upsert({ ...parsed.data, student_id: user.id }, { onConflict: "student_id,entry_date" });
  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}

export async function deleteEntry(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("entries").delete().eq("id", id);
  revalidatePath("/");
}

export async function saveSettings(form: FormData) {
  const { supabase, user } = await requireUser();
  const s = (k: string) => String(form.get(k) || "").trim() || null;
  await supabase
    .from("profiles")
    .update({
      full_name: s("full_name") ?? "",
      role: form.get("role") === "supervisor" ? "supervisor" : "student",
      matric_no: s("matric_no"),
      institution: s("institution"),
      company: s("company"),
      supervisor_email: s("supervisor_email"),
    })
    .eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function reviewWeek(form: FormData) {
  const { supabase, user } = await requireUser();
  const student_id = String(form.get("student_id"));
  await supabase.from("reviews").upsert(
    {
      student_id,
      week_start: String(form.get("week_start")),
      supervisor_id: user.id,
      status: form.get("status") === "approved" ? "approved" : "needs_changes",
      comment: String(form.get("comment") || "") || null,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,week_start" },
  );
  revalidatePath(`/students/${student_id}`);
}
