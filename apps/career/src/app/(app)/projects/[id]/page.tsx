import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteDevelopmentProject } from "@/features/projects/actions";
import { formatChineseDate } from "@/lib/date";
import { requireUser } from "@/lib/auth/require-user";

const statusLabels = { planned: "计划中", active: "进行中", on_hold: "暂缓", completed: "已完成", archived: "已归档" } as const;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const [projectResult, capabilityLinks, evidenceLinks] = await Promise.all([
    supabase.from("development_projects").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase.from("development_project_capabilities").select("capability_id").eq("development_project_id", id),
    supabase.from("evidence_project_links").select("evidence_id").eq("development_project_id", id),
  ]);
  if (projectResult.error || capabilityLinks.error || evidenceLinks.error) throw new Error("无法读取发展项目");
  if (!projectResult.data) notFound();
  const [capabilitiesResult, evidenceResult] = await Promise.all([
    supabase.from("capabilities").select("id, name").in("id", capabilityLinks.data.map((item) => item.capability_id)),
    supabase.from("evidence").select("id, title, occurred_on, evidence_level").in("id", evidenceLinks.data.map((item) => item.evidence_id)),
  ]);
  if (capabilitiesResult.error || evidenceResult.error) throw new Error("无法读取项目关联内容");
  const project = projectResult.data;
  return <div className="record-detail-page">
    <header className="detail-heading"><div><span className="asset-type">{statusLabels[project.status]}</span><h1>{project.title}</h1><p className="source-line">{project.project_type}{project.target_date ? ` · 目标 ${formatChineseDate(project.target_date)}` : ""}</p></div><div className="form-actions"><Link className="button button--secondary" href={`/projects/${id}/edit`}>编辑</Link><ConfirmDeleteButton action={deleteDevelopmentProject.bind(null, id)} message="确定删除这个发展项目吗？关联关系将一并删除。" /></div></header>
    <div className="detail-sections"><section><h2>目标</h2><p>{project.objective || "尚未填写。"}</p></section><section><h2>背景与范围</h2><p>{project.context || "尚未填写。"}</p></section></div>
    <section className="related-evidence"><h2>重点能力</h2>{capabilitiesResult.data.length ? <div className="tag-row">{capabilitiesResult.data.map((capability) => <span key={capability.id}>{capability.name}</span>)}</div> : <p className="empty-inline">尚未关联能力。</p>}</section>
    <section className="related-evidence"><h2>关联成长证据</h2>{evidenceResult.data.length ? evidenceResult.data.map((evidence) => <Link href={`/evidence/${evidence.id}`} key={evidence.id}><strong>{evidence.title}</strong><span>{formatChineseDate(evidence.occurred_on)} · E{evidence.evidence_level}</span></Link>) : <p className="empty-inline">尚未关联成长证据。</p>}</section>
    {project.external_url ? <a className="external-link" href={project.external_url} target="_blank" rel="noreferrer">打开外部链接</a> : null}
  </div>;
}
