"use client";

import { useActionState } from "react";

import { saveDevelopmentProject, type ProjectFormState } from "@/features/projects/actions";
import type { Capability, DevelopmentProject, Evidence } from "@/lib/supabase/database.types";

const INITIAL_STATE: ProjectFormState = {};
const PROJECT_TYPES = ["真实业务项目", "跨部门协作", "能力刻意训练", "个人研究"] as const;
const PROJECT_STATUSES = [{ value: "planned", label: "计划中" }, { value: "active", label: "进行中" }, { value: "on_hold", label: "暂缓" }, { value: "completed", label: "已完成" }, { value: "archived", label: "已归档" }] as const;
function FieldError({ errors }: { errors?: string[] }) { return errors?.length ? <p className="field-error">{errors[0]}</p> : null; }

export function DevelopmentProjectForm({ project, capabilities, evidence, selectedCapabilityIds = [], selectedEvidenceIds = [] }: { project?: DevelopmentProject; capabilities: Capability[]; evidence: Evidence[]; selectedCapabilityIds?: string[]; selectedEvidenceIds?: string[] }) {
  const [state, action, pending] = useActionState(saveDevelopmentProject, INITIAL_STATE);
  return <form className="record-form" action={action}>
    {project ? <input type="hidden" name="id" value={project.id} /> : null}
    <div className="form-grid form-grid--two">
      <div className="form-field form-field--wide"><label htmlFor="title">项目名称</label><input id="title" name="title" defaultValue={project?.title} placeholder="例如：北美渠道合同治理优化" required /><FieldError errors={state.fieldErrors?.title} /></div>
      <div className="form-field"><label htmlFor="projectType">项目类型</label><select id="projectType" name="projectType" defaultValue={project?.project_type ?? PROJECT_TYPES[0]}>{PROJECT_TYPES.map((value) => <option key={value}>{value}</option>)}</select><FieldError errors={state.fieldErrors?.projectType} /></div>
      <div className="form-field"><label htmlFor="status">状态</label><select id="status" name="status" defaultValue={project?.status ?? "active"}>{PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
      <div className="form-field"><label htmlFor="targetDate">目标日期（可选）</label><input id="targetDate" name="targetDate" type="date" defaultValue={project?.target_date ?? ""} /></div>
    </div>
    <div className="form-field"><label htmlFor="objective">目标</label><p>这项项目希望带来什么业务或能力上的变化？</p><textarea id="objective" name="objective" rows={4} defaultValue={project?.objective} /><FieldError errors={state.fieldErrors?.objective} /></div>
    <div className="form-field"><label htmlFor="context">背景与范围</label><p>用几句话说明关键背景、协作边界或限制条件。</p><textarea id="context" name="context" rows={4} defaultValue={project?.context} /><FieldError errors={state.fieldErrors?.context} /></div>
    <div className="form-field"><label htmlFor="externalUrl">外部链接（可选）</label><input id="externalUrl" name="externalUrl" type="url" pattern="https?://.*" defaultValue={project?.external_url ?? ""} placeholder="https://" /><FieldError errors={state.fieldErrors?.externalUrl} /></div>
    <fieldset className="choice-fieldset"><legend>重点发展能力（可多选）</legend><div className="choice-grid">{capabilities.map((capability) => <label key={capability.id}><input name="capabilityIds" type="checkbox" value={capability.id} defaultChecked={selectedCapabilityIds.includes(capability.id)} /><span>{capability.name}</span></label>)}</div><FieldError errors={state.fieldErrors?.capabilityIds} /></fieldset>
    <fieldset className="choice-fieldset"><legend>关联成长证据（可多选）</legend>{evidence.length ? <div className="evidence-choice-list">{evidence.map((item) => <label key={item.id}><input name="evidenceIds" type="checkbox" value={item.id} defaultChecked={selectedEvidenceIds.includes(item.id)} /><span><strong>{item.title}</strong><small>{item.occurred_on} · E{item.evidence_level}</small></span></label>)}</div> : <p className="empty-inline">先创建成长证据，之后可在这里关联。</p>}</fieldset>
    <div className="record-form__footer"><div aria-live="polite">{state.message ? <p className="form-message form-message--error">{state.message}</p> : null}</div><button className="button button--primary" type="submit" disabled={pending}>{pending ? "正在保存…" : project ? "保存修改" : "创建发展项目"}</button></div>
  </form>;
}
