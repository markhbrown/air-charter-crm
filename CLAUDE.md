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

## Architecture

Next.js App Router with the `src/` directory. Import alias: `@/*` -> `./src/*`.

**The three Supabase clients (do not mix them up):**

- `src/lib/supabase/client.ts` — `createClient()` for **Client Components** (`"use client"`). Browser-side.
- `src/lib/supabase/server.ts` — async `createClient()` for **Server Components, Route Handlers, and Server Actions**. `cookies()` is async in Next 15+, so this factory is async — always `await createClient()`.
- `src/lib/supabase/middleware.ts` — `updateSession()`, called from `src/proxy.ts` on every matched request. It refreshes the auth session and syncs auth cookies between browser and server. Without it, Server Components can read a stale/expired session.

Note: Next.js 16 renamed the request-interception file convention from `middleware.ts` to **`proxy.ts`** (exported function `proxy`). The session-refresh helper module keeps the `middleware.ts` filename, matching Supabase's docs; only the framework convention file is `src/proxy.ts`.

Auth gating is intentionally left open in `updateSession()` — add route protection there (commented example included) as protected areas are built.

## Conventions

- **Next.js**: Server Components are the default; add `"use client"` only when a component needs interactivity/browser APIs. `await` the async `cookies()`, `headers()`, `params`, and `searchParams`. Fetch data on the server (Server Components / Server Actions) rather than client-side effects where possible. Co-locate routes under `src/app`.
- **Supabase**: Access the DB through the appropriate client above. Do data mutations in Server Actions / Route Handlers using the server client. Keep schema changes in versioned migrations (`supabase migration new`), never by editing the DB by hand — and regenerate `database.types.ts` afterward. Use the Publishable key on the client; the Secret key only server-side.
- **Row Level Security (RLS) is mandatory.** Every table must have RLS enabled (`alter table <t> enable row level security;`) with explicit policies in the same migration that creates it. Never ship a table reachable by the Publishable key without policies. Treat a table without RLS as a bug.
- **UI**: Use **shadcn/ui** as the component library. Add components with `npx shadcn@latest add <component>` (run `npx shadcn@latest init` once if not yet initialized) and compose from those primitives rather than hand-rolling equivalent components. Styling is Tailwind CSS v4.
