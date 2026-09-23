-- Phase 4 final hardening: only the approved RPC may write capability history
-- or change a promotion application's status. Users can still create an
-- under-review application through the server action, but cannot self-approve.

create or replace function public.initialize_capability_state()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_model_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select id into active_model_id from public.capability_model_versions
  where owner_id is null and status = 'active' limit 1;
  if active_model_id is null then raise exception 'No active capability model is available'; end if;

  insert into public.capability_level_history (
    user_id, capability_id, model_version_id, from_level, to_level, source, reason, effective_on
  )
  select auth.uid(), c.id, active_model_id, null, 1, 'initialization',
    'Career OS Capability Model V1 初始化：所有能力从 L1 开始，通过正式晋级流程评估。', current_date
  from public.capabilities c
  where not exists (
    select 1 from public.capability_level_history h
    where h.user_id = auth.uid() and h.capability_id = c.id
  );

  if not exists (select 1 from public.responsibility_level_history where user_id = auth.uid()) then
    insert into public.responsibility_level_history (
      user_id, from_level, to_level, source, evidence_summary, change_explanation, effective_on
    ) values (
      auth.uid(), null, 2, 'initialization',
      '当前作为法务部门管理岗位成员，能够独立负责合规、知识产权、合同及海外业务法律支持中的完整专业问题，并推动问题解决；但目前暂不默认认定已经持续承担跨部门项目最终业务结果，因此不初始化为 R3。',
      '初始化为 R2 — 完整问题：对一个完整问题从分析、判断、方案设计到推动解决承担责任。', current_date
    );
  end if;
end;
$$;

create or replace function public.approve_promotion_application(application_id uuid, approval_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  application public.promotion_applications%rowtype;
  latest_level smallint;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select * into application from public.promotion_applications
  where id = application_id and user_id = auth.uid() for update;
  if application.id is null then raise exception 'Promotion application not found'; end if;
  if application.status not in ('under_review', 'review_completed') then raise exception 'Application is not ready for explicit approval'; end if;
  if char_length(trim(approval_reason)) = 0 then raise exception 'Approval reason is required'; end if;
  select to_level into latest_level from public.capability_level_history
  where user_id = auth.uid() and capability_id = application.capability_id
  order by created_at desc limit 1;
  if latest_level is distinct from application.current_level then raise exception 'Capability level changed; submit a new application'; end if;
  if application.target_level <> application.current_level + 1 then raise exception 'Only one-level promotion is allowed'; end if;
  insert into public.capability_level_history (user_id, capability_id, model_version_id, from_level, to_level, source, promotion_application_id, reason, effective_on)
  values (auth.uid(), application.capability_id, application.model_version_id, application.current_level, application.target_level, 'human_approval', application.id, trim(approval_reason), current_date);
  update public.promotion_applications set status = 'approved', decided_at = now(), decision_reason = trim(approval_reason) where id = application.id;
end;
$$;

revoke insert, update, delete on public.capability_level_history from authenticated;
revoke update, delete on public.promotion_applications from authenticated;
grant insert on public.promotion_applications to authenticated;

drop policy if exists "Users own capability history" on public.capability_level_history;
create policy "Users can read their capability history" on public.capability_level_history
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users own promotion applications" on public.promotion_applications;
create policy "Users can read their promotion applications" on public.promotion_applications
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can submit under-review promotion applications" on public.promotion_applications
for insert to authenticated with check (
  (select auth.uid()) = user_id and status = 'under_review' and submitted_at is not null
);

revoke all on function public.initialize_capability_state() from public;
grant execute on function public.initialize_capability_state() to authenticated;
revoke all on function public.approve_promotion_application(uuid, text) from public;
grant execute on function public.approve_promotion_application(uuid, text) to authenticated;
