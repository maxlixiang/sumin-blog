import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteCareerAsset } from "@/features/assets/actions";
import { requireUser } from "@/lib/auth/require-user";
import { getAssetTypeLabel } from "@/lib/constants/growth-records";
import { formatChineseDate } from "@/lib/date";

export const metadata: Metadata = { title: "职业资产详情" };
export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [assetResult, capabilityLinkResult, evidenceLinkResult, capabilitiesResult, evidenceResult] = await Promise.all([
    supabase.from("career_assets").select("*").eq("id", id).maybeSingle(),
    supabase.from("career_asset_capabilities").select("capability_id").eq("career_asset_id", id),
    supabase.from("career_asset_evidence").select("evidence_id").eq("career_asset_id", id),
    supabase.from("capabilities").select("*").order("display_order"),
    supabase.from("evidence").select("id, title, occurred_on, evidence_level").order("occurred_on", { ascending: false }),
  ]);
  if (assetResult.error || capabilityLinkResult.error || evidenceLinkResult.error || capabilitiesResult.error || evidenceResult.error) throw new Error("无法读取职业资产");
  if (!assetResult.data) notFound();
  const capabilityIds = new Set(capabilityLinkResult.data.map((item) => item.capability_id));
  const evidenceIds = new Set(evidenceLinkResult.data.map((item) => item.evidence_id));
  const capabilities = capabilitiesResult.data.filter((item) => capabilityIds.has(item.id));
  const evidence = evidenceResult.data.filter((item) => evidenceIds.has(item.id));
  return <div className="record-detail-page"><div className="detail-heading"><div><p className="eyebrow">{getAssetTypeLabel(assetResult.data.asset_type)} · {formatChineseDate(assetResult.data.asset_date)}</p><h1>{assetResult.data.title}</h1><div className="tag-row">{capabilities.map((item) => <span key={item.id}>{item.name}</span>)}</div></div><div className="form-actions"><Link className="button button--secondary" href={`/assets/${id}/edit`}>编辑</Link><ConfirmDeleteButton action={deleteCareerAsset.bind(null, id)} message="确定删除这项职业资产吗？删除后无法恢复。" /></div></div><section className="asset-description"><h2>资产说明</h2><p>{assetResult.data.description}</p></section>{evidence.length ? <section className="related-evidence"><h2>关联成长证据</h2>{evidence.map((item) => <Link href={`/evidence/${item.id}`} key={item.id}><strong>{item.title}</strong><span>{formatChineseDate(item.occurred_on)} · E{item.evidence_level}</span></Link>)}</section> : null}{assetResult.data.external_url ? <a className="external-link" href={assetResult.data.external_url} target="_blank" rel="noreferrer">打开职业资产 ↗</a> : null}</div>;
}
