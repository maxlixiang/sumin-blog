create extension if not exists pgcrypto;

create table public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  check_in_date date not null default current_date,
  business_learning text not null check (char_length(business_learning) between 1 and 4000),
  judgment_made text not null check (char_length(judgment_made) between 1 and 4000),
  crossed_legal_boundary boolean not null default false,
  boundary_details text,
  has_evidence boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_check_ins_user_date_key unique (user_id, check_in_date),
  constraint daily_check_ins_boundary_details_length_check check (
    boundary_details is null or char_length(boundary_details) <= 4000
  ),
  constraint daily_check_ins_boundary_details_required_check check (
    not crossed_legal_boundary or (
      boundary_details is not null and char_length(trim(boundary_details)) > 0
    )
  )
);

create index daily_check_ins_user_id_idx on public.daily_check_ins using btree (user_id);

alter table public.daily_check_ins enable row level security;

revoke all on table public.daily_check_ins from anon, authenticated;
grant select, insert, update on table public.daily_check_ins to authenticated;

create policy "Users can read their own daily check-ins"
on public.daily_check_ins for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own daily check-ins"
on public.daily_check_ins for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily check-ins"
on public.daily_check_ins for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
