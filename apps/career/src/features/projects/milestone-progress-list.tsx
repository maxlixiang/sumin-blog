"use client";

import { useActionState } from "react";

import { updateMilestoneProgress, type ProjectFormState } from "@/features/projects/actions";
import type { MilestoneDefinition, UserMilestoneProgress } from "@/lib/supabase/database.types";

const INITIAL_STATE: ProjectFormState = {};

export function MilestoneProgressList({ milestones, progressByMilestone }: { milestones: MilestoneDefinition[]; progressByMilestone: Record<string, UserMilestoneProgress | undefined> }) {
  return <div className="milestone-list">{milestones.map((milestone) => <MilestoneItem key={milestone.id} milestone={milestone} progress={progressByMilestone[milestone.id]} />)}</div>;
}

function MilestoneItem({ milestone, progress }: { milestone: MilestoneDefinition; progress?: UserMilestoneProgress }) {
  const [state, action, pending] = useActionState(updateMilestoneProgress, INITIAL_STATE);
  const defaultStatus = progress?.status ?? "not_started";
  return <form className={`milestone-item milestone-item--${defaultStatus}`} action={action}>
    <input type="hidden" name="milestoneId" value={milestone.id} />
    <div className="milestone-item__copy"><strong>{milestone.title}</strong><p>{milestone.description}</p></div>
    <div className="milestone-item__controls"><label>进度<select name="status" defaultValue={defaultStatus}><option value="not_started">未开始</option><option value="in_progress">进行中</option><option value="completed">已完成</option></select></label><input name="completionNote" aria-label={`${milestone.title} 的完成说明`} defaultValue={progress?.completion_note ?? ""} placeholder="可选：简短说明" maxLength={2000} /><button className="button button--secondary" type="submit" disabled={pending}>{pending ? "保存中…" : "更新"}</button></div>
    {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}
  </form>;
}
