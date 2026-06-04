-- Admin user management: lets an admin list users and grant/revoke the admin
-- role on OTHER users. Both functions are SECURITY DEFINER (so they can read and
-- write the auth schema) but self-gate on public.is_admin(), so only an admin can
-- call them. set_user_admin also refuses to change the caller's own role.
--
-- The role is stored in auth.users.raw_app_meta_data (which surfaces as the JWT
-- app_metadata.role the RLS policies read). A change takes effect for the target
-- user on their next sign-in / token refresh.

-- List all users with their email and whether they are an admin.
create or replace function public.list_app_users()
returns table (id uuid, email text, is_admin boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can list users';
  end if;

  return query
    select u.id,
           u.email::text,
           coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
    from auth.users u
    order by u.email;
end;
$$;

-- Grant or revoke the admin role on another user.
create or replace function public.set_user_admin(_user_id uuid, _is_admin boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can manage roles';
  end if;
  if _user_id = (select auth.uid()) then
    raise exception 'You cannot change your own admin role';
  end if;

  update auth.users
  set raw_app_meta_data =
    case
      when _is_admin
        then coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
      else raw_app_meta_data - 'role'
    end
  where id = _user_id;
end;
$$;

-- Exclude service_role too (Supabase default-grants execute on new public
-- functions to it); this app never calls these as service_role.
revoke all on function public.list_app_users() from public, anon, service_role;
revoke all on function public.set_user_admin(uuid, boolean) from public, anon, service_role;
grant execute on function public.list_app_users() to authenticated;
grant execute on function public.set_user_admin(uuid, boolean) to authenticated;
