-- Phase 4C: explicit, atomic human approval. This function never auto-promotes.

create or replace function public.approve_promotion_application(application_id uuid, approval_reason text)
returns void
language plpgsql
security invoker
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

revoke all on function public.approve_promotion_application(uuid, text) from public;
grant execute on function public.approve_promotion_application(uuid, text) to authenticated;
