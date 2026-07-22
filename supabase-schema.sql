-- Run this entire file in Supabase: SQL Editor > New query > Run.
-- It creates the JMT data tables and their access rules.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  service text not null,
  project_details text,
  status text not null default 'new' check (status in ('new','contacted','quoted','closed'))
);

create table if not exists public.program_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  program text not null check (program in ('I Am Multi-Talented','Zionization Conference')),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 8 and 25),
  payment_status text not null default 'awaiting_payment' check (payment_status in ('awaiting_payment','submitted','paid','cancelled')),
  payment_reference text,
  notes text
);

alter table public.service_requests enable row level security;
alter table public.program_registrations enable row level security;

-- Anyone can submit a request. Nobody public can read, alter, or delete requests.
create policy "public can submit service requests" on public.service_requests for insert to anon, authenticated with check (true);
create policy "admin can manage service requests" on public.service_requests for all to authenticated using ((auth.jwt() ->> 'email') = 'ababiofrederick3639@gmail.com') with check ((auth.jwt() ->> 'email') = 'ababiofrederick3639@gmail.com');
create policy "public can submit program registrations" on public.program_registrations for insert to anon, authenticated with check (true);
create policy "admin can manage program registrations" on public.program_registrations for all to authenticated using ((auth.jwt() ->> 'email') = 'ababiofrederick3639@gmail.com') with check ((auth.jwt() ->> 'email') = 'ababiofrederick3639@gmail.com');

-- Add a little abuse protection; excessive form submissions are automatically rejected.
create or replace function public.limit_jmt_submission_rate() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.service_requests where email = new.email and created_at > now() - interval '1 minute') then
    raise exception 'Please wait before submitting another request.';
  end if;
  return new;
end;
$$;

create trigger service_request_rate_limit before insert on public.service_requests for each row execute function public.limit_jmt_submission_rate();
