import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EvidenceForm } from "@/features/evidence/evidence-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "编辑成长证据" };
export default async function EditEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [evidenceResult, relationResult, capabilityResult] = await Promise.all([
    supabase.from("evidence").select("*").eq("id", id).maybeSingle(),
    supabase.from("evidence_capabilities").select("capability_id").eq("evidence_id", id),
    supabase.from("capabilities").select("*").order("display_order"),
  ]);
  if (evidenceResult.error || relationResult.error || capabilityResult.error) throw new Error("无法读取成长证据");
  if (!evidenceResult.data) notFound();
  return <div className="records-page"><PageHeader title="编辑成长证据" description="保持简洁，只更新真正改变证据含义的内容。" /><EvidenceForm evidence={evidenceResult.data} capabilities={capabilityResult.data} selectedCapabilityIds={relationResult.data.map((item) => item.capability_id)} defaultDate={evidenceResult.data.occurred_on} /></div>;
}
