export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "supervisor";
  matric_no: string | null;
  institution: string | null;
  company: string | null;
  supervisor_email: string | null;
};

export type Entry = {
  id: string;
  student_id: string;
  entry_date: string;
  activities: string;
  skills_learned: string | null;
  hours: number;
};

export type Review = {
  id: string;
  student_id: string;
  week_start: string;
  status: "approved" | "needs_changes";
  comment: string | null;
  reviewed_at: string;
};
