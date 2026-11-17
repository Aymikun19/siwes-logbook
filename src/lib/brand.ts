import { ChartColumn, ClipboardCheck, FileDown, NotebookPen, PencilLine, Printer } from "lucide-react";

export const brand = {
  name: "SIWES Logbook",
  short: "Digital industrial-training logbook",
  eyebrow: "For SIWES students and industry supervisors",
  tagline: "Your SIWES logbook, finally digital.",
  description:
    "Log what you did each day in seconds, get each week signed off by your industry supervisor online, and export a clean, printable logbook when it is time to submit.",
  cta: { href: "/login?mode=signup", label: "Start your logbook" },
  proof: ["Free to use", "Works on any phone", "Supervisor sign-off built in"],
  features: [
    { icon: NotebookPen, title: "Daily entries in seconds", text: "Record activities, hours and skills learned for each working day, grouped into weeks automatically." },
    { icon: ClipboardCheck, title: "Weekly supervisor review", text: "Your supervisor approves each week or requests changes, with comments you can see right away." },
    { icon: ChartColumn, title: "Progress dashboard", text: "Hours per week, an activity calendar, your logging streak and how many weeks are approved." },
    { icon: PencilLine, title: "Edit without starting over", text: "Fix a typo or add a detail to any entry before your supervisor reviews the week." },
    { icon: Printer, title: "Print or save as PDF", text: "A clean, school-ready logbook layout you can print or attach to your SIWES report." },
    { icon: FileDown, title: "Export to CSV", text: "Download every entry as a spreadsheet for your own records or your report appendix." },
  ],
  steps: [
    ["Create your account", "Sign up and add your company, institution and supervisor's email in Settings."],
    ["Log every working day", "Write what you did, how long it took and what you learned. It takes under a minute."],
    ["Get signed off", "Your supervisor reviews each week online. Print the finished logbook when you are done."],
  ] as [string, string][],
  closing: "Spend your SIWES learning, not rewriting your logbook.",
  nav: [
    { href: "/", label: "Logbook" },
    { href: "/print", label: "Print" },
    { href: "/settings", label: "Settings" },
  ] as { href: string; label: string; public?: boolean }[],
  width: "max-w-5xl",
  repo: "https://github.com/Aymikun19/siwes-logbook",
  preview: null as string | null,
};
