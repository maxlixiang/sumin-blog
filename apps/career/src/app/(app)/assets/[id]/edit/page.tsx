import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CareerAssetForm } from "@/features/assets/career-asset-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "编辑职业资产" };
export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [assetResult, capabilityLinkResult, evidenceLinkResult, capabilitiesResult, evidenceResult] = await Promise.all([
    supabase.from("career_assets").select("*").eq("id", id).maybeSingle(),
    supabase.from("career_asset_capabilities").select("capability_id").eq("career_asset_id", id),
    supabase.from("career_asset_evidence").select("evidence_id").eq("career_asset_id", id),
    supabase.from("capabilities").select("*").order("display_order"),
    supabase.from("evidence").select("*").order("occurred_on", { ascending: false }),
  ]);
  if (assetResult.error || capabilityLinkResult.error || evidenceLinkResult.error || capabilitiesResult.error || evidenceResult.error) throw new Error("无法读取职业资产");
  if (!assetResult.data) notFound();
  return <div className="records-page"><PageHeader title="编辑职业资产" description="更新资产说明与它所关联的能力和成长证据。" /><CareerAssetForm asset={assetResult.data} capabilities={capabilitiesResult.data} evidence={evidenceResult.data} selectedCapabilityIds={capabilityLinkResult.data.map((item) => item.capability_id)} selectedEvidenceIds={evidenceLinkResult.data.map((item) => item.evidence_id)} defaultDate={assetResult.data.asset_date} /></div>;
}
