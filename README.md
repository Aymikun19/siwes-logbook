# SIWES Logbook

A digital logbook for the **Student Industrial Work Experience Scheme (SIWES)**. Students record what they do each day. Industry supervisors review and approve each week online. The finished logbook prints, or saves as a PDF, in a clean format for submission.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e) ![Tests](https://img.shields.io/badge/tests-vitest-yellow)

## Features

- **Daily entries**: activities, skills learned and hours, with one entry per day (re-saving updates it)
- **Weekly grouping**: entries roll up into numbered placement weeks (Week 1, Week 2…)
- **Supervisor review**: supervisors see only the students who listed their email, and can approve a week or request changes with a comment
- **Printable logbook**: a print stylesheet produces a submission-ready logbook, so *Save as PDF* works in any browser
- **Secure by default**: Postgres Row Level Security means students only see their own data, and supervisors only see their students

## Tech

Next.js 16 (App Router, Server Actions) · Supabase (Auth, Postgres, RLS) · Tailwind CSS v4 · Zod · Vitest

## How access control works

Students store a `supervisor_email`. A `security definer` SQL function, `supervises(student)`, checks that the signed-in user is a supervisor whose email matches. Every RLS policy for entries and reviews uses it, so authorization lives in the database, not just the UI.

## Run it

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
2. `cp .env.example .env.local` and add your project URL and anon key.
3. Start the app:

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests for the week logic
```

## Project structure

```
src/app/page.tsx              student dashboard / supervisor student list
src/app/students/[id]         supervisor review page
src/app/print                 printable logbook
src/app/actions.ts            Server Actions (entries, settings, reviews)
src/lib/weeks.ts              week grouping + numbering (unit tested)
supabase/schema.sql           tables, trigger, RLS policies
```
