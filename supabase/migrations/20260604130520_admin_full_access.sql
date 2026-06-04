-- Full-access "admin" role.
--
-- A user whose verified JWT carries app_metadata.role = 'admin' can view AND
-- manage (create/edit/delete) every owner's companies/contacts/inquiries — a
-- back-office role over all data. The role lives in app_metadata, which is set
-- server-side and is not user-editable, and is read straight from the JWT via
-- auth.jwt() — so there is no extra table to query and no RLS recursion.
--
-- These are additional PERMISSIVE policies that OR with the existing owner
-- policies: a row is accessible if the owner policy matches
-- ((select auth.uid()) = user_id) OR the caller is an admin. Non-admin users
-- are completely unaffected — they still only see and manage their own rows.
--
-- INSERT keeps using the existing owner policy: an admin inserting omits
-- user_id, so the column default (auth.uid()) makes the admin the creator and
-- the owner with-check passes. UPDATE/DELETE need admin policies because the
-- target rows are owned by someone else.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  -- coalesce to false: a missing role yields NULL, and `not NULL` would let
  -- the guards in SECURITY DEFINER functions fall through.
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Explicit privileges (functions default to PUBLIC execute). RLS policies on the
-- data tables call this as the authenticated role, so grant it there; anon never
-- needs it.
-- service_role is excluded too: Supabase default-grants execute on new public
-- functions to service_role, and this app never uses it (it bypasses RLS).
revoke all on function public.is_admin() from public, anon, service_role;
grant execute on function public.is_admin() to authenticated;

-- companies
create policy "Admins can view all companies"
  on public.companies for select to authenticated using (public.is_admin());
create policy "Admins can update all companies"
  on public.companies for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete all companies"
  on public.companies for delete to authenticated using (public.is_admin());

-- contacts
create policy "Admins can view all contacts"
  on public.contacts for select to authenticated using (public.is_admin());
create policy "Admins can update all contacts"
  on public.contacts for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete all contacts"
  on public.contacts for delete to authenticated using (public.is_admin());

-- inquiries
create policy "Admins can view all inquiries"
  on public.inquiries for select to authenticated using (public.is_admin());
create policy "Admins can update all inquiries"
  on public.inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete all inquiries"
  on public.inquiries for delete to authenticated using (public.is_admin());
