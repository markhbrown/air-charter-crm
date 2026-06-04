# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Air Charter CRM — a Next.js (App Router) + Supabase application, with Supabase run locally via the Supabase CLI. The project spec lives in `.claude/specs/` — read it before implementing features.

## Commands

```bash
npm run dev      # Next.js dev server -> http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (eslint-config-next)
npx tsc --noEmit # typecheck only

# Local Supabase (requires the Supabase CLI's container runtime running)
supabase start                       # boot the local stack (API :54321, Studio :54323, DB :54322, Mailpit :54324)
supabase stop                        # stop it; `supabase status` prints URLs + keys
supabase db reset                    # drop, recreate, re-run all migrations + seed.sql
supabase migration new <name>        # create a new timestamped migration in supabase/migrations/
supabase gen types typescript --local > src/lib/database.types.ts  # regenerate DB types after schema changes
```

Only one local Supabase stack can use the default ports at a time. If `supabase start` fails with "port is already allocated", another project's stack is running — stop it (`supabase stop --project-id <name>`) or remap ports in `supabase/config.toml`.

## Environment

Copy `.env.local.example` to `.env.local`. This CLI uses the **new key format**: `supabase status` prints a **Publishable** key (browser-safe; use it for `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and a **Secret** key (service-role equivalent — server-only, never expose to the browser or commit it).

`supabase/seed.sql` (loaded by `supabase db reset`) creates **three local-only** test accounts (all `Password123!`): `broker1@aircharter.test` and `broker2@aircharter.test` are owners with separate data (demonstrating RLS owner-isolation — neither sees the other's rows), and `admin@aircharter.test` is a full-access admin. The admin carries `raw_app_meta_data.role = 'admin'`; the `20260604130520_admin_full_access.sql` migration adds permissive policies that read `auth.jwt() -> 'app_metadata' ->> 'role'` and grant admins select/update/delete across every owner's rows (these OR with the owner policies, so non-admins are unaffected). All are recreated on every reset and do not exist on hosted environments. The seed inserts into both `auth.users` and `auth.identities` (the latter is required for email/password login in current GoTrue).

Admins get a **User management** page at `src/app/dashboard/admin/` — an admin-only route (the page redirects non-admins to `/dashboard`, and the sidebar `Admin` link is gated by `isAdmin` passed from the dashboard layout). It uses two admin-gated `SECURITY DEFINER` functions from `20260604132206_admin_user_management.sql`: `list_app_users()` and `set_user_admin(_user_id, _is_admin)`, which write `auth.users.raw_app_meta_data.role` and refuse to change the caller's own role. Note: `public.is_admin()` must `coalesce(... , false)` — a missing role yields NULL and `not NULL` would let the `SECURITY DEFINER` guards fall through.

## Architecture

Next.js App Router with the `src/` directory. Import alias: `@/*` -> `./src/*`.

**Supabase access uses one client type — the server client (`createServerClient`, Publishable key) — instantiated for two different runtime contexts (don't mix them up):**

- `src/lib/supabase/server.ts` — async `createClient()` for **Server Components, Route Handlers, and Server Actions**. Reads/writes cookies via `next/headers` `cookies()`, which is async in Next 15+, so this factory is async — always `await createClient()`. All data access goes through this; it *uses* the session.
- `src/lib/supabase/middleware.ts` — `updateSession()`, called from `src/proxy.ts` on every matched request. Binds a server client to the `NextRequest`/`NextResponse` cookies (the proxy layer has no `next/headers`) and *refreshes* the session, syncing auth cookies between browser and server. Without it, Server Components can read a stale/expired session.

(There's no browser client — nothing queries Supabase from the client. If a Client Component ever needs one, add `createBrowserClient` from `@supabase/ssr`.)

Note: Next.js 16 renamed the request-interception file convention from `middleware.ts` to **`proxy.ts`** (exported function `proxy`). The session-refresh helper module keeps the `middleware.ts` filename, matching Supabase's docs; only the framework convention file is `src/proxy.ts`.

Route protection lives in `updateSession()`: unauthenticated requests are redirected to `/login` (only `/login` is public) and signed-in users are redirected off `/login`. The dashboard layout re-checks `getUser()` as a backstop before any data fetch.

## Conventions

- **Next.js**: Server Components are the default; add `"use client"` only when a component needs interactivity/browser APIs. `await` the async `cookies()`, `headers()`, `params`, and `searchParams`. Fetch data on the server (Server Components / Server Actions) rather than client-side effects where possible. Co-locate routes under `src/app`.
- **Supabase**: Access the DB through the appropriate client above. Do data mutations in Server Actions / Route Handlers using the server client. Keep schema changes in versioned migrations (`supabase migration new`), never by editing the DB by hand — and regenerate `database.types.ts` afterward. Use the Publishable key on the client; the Secret key only server-side.
- **Row Level Security (RLS) is mandatory.** Every table must have RLS enabled (`alter table <t> enable row level security;`) with explicit policies in the same migration that creates it. Never ship a table reachable by the Publishable key without policies. Treat a table without RLS as a bug.
- **UI**: Use **shadcn/ui** as the component library. Add components with `npx shadcn@latest add <component>` (run `npx shadcn@latest init` once if not yet initialized) and compose from those primitives rather than hand-rolling equivalent components. Styling is Tailwind CSS v4.
- **shadcn here is built on Base UI** (`@base-ui/react`), not Radix. Consequences that bite:
  - `Button` (and anything built on it) **defaults `type="button"`**. A button that submits a form MUST set `type="submit"` explicitly, or the form silently won't submit.
  - To render a custom element as a trigger, use the **`render` prop** (`<DialogTrigger render={<Button/>} />`), not Radix's `asChild`.
  - **Build triggers inside the Client Component, never pass a Base UI element across the RSC boundary.** A `<DialogTrigger>`/`<Button>` element created in a Server Component page and passed as a prop misaligns Base UI's internal `useId`, causing a hydration mismatch on the `id` attribute. The dialog components own their own triggers (varying by an `isEdit`/data prop) for this reason.
  - For `Select`, drive it with React state + a `<input type="hidden" name=...>` rather than relying on the native `name` to post, and pass `items={[{label,value}]}` to the root so `SelectValue` shows the label (useful when the value is an id).
- **Forms & mutations**: dialogs on the list pages use Server Actions with `useActionState`. Actions return a `FormState` (`@/lib/forms`) — `{ ok }` to close the dialog, `{ fieldErrors }` from a Zod `safeParse`, or `{ error }` for a DB error. Inserts omit `user_id` (the column defaults to `auth.uid()`); the RLS insert policy enforces ownership. After a mutation, `revalidatePath` the affected list + `/dashboard`. Two gotchas that already bit us:
  - **React 19 resets a `<form action={…}>` after every submit**, including failed ones — which clears uncontrolled fields. To preserve input on a validation error, the action echoes the submitted strings back in `FormState.values` and the inputs use `defaultValue={state?.values?.x ?? record?.x ?? ""}`.
  - **Zod v4 `z.string().uuid()` enforces RFC version/variant bits.** The seed data uses placeholder UUIDs (e.g. `10000000-…-0002`) that fail it, so FK ids are validated with `z.string().min(1)` instead — the Postgres `uuid` column already rejects malformed values.
