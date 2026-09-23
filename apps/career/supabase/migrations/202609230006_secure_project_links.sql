-- Phase 4B: harden user-owned cross-table links.
-- A link row must not point to another user's evidence, project, or supporting record.

drop policy if exists "Users own milestone progress" on public.user_milestone_progress;
create policy "Users own milestone progress" on public.user_milestone_progress for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (supporting_evidence_id is null or exists (
    select 1 from public.evidence
    where evidence.id = supporting_evidence_id and evidence.user_id = (select auth.uid())
  ))
  and (development_project_id is null or exists (
    select 1 from public.development_projects
    where development_projects.id = development_project_id and development_projects.user_id = (select auth.uid())
  ))
);

drop policy if exists "Users own project capabilities" on public.development_project_capabilities;
create policy "Users own project capabilities" on public.development_project_capabilities for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.development_projects
    where development_projects.id = development_project_id and development_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users own project sections" on public.development_project_sections;
create policy "Users own project sections" on public.development_project_sections for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.development_projects
    where development_projects.id = development_project_id and development_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users own evidence project links" on public.evidence_project_links;
create policy "Users own evidence project links" on public.evidence_project_links for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.evidence where evidence.id = evidence_id and evidence.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.development_projects
    where development_projects.id = development_project_id and development_projects.user_id = (select auth.uid())
  )
  and (development_project_section_id is null or exists (
    select 1 from public.development_project_sections
    where development_project_sections.id = development_project_section_id
      and development_project_sections.development_project_id = evidence_project_links.development_project_id
      and development_project_sections.user_id = (select auth.uid())
  ))
);

drop policy if exists "Users own application evidence" on public.promotion_application_evidence;
create policy "Users own application evidence" on public.promotion_application_evidence for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.promotion_applications where id = promotion_application_id and user_id = (select auth.uid()))
  and exists (select 1 from public.evidence where id = evidence_id and user_id = (select auth.uid()))
);

drop policy if exists "Users own application projects" on public.promotion_application_projects;
create policy "Users own application projects" on public.promotion_application_projects for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.promotion_applications where id = promotion_application_id and user_id = (select auth.uid()))
  and exists (select 1 from public.development_projects where id = development_project_id and user_id = (select auth.uid()))
);
