This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local development with Supabase

This project uses a local Supabase stack (run via the Supabase CLI) for the database and auth.

```bash
supabase start                      # boot Postgres, Auth, Studio, etc.
cp .env.local.example .env.local    # then paste keys from `supabase status`
supabase db reset                   # apply migrations + load seed data
npm run dev
```

`supabase status` prints the API URL and the **Publishable** key — put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase Studio is at http://127.0.0.1:54323.

### Test accounts

`supabase db reset` seeds **three** accounts (all `Password123!`):

| Email | Role | Sees |
| --- | --- | --- |
| `broker1@aircharter.test` | owner | only its own data (Meridian / Acme / Aurora) |
| `broker2@aircharter.test` | owner | only its own data (a separate set) |
| `admin@aircharter.test` | admin | **all** accounts' data, and can manage it |

Log in as the two owners to see Row Level Security in action — **neither sees the other's data**. Log
in as `admin@` to see (and create/edit/delete) **everything**. All are **local only** — recreated on
every `supabase db reset` and absent from any hosted/deployed environment.

## Security & data access

Every record is tied to the user who created it, and **Row Level Security (RLS) guarantees a user can
only ever access their own data.**

- **Authentication** — Supabase Auth (email/password). The session is carried in `@supabase/ssr`
  cookies and refreshed on every request by `src/proxy.ts` → `updateSession()`, which also enforces
  routing: only `/login` is public, and the dashboard layout re-checks `getUser()` before any data
  fetch as a backstop.
- **Ownership** — each table (`companies`, `contacts`, `inquiries`) has
  `user_id uuid not null default auth.uid()` referencing `auth.users`. Inserts **omit** `user_id`, so
  the database default sets it from the authenticated session — a client cannot spoof ownership.
- **Row Level Security** — RLS is enabled on every table with owner-only policies for all four
  commands, e.g.:

  ```sql
  create policy "Users can view their own companies"
    on public.companies for select
    to authenticated
    using ((select auth.uid()) = user_id);
  -- insert/update/delete policies likewise check (select auth.uid()) = user_id
  ```

  Table privileges are granted explicitly — `revoke all ... from anon` (the data is private) and
  `grant ... to authenticated, service_role` — so a table is never reachable by the public key
  without policies.
- **Admin role** — an optional back-office role. A user whose `app_metadata.role = "admin"` (set
  server-side, not user-editable, and carried in the verified JWT) gets extra permissive policies that
  read the role from `auth.jwt()` and grant **full access to every owner's data**:

  ```sql
  create policy "Admins can view all companies"
    on public.companies for select
    to authenticated
    using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  -- plus matching update/delete admin policies; these OR with the owner policies
  ```

  These OR with the owner policies, so non-admins are unaffected — they still only see/manage their own
  rows. (`admin@aircharter.test` is the seeded admin.) Admins also get a **User management** page at
  `/dashboard/admin` (admin-only route; non-admins are redirected) to grant/revoke admin on other users
  — backed by admin-gated `SECURITY DEFINER` functions (`list_app_users`, `set_user_admin`) that refuse
  to let you change your own role.
- **Keys** — the browser only ever uses the **Publishable** key; the **Secret** (service-role) key is
  server-only and never shipped to the client.
- **See it yourself** — sign in as `broker1@aircharter.test` then `broker2@aircharter.test` (both
  `Password123!`): each sees only its own companies/contacts/inquiries. Then sign in as
  `admin@aircharter.test` to see and manage all of it. Unauthenticated requests are redirected to
  `/login`, and the data API returns zero rows without a valid session.

### Limitations & what I'd do next

- The model is **single-owner isolation**. To support a brokerage **team sharing** the same data, I'd
  add `organizations` + `memberships(role admin/member)` and an `org_id` on each table, then switch
  the RLS policies to membership-based checks via `security definer` helper functions
  (`is_org_member` / `is_org_admin`) to avoid policy recursion — with an org-creation trigger to
  bootstrap the first admin and an active-org switcher in the UI.
- Inviting **brand-new** (unregistered) users would need email-token invites
  (`auth.admin.inviteUserByEmail`, server-side with the Secret key).
- The seeded accounts are local-only fixtures; hosted environments use real sign-up.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
