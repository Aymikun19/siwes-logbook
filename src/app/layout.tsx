import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SIWES Logbook",
  description: "A digital industrial-training logbook for students and supervisors.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body>
        <header className="border-b border-stone-200 bg-white print:hidden">
          <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="font-semibold">
              <span className="text-accent">▣</span> SIWES Logbook
            </Link>
            {user && (
              <div className="flex items-center gap-4 text-sm">
                <Link href="/settings" className="text-stone-600 hover:text-stone-900">
                  Settings
                </Link>
                <form action="/auth/signout" method="post">
                  <button className="text-stone-600 hover:text-stone-900">Sign out</button>
                </form>
              </div>
            )}
          </nav>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
