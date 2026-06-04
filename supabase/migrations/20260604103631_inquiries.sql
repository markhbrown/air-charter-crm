-- Inquiries: requests for charter quotes. Linked to a company and optionally a
-- contact. Owned by the user who created it.

create type public.inquiry_status as enum ('New', 'Quoting', 'Won', 'Lost');

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  origin_airport text not null,
  destination_airport text not null,
  flight_date date not null,
  status public.inquiry_status not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_user_id_idx on public.inquiries (user_id);
create index inquiries_company_id_idx on public.inquiries (company_id);
create index inquiries_contact_id_idx on public.inquiries (contact_id);
create index inquiries_status_idx on public.inquiries (status);

create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- Row Level Security: owner-only access.
alter table public.inquiries enable row level security;

create policy "Users can view their own inquiries"
  on public.inquiries for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own inquiries"
  on public.inquiries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own inquiries"
  on public.inquiries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own inquiries"
  on public.inquiries for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Explicit Data API privileges (https://github.com/orgs/supabase/discussions/45329):
-- revoke inherited blanket grants, then grant exactly what each role needs.
revoke all on public.inquiries from anon, authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiries to service_role;
