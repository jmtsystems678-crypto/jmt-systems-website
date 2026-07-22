-- Run this once in Supabase SQL Editor before enabling Paystack.
alter table public.program_registrations add column if not exists payment_amount_pesewas integer;
alter table public.program_registrations add column if not exists paystack_reference text unique;
alter table public.program_registrations add column if not exists payment_channel text;

-- Prevent the public browser from changing payment details or payment status.
drop policy if exists "public can submit program registrations" on public.program_registrations;
create policy "public can submit program registrations" on public.program_registrations
  for insert to anon, authenticated
  with check (payment_status = 'awaiting_payment' and payment_amount_pesewas is null and paystack_reference is null);
