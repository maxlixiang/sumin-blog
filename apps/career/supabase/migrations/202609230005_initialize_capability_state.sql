-- Creates the real, idempotent user initialization required by Phase 4A.
-- It intentionally writes L1 for every capability and R2 for responsibility; no synthetic dashboard fixture is used.

create or replace function public.initialize_capability_state()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  active_model_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select id into active_model_id
  from public.capability_model_versions
  where owner_id is null and status = 'active'
  limit 1;

  if active_model_id is null then
    raise exception 'No active capability model is available';
  end if;

  insert into public.capability_level_history (
    user_id, capability_id, model_version_id, from_level, to_level, source, reason, effective_on
  )
  select auth.uid(), c.id, active_model_id, null, 1, 'initialization',
    'Career OS Capability Model V1 初始化：所有能力从 L1 开始，通过正式晋级流程评估。',
    current_date
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
      '初始化为 R2 — 完整问题：对一个完整问题从分析、判断、方案设计到推动解决承担责任。',
      current_date
    );
  end if;
end;
$$;

revoke all on function public.initialize_capability_state() from public;
grant execute on function public.initialize_capability_state() to authenticated;
