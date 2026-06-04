-- Contacts: people at a company. Each contact belongs to exactly one company
-- and is owned by the user who created it.

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  email text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_id_idx on public.contacts (user_id);
create index contacts_company_id_idx on public.contacts (company_id);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Row Level Security: owner-only access.
alter table public.contacts enable row level security;

create policy "Users can view their own contacts"
  on public.contacts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own contacts"
  on public.contacts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own contacts"
  on public.contacts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own contacts"
  on public.contacts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Explicit Data API privileges (https://github.com/orgs/supabase/discussions/45329):
-- revoke inherited blanket grants, then grant exactly what each role needs.
revoke all on public.contacts from anon, authenticated, service_role;
grant select, insert, update, delete on public.contacts to authenticated;
