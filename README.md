# CodeLabs

A platform for authoring step-by-step coding labs and letting learners work
through them at their own pace with progress tracking. Built with **Next.js 16
(App Router)** and **Supabase** (Postgres, Auth, Storage).

- **You** are the sole author/admin: create, edit and publish labs through a
  rich WYSIWYG editor.
- **Anyone** can sign up to read along and track their progress (per-step
  completion + resume where they left off).
- Cursor-inspired light/dark theme.

## Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- Supabase: Postgres + Row Level Security, Auth (email + GitHub/Google OAuth), Storage
- Tailwind CSS v4, Radix primitives, Tiptap editor (with syntax-highlighted code blocks)
- `next-themes`, `zod`, `lowlight`

## Getting started

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then in the SQL editor
run the migrations in order:

1. `supabase/migrations/0001_init.sql` — tables, RLS, triggers, `is_admin()`
2. `supabase/migrations/0002_storage.sql` — the public `lab-assets` bucket + policies
3. `supabase/migrations/0003_step_templates.sql` — reusable step-content templates
4. `supabase/migrations/0004_public_profile.sql` — aggregated activity/completed-lab functions for public profiles
5. `supabase/migrations/0005_modules_hints.sql` — step modules, per-step hints, and the learner hints preference

### 2. Configure OAuth (optional but recommended)

In **Authentication → Providers**, enable **GitHub** and **Google** and add their
client IDs/secrets. Add `http://localhost:3000/auth/callback` (and your prod URL)
to the provider redirect/callback allow-lists and to **URL Configuration →
Redirect URLs**.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 5. Make yourself an admin

Sign up once through the app (this creates your `profiles` row via a trigger),
then in the Supabase SQL editor run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Reload the app — you'll now see the **Author** link and can create labs at `/admin`.

## How it works

| Area | Path |
| --- | --- |
| Landing | `src/app/page.tsx` |
| Public catalog (search + tags) | `src/app/labs/page.tsx` |
| Lab overview (start/resume) | `src/app/labs/[slug]/page.tsx` |
| Step viewer (read-along + mark complete) | `src/app/labs/[slug]/steps/[position]/page.tsx` |
| Public profile (activity graph + completed labs) | `src/app/u/[id]/page.tsx` |
| Admin authoring | `src/app/admin/**` |
| Reusable step templates | `src/app/admin/templates/**` |
| Image pool + template pickers (editor) | `src/components/editor/media-library.tsx`, `template-picker.tsx` |
| Auth | `src/app/(auth)/login`, `src/app/auth/callback`, `src/app/auth/confirm` |
| Supabase clients / session proxy | `src/lib/supabase/*`, `src/proxy.ts` |
| Data access | `src/lib/queries.ts` |
| Server Actions | `src/lib/actions/*` |
| Schema | `supabase/migrations/*` |

Security is enforced by Postgres **Row Level Security**: drafts and authoring are
restricted to the admin via `is_admin()`, and each learner can only read/write
their own progress rows.

## Deploy

Deploy to Vercel, set the same env vars (with `NEXT_PUBLIC_SITE_URL` = your
production origin), and add `https://your-domain/auth/callback` to Supabase's
redirect URLs and each OAuth provider.
