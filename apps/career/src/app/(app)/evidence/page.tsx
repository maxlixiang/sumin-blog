import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CAPABILITY_DEFINITIONS } from "@/lib/constants/career";
import { EVIDENCE_LEVELS, getEvidenceLevelLabel, isCapabilitySlug } from "@/lib/constants/growth-records";
import { formatChineseDate } from "@/lib/date";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "成长证据" };

export default async function EvidencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const capabilityFilter = typeof params.capability === "string" && isCapabilitySlug(params.capability) ? params.capability : "";
  const levelFilter = typeof params.level === "string" && /^[0-5]$/.test(params.level) ? Number(params.level) : null;
  const sort = params.sort === "asc" ? "asc" : "desc";
  const { supabase } = await requireUser();
  const [evidenceResult, capabilityResult, relationResult] = await Promise.all([
    supabase.from("evidence").select("*").order("occurred_on", { ascending: sort === "asc" }).order("created_at", { ascending: sort === "asc" }),
    supabase.from("capabilities").select("*").order("display_order"),
    supabase.from("evidence_capabilities").select("evidence_id, capability_id"),
  ]);
  if (evidenceResult.error || capabilityResult.error || relationResult.error) throw new Error("无法读取成长证据");
  const capabilities = capabilityResult.data;
  const relationMap = new Map<string, string[]>();
  for (const relation of relationResult.data) relationMap.set(relation.evidence_id, [...(relationMap.get(relation.evidence_id) ?? []), relation.capability_id]);
  const capabilityById = new Map(capabilities.map((item) => [item.id, item]));
  const selectedCapabilityId = capabilities.find((item) => item.slug === capabilityFilter)?.id;
  const evidence = evidenceResult.data.filter((item) => (!selectedCapabilityId || relationMap.get(item.id)?.includes(selectedCapabilityId)) && (levelFilter === null || item.evidence_level === levelFilter));

  return <div className="records-page">
    <PageHeader title="成长证据" description="把真实工作中的行动、判断和结果沉淀为可复用的成长证据。" />
    <div className="records-toolbar"><form className="filter-form">
      <label>能力<select name="capability" defaultValue={capabilityFilter}><option value="">全部能力</option>{CAPABILITY_DEFINITIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      <label>等级<select name="level" defaultValue={levelFilter ?? ""}><option value="">全部等级</option>{EVIDENCE_LEVELS.map((item) => <option key={item.value} value={item.value}>E{item.value} · {item.label}</option>)}</select></label>
      <label>时间<select name="sort" defaultValue={sort}><option value="desc">最近发生</option><option value="asc">最早发生</option></select></label>
      <button className="button button--secondary" type="submit">应用筛选</button>
    </form><Link className="button button--primary" href="/evidence/new">创建成长证据</Link></div>
    {params.deleted ? <p className="notice notice--success">成长证据已删除。</p> : null}
    {evidence.length ? <div className="record-list">{evidence.map((item) => {
      const names = (relationMap.get(item.id) ?? []).map((id) => capabilityById.get(id)?.name).filter(Boolean) as string[];
      return <Link className="record-card" href={`/evidence/${item.id}`} key={item.id}><div className="record-card__meta"><span className="evidence-level">E{item.evidence_level} · {getEvidenceLevelLabel(item.evidence_level)}</span><time>{formatChineseDate(item.occurred_on)}</time></div><h2>{item.title}</h2><p>{item.result}</p><div className="tag-row">{names.map((name) => <span key={name}>{name}</span>)}</div></Link>;
    })}</div> : <div className="empty-state"><h2>还没有符合条件的成长证据</h2><p>从一次真实判断、行动或结果开始，不需要写成长报告。</p><Link className="button button--primary" href="/evidence/new">创建第一条证据</Link></div>}
  </div>;
}
