create table public.capabilities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('business', 'finance', 'strategy', 'execution', 'leadership', 'influence')),
  name text not null,
  core_question text not null,
  display_order smallint not null unique check (display_order between 1 and 6),
  created_at timestamptz not null default now()
);

insert into public.capabilities (slug, name, core_question, display_order) values
  ('business', '商业理解', '我是否真正理解公司是怎么赚钱的？', 1),
  ('finance', '财务与经营数字', '我能否用经营数字解释业务？', 2),
  ('strategy', '战略与决策', '我能否判断应该做什么，以及不做什么？', 3),
  ('execution', '执行与项目管理', '我能否推动复杂事情真正落地？', 4),
  ('leadership', '领导力', '我能否通过别人完成结果？', 5),
  ('influence', '影响力', '即使没有行政权力，我能否推动别人行动？', 6)
on conflict (slug) do update set
  name = excluded.name,
  core_question = excluded.core_question,
  display_order = excluded.display_order;

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  occurred_on date not null,
  event text not null check (char_length(trim(event)) between 1 and 2000),
  action text not null check (char_length(trim(action)) between 1 and 2000),
  judgment text not null check (char_length(trim(judgment)) between 1 and 2000),
  result text not null check (char_length(trim(result)) between 1 and 2000),
  reflection text not null check (char_length(trim(reflection)) between 1 and 4000),
  evidence_level smallint not null check (evidence_level between 0 and 5),
  daily_check_in_id uuid references public.daily_check_ins(id) on delete set null,
  external_url text check (
    external_url is null or (
      char_length(external_url) <= 2048 and external_url ~* '^https?://'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_capabilities (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (evidence_id, capability_id)
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  business_deep_dive text not null default '' check (char_length(business_deep_dive) <= 4000),
  business_case text not null default '' check (char_length(business_case) <= 4000),
  management_review text not null default '' check (char_length(management_review) <= 4000),
  industry_input text not null default '' check (char_length(industry_input) <= 4000),
  industry_relevance text not null default '' check (char_length(industry_relevance) <= 4000),
  evidence_capability_id uuid references public.capabilities(id) on delete restrict,
  evidence_summary text not null default '' check (char_length(evidence_summary) <= 4000),
  next_focus_capability_id uuid references public.capabilities(id) on delete restrict,
  next_focus_plan text not null default '' check (char_length(next_focus_plan) <= 4000),
  status text not null default 'draft' check (status in ('draft', 'complete')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reviews_user_week_key unique (user_id, week_start),
  constraint weekly_reviews_completion_check check (
    status = 'draft' or (
      char_length(trim(business_deep_dive)) > 0 and
      char_length(trim(business_case)) > 0 and
      char_length(trim(management_review)) > 0 and
      char_length(trim(industry_input)) > 0 and
      char_length(trim(industry_relevance)) > 0 and
      evidence_capability_id is not null and
      char_length(trim(evidence_summary)) > 0 and
      next_focus_capability_id is not null and
      char_length(trim(next_focus_plan)) > 0 and
      completed_at is not null
    )
  )
);

create table public.career_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  asset_type text not null check (asset_type in (
    'business_map', 'financial_model', 'p_and_l_simulation', 'business_case',
    'decision_memo', 'market_research', 'project_retrospective', 'leadership_review', 'other'
  )),
  asset_date date not null,
  description text not null check (char_length(trim(description)) between 1 and 4000),
  external_url text check (
    external_url is null or (
      char_length(external_url) <= 2048 and external_url ~* '^https?://'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.career_asset_capabilities (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  career_asset_id uuid not null references public.career_assets(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (career_asset_id, capability_id)
);

create table public.career_asset_evidence (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  career_asset_id uuid not null references public.career_assets(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (career_asset_id, evidence_id)
);

create index evidence_user_occurred_on_idx on public.evidence (user_id, occurred_on desc);
create index evidence_user_level_idx on public.evidence (user_id, evidence_level);
create index evidence_daily_check_in_idx on public.evidence (daily_check_in_id) where daily_check_in_id is not null;
create index evidence_capabilities_capability_idx on public.evidence_capabilities (capability_id, evidence_id);
create index weekly_reviews_user_week_idx on public.weekly_reviews (user_id, week_start desc);
create index career_assets_user_date_idx on public.career_assets (user_id, asset_date desc);
create index career_asset_capabilities_capability_idx on public.career_asset_capabilities (capability_id, career_asset_id);
create index career_asset_evidence_evidence_idx on public.career_asset_evidence (evidence_id, career_asset_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger evidence_set_updated_at
before update on public.evidence
for each row execute function public.set_updated_at();

create trigger weekly_reviews_set_updated_at
before update on public.weekly_reviews
for each row execute function public.set_updated_at();

create trigger career_assets_set_updated_at
before update on public.career_assets
for each row execute function public.set_updated_at();

alter table public.capabilities enable row level security;
alter table public.evidence enable row level security;
alter table public.evidence_capabilities enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.career_assets enable row level security;
alter table public.career_asset_capabilities enable row level security;
alter table public.career_asset_evidence enable row level security;

revoke all on table public.capabilities, public.evidence, public.evidence_capabilities,
  public.weekly_reviews, public.career_assets, public.career_asset_capabilities,
  public.career_asset_evidence from anon, authenticated;

grant select on table public.capabilities to authenticated;
grant select, insert, update, delete on table public.evidence, public.evidence_capabilities,
  public.weekly_reviews, public.career_assets, public.career_asset_capabilities,
  public.career_asset_evidence to authenticated;

create policy "Authenticated users can read capabilities"
on public.capabilities for select to authenticated using (true);

create policy "Users can read their own evidence"
on public.evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own evidence"
on public.evidence for insert to authenticated with check (
  (select auth.uid()) = user_id and (
    daily_check_in_id is null or exists (
      select 1 from public.daily_check_ins d
      where d.id = daily_check_in_id and d.user_id = (select auth.uid())
    )
  )
);
create policy "Users can update their own evidence"
on public.evidence for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id and (
    daily_check_in_id is null or exists (
      select 1 from public.daily_check_ins d
      where d.id = daily_check_in_id and d.user_id = (select auth.uid())
    )
  )
);
create policy "Users can delete their own evidence"
on public.evidence for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own evidence capabilities"
on public.evidence_capabilities for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own evidence capabilities"
on public.evidence_capabilities for insert to authenticated with check (
  (select auth.uid()) = user_id and exists (
    select 1 from public.evidence e
    where e.id = evidence_id and e.user_id = (select auth.uid())
  )
);
create policy "Users can delete their own evidence capabilities"
on public.evidence_capabilities for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own weekly reviews"
on public.weekly_reviews for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own weekly reviews"
on public.weekly_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own weekly reviews"
on public.weekly_reviews for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete their own weekly reviews"
on public.weekly_reviews for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own career assets"
on public.career_assets for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own career assets"
on public.career_assets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own career assets"
on public.career_assets for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users can delete their own career assets"
on public.career_assets for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own asset capabilities"
on public.career_asset_capabilities for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own asset capabilities"
on public.career_asset_capabilities for insert to authenticated with check (
  (select auth.uid()) = user_id and exists (
    select 1 from public.career_assets a
    where a.id = career_asset_id and a.user_id = (select auth.uid())
  )
);
create policy "Users can delete their own asset capabilities"
on public.career_asset_capabilities for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own asset evidence"
on public.career_asset_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own asset evidence"
on public.career_asset_evidence for insert to authenticated with check (
  (select auth.uid()) = user_id and
  exists (
    select 1 from public.career_assets a
    where a.id = career_asset_id and a.user_id = (select auth.uid())
  ) and
  exists (
    select 1 from public.evidence e
    where e.id = evidence_id and e.user_id = (select auth.uid())
  )
);
create policy "Users can delete their own asset evidence"
on public.career_asset_evidence for delete to authenticated using ((select auth.uid()) = user_id);
