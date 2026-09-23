-- Phase 4: versioned capability development, promotion assessment, projects, and responsibility history.
-- The immutable Career OS Capability Model V1 content is seeded by 202609230004_seed_capability_model_v1.sql.

create table public.capability_model_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  version text not null,
  name text not null,
  status text not null check (status in ('draft', 'active', 'retired')),
  effective_from date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (owner_id, version)
);

create unique index capability_model_versions_one_global_active_idx
  on public.capability_model_versions (status) where owner_id is null and status = 'active';
create unique index capability_model_versions_one_owner_active_idx
  on public.capability_model_versions (owner_id) where owner_id is not null and status = 'active';

create table public.capability_level_definitions (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.capability_model_versions(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  level smallint not null check (level between 1 and 5),
  name text not null,
  summary text not null,
  standard text not null,
  promotion_statement text not null,
  reviewer_perspective text not null,
  display_order smallint not null check (display_order between 1 and 5),
  created_at timestamptz not null default now(),
  unique (model_version_id, capability_id, level)
);

create table public.milestone_definitions (
  id uuid primary key default gen_random_uuid(),
  capability_level_definition_id uuid not null references public.capability_level_definitions(id) on delete cascade,
  code text not null unique,
  title text not null,
  description text not null,
  completion_criteria text not null default '',
  evidence_hint text not null default '',
  display_order smallint not null check (display_order between 1 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (capability_level_definition_id, display_order)
);

create table public.evidence_requirement_definitions (
  id uuid primary key default gen_random_uuid(),
  capability_level_definition_id uuid not null unique references public.capability_level_definitions(id) on delete cascade,
  minimum_total smallint not null default 0 check (minimum_total >= 0),
  minimum_evidence_level smallint check (minimum_evidence_level between 0 and 5),
  minimum_e1_plus smallint not null default 0 check (minimum_e1_plus >= 0),
  minimum_e2_plus smallint not null default 0 check (minimum_e2_plus >= 0),
  minimum_e3_plus smallint not null default 0 check (minimum_e3_plus >= 0),
  minimum_e4_plus smallint not null default 0 check (minimum_e4_plus >= 0),
  minimum_e5 smallint not null default 0 check (minimum_e5 >= 0),
  minimum_distinct_scenarios smallint not null default 0 check (minimum_distinct_scenarios >= 0),
  minimum_real_world_uses smallint not null default 0 check (minimum_real_world_uses >= 0),
  special_requirements jsonb not null default '{}'::jsonb check (jsonb_typeof(special_requirements) = 'object'),
  created_at timestamptz not null default now(),
  constraint evidence_requirement_progression_check check (
    minimum_e5 <= minimum_e4_plus and minimum_e4_plus <= minimum_e3_plus and
    minimum_e3_plus <= minimum_e2_plus and minimum_e2_plus <= minimum_e1_plus and
    minimum_e1_plus <= minimum_total
  )
);

create table public.capability_level_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  model_version_id uuid not null references public.capability_model_versions(id) on delete restrict,
  from_level smallint check (from_level between 1 and 5),
  to_level smallint not null check (to_level between 1 and 5),
  source text not null check (source in ('initialization', 'human_approval')),
  promotion_application_id uuid,
  reason text not null default '',
  effective_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint capability_level_history_transition_check check (
    (source = 'initialization' and from_level is null and to_level = 1) or
    (source = 'human_approval' and from_level is not null and to_level = from_level + 1)
  )
);
create index capability_level_history_user_capability_idx on public.capability_level_history (user_id, capability_id, created_at desc);

create table public.user_milestone_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  milestone_definition_id uuid not null references public.milestone_definitions(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completion_note text not null default '',
  supporting_evidence_id uuid references public.evidence(id) on delete set null,
  development_project_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, milestone_definition_id),
  constraint user_milestone_progress_completion_check check (
    status <> 'completed' or completed_at is not null
  )
);

create table public.development_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  project_type text not null,
  status text not null default 'active' check (status in ('planned', 'active', 'on_hold', 'completed', 'archived')),
  objective text not null default '' check (char_length(objective) <= 4000),
  context text not null default '' check (char_length(context) <= 4000),
  target_date date,
  completed_on date,
  external_url text check (external_url is null or (char_length(external_url) <= 2048 and external_url ~* '^https?://')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index development_projects_user_status_idx on public.development_projects (user_id, status, updated_at desc);

create table public.development_project_capabilities (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  development_project_id uuid not null references public.development_projects(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (development_project_id, capability_id)
);

create table public.development_project_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  development_project_id uuid not null references public.development_projects(id) on delete cascade,
  section_key text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  display_order smallint not null default 1 check (display_order >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (development_project_id, section_key)
);

create table public.evidence_project_links (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  development_project_id uuid not null references public.development_projects(id) on delete cascade,
  development_project_section_id uuid references public.development_project_sections(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (evidence_id, development_project_id)
);
create index evidence_project_links_project_idx on public.evidence_project_links (development_project_id, evidence_id);

alter table public.career_assets add column source_development_project_id uuid references public.development_projects(id) on delete set null;
create index career_assets_source_development_project_idx on public.career_assets (source_development_project_id) where source_development_project_id is not null;

alter table public.user_milestone_progress add constraint user_milestone_progress_project_fk
  foreign key (development_project_id) references public.development_projects(id) on delete set null;

create table public.promotion_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  model_version_id uuid not null references public.capability_model_versions(id) on delete restrict,
  current_level smallint not null check (current_level between 1 and 5),
  target_level smallint not null check (target_level between 2 and 5),
  status text not null default 'not_eligible' check (status in ('not_eligible', 'eligible', 'under_review', 'review_completed', 'approved', 'held')),
  applicant_statement text not null check (char_length(trim(applicant_statement)) between 1 and 4000),
  manual_requirement_confirmations jsonb not null default '{}'::jsonb check (jsonb_typeof(manual_requirement_confirmations) = 'object'),
  submitted_at timestamptz,
  decided_at timestamptz,
  decision_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_application_levels_check check (target_level = current_level + 1)
);
create index promotion_applications_user_capability_idx on public.promotion_applications (user_id, capability_id, created_at desc);

alter table public.capability_level_history add constraint capability_level_history_application_fk
  foreign key (promotion_application_id) references public.promotion_applications(id) on delete restrict;

create table public.promotion_application_evidence (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  promotion_application_id uuid not null references public.promotion_applications(id) on delete cascade,
  evidence_id uuid not null references public.evidence(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (promotion_application_id, evidence_id)
);

create table public.promotion_application_projects (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  promotion_application_id uuid not null references public.promotion_applications(id) on delete cascade,
  development_project_id uuid not null references public.development_projects(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (promotion_application_id, development_project_id)
);

create table public.ai_promotion_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  promotion_application_id uuid not null references public.promotion_applications(id) on delete cascade,
  provider text not null,
  model text not null,
  prompt_version text not null,
  reviewer_perspective text not null,
  verdict text not null check (verdict in ('ready', 'conditional', 'not_yet')),
  summary text not null,
  strengths jsonb not null default '[]'::jsonb check (jsonb_typeof(strengths) = 'array'),
  gaps jsonb not null default '[]'::jsonb check (jsonb_typeof(gaps) = 'array'),
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  recommendation text not null,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index ai_promotion_reviews_application_idx on public.ai_promotion_reviews (promotion_application_id, created_at desc);

create table public.ai_promotion_review_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ai_promotion_review_id uuid not null references public.ai_promotion_reviews(id) on delete cascade,
  response_text text not null check (char_length(trim(response_text)) between 1 and 4000),
  created_at timestamptz not null default now(),
  unique (ai_promotion_review_id, id)
);

create table public.responsibility_level_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  from_level smallint check (from_level between 1 and 6),
  to_level smallint not null check (to_level between 1 and 6),
  source text not null check (source in ('initialization', 'self_approval')),
  evidence_summary text not null,
  change_explanation text not null,
  effective_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint responsibility_level_history_transition_check check (
    (source = 'initialization' and from_level is null and to_level = 2) or
    (source = 'self_approval' and from_level is not null)
  )
);
create index responsibility_level_history_user_idx on public.responsibility_level_history (user_id, created_at desc);

create trigger user_milestone_progress_set_updated_at before update on public.user_milestone_progress
for each row execute function public.set_updated_at();
create trigger development_projects_set_updated_at before update on public.development_projects
for each row execute function public.set_updated_at();
create trigger development_project_sections_set_updated_at before update on public.development_project_sections
for each row execute function public.set_updated_at();
create trigger promotion_applications_set_updated_at before update on public.promotion_applications
for each row execute function public.set_updated_at();

alter table public.capability_model_versions enable row level security;
alter table public.capability_level_definitions enable row level security;
alter table public.milestone_definitions enable row level security;
alter table public.evidence_requirement_definitions enable row level security;
alter table public.capability_level_history enable row level security;
alter table public.user_milestone_progress enable row level security;
alter table public.development_projects enable row level security;
alter table public.development_project_capabilities enable row level security;
alter table public.development_project_sections enable row level security;
alter table public.evidence_project_links enable row level security;
alter table public.promotion_applications enable row level security;
alter table public.promotion_application_evidence enable row level security;
alter table public.promotion_application_projects enable row level security;
alter table public.ai_promotion_reviews enable row level security;
alter table public.ai_promotion_review_responses enable row level security;
alter table public.responsibility_level_history enable row level security;

revoke all on table public.capability_model_versions, public.capability_level_definitions, public.milestone_definitions,
  public.evidence_requirement_definitions, public.capability_level_history, public.user_milestone_progress,
  public.development_projects, public.development_project_capabilities, public.development_project_sections,
  public.evidence_project_links, public.promotion_applications, public.promotion_application_evidence,
  public.promotion_application_projects, public.ai_promotion_reviews, public.ai_promotion_review_responses,
  public.responsibility_level_history from anon, authenticated;

grant select on public.capability_model_versions, public.capability_level_definitions, public.milestone_definitions,
  public.evidence_requirement_definitions to authenticated;
grant select, insert, update, delete on public.capability_level_history, public.user_milestone_progress,
  public.development_projects, public.development_project_capabilities, public.development_project_sections,
  public.evidence_project_links, public.promotion_applications, public.promotion_application_evidence,
  public.promotion_application_projects, public.ai_promotion_reviews, public.ai_promotion_review_responses,
  public.responsibility_level_history to authenticated;

create policy "Authenticated users can read published capability models" on public.capability_model_versions
for select to authenticated using (owner_id is null or owner_id = (select auth.uid()));
create policy "Authenticated users can read level definitions" on public.capability_level_definitions
for select to authenticated using (true);
create policy "Authenticated users can read milestones" on public.milestone_definitions
for select to authenticated using (true);
create policy "Authenticated users can read evidence requirements" on public.evidence_requirement_definitions
for select to authenticated using (true);

create policy "Users own capability history" on public.capability_level_history for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own milestone progress" on public.user_milestone_progress for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own development projects" on public.development_projects for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own project capabilities" on public.development_project_capabilities for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own project sections" on public.development_project_sections for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own evidence project links" on public.evidence_project_links for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own promotion applications" on public.promotion_applications for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own application evidence" on public.promotion_application_evidence for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own application projects" on public.promotion_application_projects for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own AI reviews" on public.ai_promotion_reviews for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own AI review responses" on public.ai_promotion_review_responses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users own responsibility history" on public.responsibility_level_history for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
