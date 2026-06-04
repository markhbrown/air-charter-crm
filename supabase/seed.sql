-- Seed data for local development. Runs automatically on `supabase db reset`.
--
-- Creates one test broker account and populates the CRM with sample companies,
-- contacts and inquiries owned by that account. Because every table is scoped
-- to user_id via RLS, all of this data belongs to the test user below.
--
--   Login:    broker@aircharter.test
--   Password: Password123!
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
