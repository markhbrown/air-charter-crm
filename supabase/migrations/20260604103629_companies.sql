-- Companies: the operators / corporate clients the broker works with.
-- Each row is owned by the user who created it (user_id), and RLS scopes
-- all access to that owner.

-- Shared helper to keep updated_at current on row updates. Created here in the
-- first migration so later tables can reuse it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  country text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_user_id_idx on public.companies (user_id);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- Row Level Security: owner-only access.
alter table public.companies enable row level security;

create policy "Users can view their own companies"
  on public.companies for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own companies"
  on public.companies for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own companies"
  on public.companies for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own companies"
  on public.companies for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Explicit privileges per https://github.com/orgs/supabase/discussions/45329.
-- New tables in `public` still inherit blanket grants from Supabase's legacy
-- default privileges, so revoke first, then grant exactly what each role needs.
-- The result: `anon` gets nothing (private CRM data), `authenticated` gets DML
-- only (RLS scopes it to their own rows). RLS governs rows; GRANTs govern ops.
-- service_role is revoked too (Supabase default-privileges grant it full access
-- to new public tables): this app never uses the Secret key / service_role, so
-- least-privilege keeps the data reachable only by the authenticated owner.
revoke all on public.companies from anon, authenticated, service_role;
grant select, insert, update, delete on public.companies to authenticated;
