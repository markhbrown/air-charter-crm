-- Seed data for local development. Runs automatically on `supabase db reset`.
--
-- Creates TWO test accounts, each owning its own companies, contacts and
-- inquiries. Because every table is scoped to user_id via RLS, each account can
-- only ever see its own rows — log in as each to see the isolation in action.
--
--   broker@aircharter.test   / Password123!   (owns the Meridian/Acme/Aurora data)
--   manager@aircharter.test  / Password123!   (owns a separate set of records)
--
-- Fixed UUIDs are used throughout so foreign keys line up and reseeding is
-- deterministic.

-- ---------------------------------------------------------------------------
-- Test auth user (mirrors what Supabase Auth would create on sign-up).
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'broker@aircharter.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(), now(),
  '', '', '', ''
);

insert into auth.identities (
  user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"broker@aircharter.test","email_verified":true}',
  'email',
  now(), now(), now()
);

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
insert into public.companies (id, user_id, name, country, notes) values
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Meridian Executive Jets', 'United Kingdom', 'Operator partner. Mostly mid-size cabin availability out of Farnborough.'),
  ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Acme Corporation', 'United States', 'Corporate client. Frequent transatlantic exec travel; prefers Gulfstream.'),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Aurora Mining Group', 'Australia', 'Rotational crew charters into remote sites. Price sensitive.');

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------
insert into public.contacts (id, user_id, company_id, name, email, role) values
  ('20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '10000000-0000-0000-0000-000000000001', 'Sofia Almeida', 'sofia.almeida@meridianjets.test', 'Ops Manager'),
  ('20000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '10000000-0000-0000-0000-000000000001', 'James Whitfield', 'james.whitfield@meridianjets.test', 'Fleet Director'),
  ('20000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '10000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah.johnson@acme.test', 'CEO'),
  ('20000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '10000000-0000-0000-0000-000000000002', 'Mark Thompson', 'mark.thompson@acme.test', 'Executive Assistant'),
  ('20000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   '10000000-0000-0000-0000-000000000003', 'David Chen', 'david.chen@auroramining.test', 'Logistics Manager');

-- ---------------------------------------------------------------------------
-- Inquiries
-- ---------------------------------------------------------------------------
insert into public.inquiries
  (user_id, company_id, contact_id, origin_airport, destination_airport, flight_date, status) values
  ('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000003', 'LHR', 'GVA', '2026-06-18', 'Quoting'),
  ('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000004', 'LTN', 'NCE', '2026-06-25', 'New'),
  ('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'LPPT', 'FAB', '2026-06-09', 'Won'),
  ('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000005', 'PER', 'SIN', '2026-05-28', 'Lost'),
  ('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001',
   null, 'LPCS', 'IBZ', '2026-07-02', 'New');

-- ===========================================================================
-- Second account: manager@aircharter.test
-- Owns a completely separate set of records. Logging in as this user shows
-- none of the broker's data above — that is RLS owner-isolation in action.
-- ===========================================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'manager@aircharter.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(), now(),
  '', '', '', ''
);

insert into auth.identities (
  user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"manager@aircharter.test","email_verified":true}',
  'email',
  now(), now(), now()
);

insert into public.companies (id, user_id, name, country, notes) values
  ('40000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Highland Air Charter', 'United Kingdom', 'Regional turboprop operator serving the Scottish islands.'),
  ('40000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Pacific Wings Group', 'Singapore', 'APAC corporate client. Frequent KUL/SIN business legs.');

insert into public.contacts (id, user_id, company_id, name, email, role) values
  ('50000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   '40000000-0000-0000-0000-000000000001', 'Iona MacLeod', 'iona.macleod@highlandair.test', 'Charter Sales'),
  ('50000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   '40000000-0000-0000-0000-000000000002', 'Wei Lim', 'wei.lim@pacificwings.test', 'Travel Coordinator');

insert into public.inquiries
  (user_id, company_id, contact_id, origin_airport, destination_airport, flight_date, status) values
  ('22222222-2222-2222-2222-222222222222', '40000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000002', 'SIN', 'KUL', '2026-06-20', 'Quoting'),
  ('22222222-2222-2222-2222-222222222222', '40000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000001', 'EDI', 'BEB', '2026-07-05', 'New');
