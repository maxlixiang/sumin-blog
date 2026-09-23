import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteEvidence } from "@/features/evidence/actions";
import { getEvidenceLevelLabel } from "@/lib/constants/growth-records";
import { formatChineseDate } from "@/lib/date";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "成长证据详情" };
export default async function EvidenceDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ delete?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireUser();
  const [evidenceResult, relationResult, capabilityResult, projectLinksResult] = await Promise.all([
    supabase.from("evidence").select("*").eq("id", id).maybeSingle(),
    supabase.from("evidence_capabilities").select("capability_id").eq("evidence_id", id),
    supabase.from("capabilities").select("*").order("display_order"),
    supabase.from("evidence_project_links").select("development_project_id").eq("evidence_id", id),
  ]);
  if (evidenceResult.error || relationResult.error || capabilityResult.error || projectLinksResult.error) throw new Error("无法读取成长证据");
  if (!evidenceResult.data) notFound();
  const projectIds = projectLinksResult.data.map((item) => item.development_project_id);
  const projectsResult = projectIds.length ? await supabase.from("development_projects").select("id, title, status").in("id", projectIds) : { data: [], error: null };
  if (projectsResult.error) throw new Error("无法读取关联发展项目");
  const selected = new Set(relationResult.data.map((item) => item.capability_id));
  const capabilities = capabilityResult.data.filter((item) => selected.has(item.id));
  return <div className="record-detail-page">
    <div className="detail-heading"><div><p className="eyebrow">成长证据 · {formatChineseDate(evidenceResult.data.occurred_on)}</p><h1>{evidenceResult.data.title}</h1><div className="tag-row"><span>E{evidenceResult.data.evidence_level} · {getEvidenceLevelLabel(evidenceResult.data.evidence_level)}</span>{capabilities.map((item) => <span key={item.id}>{item.name}</span>)}</div></div><div className="form-actions"><Link className="button button--secondary" href={`/evidence/${id}/edit`}>编辑</Link><ConfirmDeleteButton action={deleteEvidence.bind(null, id)} message="确定删除这条成长证据吗？删除后无法恢复。" /></div></div>
    {query.delete === "linked" ? <p className="notice notice--error">这条证据已被职业资产引用，请先解除关联再删除。</p> : null}
    <div className="detail-sections">{[["事件", evidenceResult.data.event], ["行动", evidenceResult.data.action], ["判断", evidenceResult.data.judgment], ["结果", evidenceResult.data.result], ["反思", evidenceResult.data.reflection]].map(([label, value]) => <section key={label}><h2>{label}</h2><p>{value}</p></section>)}</div>
    <section className="related-evidence"><h2>关联发展项目</h2>{projectsResult.data.length ? projectsResult.data.map((project) => <Link href={`/projects/${project.id}`} key={project.id}><strong>{project.title}</strong><span>{project.status === "active" ? "进行中" : project.status === "completed" ? "已完成" : project.status === "planned" ? "计划中" : project.status === "on_hold" ? "暂缓" : "已归档"}</span></Link>) : <p className="empty-inline">尚未关联发展项目。可在发展项目中选择这条证据。</p>}</section>
    {evidenceResult.data.external_url ? <a className="external-link" href={evidenceResult.data.external_url} target="_blank" rel="noreferrer">打开外部材料 ↗</a> : null}
    {evidenceResult.data.daily_check_in_id ? <p className="source-line">此证据来自一条今日记录。</p> : null}
  </div>;
}
